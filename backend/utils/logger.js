const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const logAdminAction = async (adminId, action, targetId = null, details = null) => {
    try {
        await prisma.adminLog.create({
            data: {
                adminId,
                action,
                targetId,
                details
            }
        });
        console.log(`[AdminLog] ${action} by ${adminId} on ${targetId || 'N/A'}`);
    } catch (error) {
        console.error('[AdminLog Error]', error);
    }
};

module.exports = { logAdminAction };
