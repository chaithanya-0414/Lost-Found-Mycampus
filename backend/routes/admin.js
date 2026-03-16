const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { protect } = require('../utils/auth');

const router = express.Router();
const prisma = new PrismaClient();
const adminAuth = require('../middleware/adminAuth');
const { logAdminAction } = require('../utils/logger');

// @desc    Get all users for management
// @route   GET /api/admin/users
router.get('/users', protect, adminAuth, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: { items: true, claimRequests: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
router.delete('/users/:id', protect, adminAuth, async (req, res) => {
    try {
        // Prevent admin from deleting themselves
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'You cannot delete your own account from here.' });
        }

        await prisma.user.delete({
            where: { id: req.params.id }
        });

        await logAdminAction(req.user.id, 'DELETE_USER', req.params.id, `Deleted user ID: ${req.params.id}`);
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get platform stats
// @route   GET /api/admin/stats
router.get('/stats', protect, adminAuth, async (req, res) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalItems = await prisma.item.count();
        const lostItems = await prisma.item.count({ where: { status: 'lost' } });
        const foundItems = await prisma.item.count({ where: { status: 'found' } });
        const claimedItems = await prisma.item.count({ where: { status: 'claimed' } });
        
        const categoryCounts = await prisma.item.groupBy({
            by: ['category'],
            _count: true
        });

        res.json({
            users: totalUsers,
            items: totalItems,
            lost: lostItems,
            found: foundItems,
            claimed: claimedItems,
            categories: categoryCounts.reduce((acc, curr) => {
                acc[curr.category] = curr._count;
                return acc;
            }, {})
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all admin logs
// @route   GET /api/admin/logs
router.get('/logs', protect, adminAuth, async (req, res) => {
    try {
        const logs = await prisma.adminLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
