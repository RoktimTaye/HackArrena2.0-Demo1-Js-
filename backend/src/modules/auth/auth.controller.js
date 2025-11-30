const authService = require('./auth.service');

const login = async (req, res, next) => {
    try {
        const { tenantId, tenantDomain, username, password } = req.body;

        const result = await authService.login({ tenantId, tenantDomain, username, password });

        res.json({
            success: true,
            message: 'Login successful',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        const result = await authService.refreshTokens(refreshToken);

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        const result = await authService.logout();
        res.json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    login,
    refreshToken,
    logout,
};
