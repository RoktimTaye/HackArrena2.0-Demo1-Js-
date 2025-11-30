const fs = require('fs');
const path = require('path');

const saveLabResult = async ({ tenantId, requestId, buffer, mimetype, originalName }) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const useS3 = process.env.USE_S3 === 'true';

    if (useS3) {
        // S3 implementation placeholder
        // const key = `${tenantId}/lab-results/${requestId}/${originalName}`;
        // await s3.upload({ ... });
        // return `/s3/${key}`;
        throw new Error('S3 upload not implemented yet');
    } else {
        // Local storage
        const dir = path.join(uploadDir, tenantId, 'lab-results', requestId);
        fs.mkdirSync(dir, { recursive: true });
        const filePath = path.join(dir, originalName);
        fs.writeFileSync(filePath, buffer);
        return `/uploads/${tenantId}/lab-results/${requestId}/${originalName}`;
    }
};

module.exports = {
    saveLabResult,
};
