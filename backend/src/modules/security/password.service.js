// backend/src/modules/security/password.service.js
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const Tenant = require('../tenants/tenant.model');
const { getTenantConnection } = require('../../config/tenantDbManager');
const { getUserModel } = require('../users/user.model');
const { getPasswordResetTokenModel, getPasswordHistoryModel } = require('./password.model');
const { validatePassword } = require('../../utils/passwordPolicy');
const { sendEmail } = require('../../utils/emailService');
const { logger } = require('../../config/logger');

const PASSWORD_HISTORY_LIMIT = 3;

/**
 * Ensure newPassword is not equal to any of last N password hashes.
 */
const ensureNotInPasswordHistory = async (tenantConnection, userId, newPassword, currentHash) => {
    const PasswordHistory = getPasswordHistoryModel(tenantConnection);

    const histories = await PasswordHistory.find({ userId })
        .sort({ createdAt: -1 })
        .limit(PASSWORD_HISTORY_LIMIT);

    // Include current hash as well to prevent reusing it
    const hashes = [currentHash, ...histories.map((h) => h.passwordHash)];

    for (const hash of hashes) {
        if (!hash) continue;
        const isSame = await bcrypt.compare(newPassword, hash);
        if (isSame) {
            throw {
                status: 400,
                message: 'New password must not match your last 3 passwords',
            };
        }
    }
};

/**
 * Save current password hash into history
 */
const savePasswordToHistory = async (tenantConnection, userId, passwordHash) => {
    const PasswordHistory = getPasswordHistoryModel(tenantConnection);

    if (!passwordHash) return;

    await PasswordHistory.create({ userId, passwordHash });

    // Keep only latest PASSWORD_HISTORY_LIMIT entries
    const count = await PasswordHistory.countDocuments({ userId });
    if (count > PASSWORD_HISTORY_LIMIT) {
        const toDelete = count - PASSWORD_HISTORY_LIMIT;
        await PasswordHistory.find({ userId })
            .sort({ createdAt: 1 })
            .limit(toDelete)
            .deleteMany();
    }
};

/**
 * FORGOT PASSWORD
 * - user provides tenantDomain and usernameOrEmail
 * - we create a reset token and (optionally) send email
 */
const forgotPassword = async ({ tenantDomain, usernameOrEmail }) => {
    if (!tenantDomain || !usernameOrEmail) {
        throw { status: 400, message: 'tenantDomain and usernameOrEmail are required' };
    }

    const tenant = await Tenant.findOne({ domain: tenantDomain });
    if (!tenant) {
        throw { status: 404, message: 'Hospital not found' };
    }

    if (tenant.status !== 'ACTIVE') {
        throw { status: 403, message: 'Hospital is not active' };
    }

    const tenantConnection = await getTenantConnection(tenant.tenantId);
    const User = getUserModel(tenantConnection);

    const value = usernameOrEmail.trim();
    const user = await User.findOne({
        $or: [{ username: value }, { email: value }],
    });

    if (!user) {
        // For security, don't reveal that user doesn't exist
        return { message: 'If the account exists, a reset link has been sent.' };
    }

    const resetTokenValue = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const PasswordResetToken = getPasswordResetTokenModel(tenantConnection);
    await PasswordResetToken.create({
        userId: user._id.toString(),
        tenantId: tenant.tenantId,
        token: resetTokenValue,
        expiresAt,
        used: false,
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?tenant=${tenant.domain}&token=${resetTokenValue}`;

    // Send email (or just log if email not configured)
    await sendEmail({
        to: user.email,
        subject: 'Password Reset - Hospital Management System',
        text: `You requested a password reset. Use this link: ${resetLink}`,
        html: `<p>You requested a password reset.</p>
           <p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });

    logger.info(`Password reset token created for user ${user.username} in tenant ${tenant.tenantId}`);

    // For dev/hackathon, we can return token explicitly (don't do this in real prod)
    return {
        message: 'If the account exists, a reset link has been sent.',
        resetToken: resetTokenValue,
    };
};

/**
 * RESET PASSWORD with token
 */
const resetPassword = async ({ tenantDomain, token, newPassword }) => {
    if (!tenantDomain || !token || !newPassword) {
        throw { status: 400, message: 'tenantDomain, token, and newPassword are required' };
    }

    const tenant = await Tenant.findOne({ domain: tenantDomain });
    if (!tenant) {
        throw { status: 404, message: 'Hospital not found' };
    }

    const tenantConnection = await getTenantConnection(tenant.tenantId);
    const PasswordResetToken = getPasswordResetTokenModel(tenantConnection);
    const User = getUserModel(tenantConnection);

    const resetToken = await PasswordResetToken.findOne({ token });

    if (
        !resetToken ||
        resetToken.used ||
        !resetToken.expiresAt ||
        resetToken.expiresAt < new Date() ||
        resetToken.tenantId !== tenant.tenantId
    ) {
        throw { status: 400, message: 'Invalid or expired reset token' };
    }

    const user = await User.findById(resetToken.userId);
    if (!user) {
        throw { status: 404, message: 'User not found' };
    }

    // Password policy check
    const { valid, errors } = validatePassword(newPassword);
    if (!valid) {
        throw { status: 400, message: errors.join('. ') };
    }

    // Ensure not reusing last 3 passwords
    await ensureNotInPasswordHistory(tenantConnection, user._id.toString(), newPassword, user.passwordHash);

    // Save old hash to history
    await savePasswordToHistory(tenantConnection, user._id.toString(), user.passwordHash);

    // Update user password
    const newHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newHash;
    user.status = 'ACTIVE';
    user.forcePasswordChange = false;
    await user.save();

    // Mark token used
    resetToken.used = true;
    resetToken.usedAt = new Date();
    await resetToken.save();

    logger.info(`Password reset successfully for user ${user.username} in tenant ${tenant.tenantId}`);

    return { message: 'Password has been reset successfully' };
};

/**
 * CHANGE PASSWORD (authenticated user)
 */
const changePassword = async (tenantConnection, userFromToken, { oldPassword, newPassword }) => {
    if (!oldPassword || !newPassword) {
        throw { status: 400, message: 'oldPassword and newPassword are required' };
    }

    const User = getUserModel(tenantConnection);
    const user = await User.findById(userFromToken.userId);

    if (!user) {
        throw { status: 404, message: 'User not found' };
    }

    // Verify old password
    const matches = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!matches) {
        throw { status: 400, message: 'Old password is incorrect' };
    }

    // Validate new password
    const { valid, errors } = validatePassword(newPassword);
    if (!valid) {
        throw { status: 400, message: errors.join('. ') };
    }

    // Ensure not reusing last 3
    await ensureNotInPasswordHistory(tenantConnection, user._id.toString(), newPassword, user.passwordHash);

    // Save old hash to history
    await savePasswordToHistory(tenantConnection, user._id.toString(), user.passwordHash);

    // Update password
    const newHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newHash;
    user.forcePasswordChange = false;
    user.status = 'ACTIVE';
    await user.save();

    logger.info(`User ${user.username} changed password successfully`);

    return { message: 'Password changed successfully' };
};

module.exports = {
    forgotPassword,
    resetPassword,
    changePassword,
};
