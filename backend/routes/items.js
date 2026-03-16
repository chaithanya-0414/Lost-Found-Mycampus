const express = require('express');
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { protect } = require('../utils/auth');
const { logAdminAction } = require('../utils/logger');

const router = express.Router();
const prisma = new PrismaClient();

// Multer Storage Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetypes = /image\/jpeg|image\/jpg|image\/png|image\/webp/;

        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = mimetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
    },
});

// @desc    Report a lost or found item
// @route   POST /api/items/report
router.post('/report', protect, upload.single('image'), async (req, res) => {
    const { title, description, category, status, latitude, longitude, placeName, contactPhone } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const item = await prisma.item.create({
            data: {
                title,
                description,
                category,
                status,
                imageUrl,
                contactPhone,
                userId: req.user.id,
                location: {
                    create: {
                        latitude: parseFloat(latitude),
                        longitude: parseFloat(longitude),
                        placeName,
                    },
                },
            },
            include: {
                location: true,
            },
        });

        // Trigger AI Match (Calling AI Engine asynchronously)
        const { matchItems } = require('../utils/matchingService');
        matchItems(item.id).catch(err => console.error('Matching service error:', err));

        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all items
// @route   GET /api/items
router.get('/', async (req, res) => {
    try {
        const items = await prisma.item.findMany({
            include: {
                location: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get single item details
// @route   GET /api/items/:id
router.get('/:id', async (req, res) => {
    try {
        const item = await prisma.item.findUnique({
            where: { id: req.params.id },
            include: {
                location: true,
                user: {
                    select: { name: true, email: true }
                },
                lostMatches: {
                    include: { foundItem: true }
                },
                foundMatches: {
                    include: { lostItem: true }
                }
            },
        });

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Claim an item
// @route   POST /api/items/:id/claim
router.post('/:id/claim', protect, async (req, res) => {
    const { answers } = req.body;

    try {
        // Check for existing claim by this user for this item
        const existingClaim = await prisma.claimRequest.findFirst({
            where: {
                itemId: req.params.id,
                claimantId: req.user.id,
                status: { in: ['pending', 'approved'] }
            }
        });

        if (existingClaim) {
            return res.status(400).json({ 
                message: existingClaim.status === 'approved' 
                    ? 'You already have an approved claim for this item.' 
                    : 'You already have a pending claim for this item.' 
            });
        }

        const claim = await prisma.claimRequest.create({
            data: {
                itemId: req.params.id,
                claimantId: req.user.id,
                answers: answers,
            },
        });

        res.status(201).json(claim);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all claims for an item (for the item reporter)
// @route   GET /api/items/:id/claims
router.get('/:id/claims', protect, async (req, res) => {
    try {
        const item = await prisma.item.findUnique({
            where: { id: req.params.id },
            select: { userId: true }
        });

        if (!item || item.userId !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to see these claims' });
        }

        const claims = await prisma.claimRequest.findMany({
            where: { itemId: req.params.id },
            include: { claimant: { select: { name: true, email: true } } }
        });

        res.json(claims);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Respond to a claim request (Approve/Reject)
// @route   PUT /api/items/claims/:claimId
router.put('/claims/:claimId', protect, async (req, res) => {
    const { status } = req.body; // 'approved' or 'rejected'

    try {
        const claim = await prisma.claimRequest.findUnique({
            where: { id: req.params.claimId },
            include: { item: true }
        });

        if (!claim) {
            return res.status(404).json({ message: 'Claim request not found' });
        }

        // Only the item reporter (owner) or an admin can approve/reject
        if (claim.item.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to respond to this claim' });
        }

        const updatedClaim = await prisma.claimRequest.update({
            where: { id: req.params.claimId },
            data: { status }
        });

        // If approved, update the item status to 'claimed'
        if (status === 'approved') {
            await prisma.item.update({
                where: { id: claim.itemId },
                data: { status: 'claimed' }
            });
            console.log(`Item ${claim.itemId} marked as claimed.`);
        }

        // Log if admin is responding
        if (req.user.role === 'admin' && claim.item.userId !== req.user.id) {
            await logAdminAction(req.user.id, 'RESPOND_CLAIM', req.params.claimId, `Status: ${status} for item ${claim.itemId}`);
        }

        res.json(updatedClaim);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update an item
// @route   PUT /api/items/:id
router.put('/:id', protect, upload.single('image'), async (req, res) => {
    const { title, description, category, status, latitude, longitude, placeName, contactPhone } = req.body;
    const updateData = {
        title,
        description,
        category,
        status,
        contactPhone,
    };

    if (req.file) {
        updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    try {
        const item = await prisma.item.findUnique({ where: { id: req.params.id } });
        if (!item || (item.userId !== req.user.id && req.user.role !== 'admin')) {
            return res.status(401).json({ message: 'Not authorized to update this item' });
        }

        const updatedItem = await prisma.item.update({
            where: { id: req.params.id },
            data: {
                ...updateData,
                location: {
                    update: {
                        latitude: parseFloat(latitude),
                        longitude: parseFloat(longitude),
                        placeName,
                    }
                }
            },
            include: { location: true }
        });

        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete an item
// @route   DELETE /api/items/:id
router.delete('/:id', protect, async (req, res) => {
    const { id } = req.params;
    console.log(`[Admin] Deletion request for item: ${id} by user: ${req.user.email}`);

    try {
        const item = await prisma.item.findUnique({ 
            where: { id },
            include: { location: true }
        });

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const isOwner = String(item.userId) === String(req.user.id);
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            console.log(`[Auth] Forbidden deletion attempt: ${req.user.email} -> ${id}`);
            return res.status(401).json({ 
                message: `Moderation failed. Your role is '${req.user.role}'. Only owners or Admins can delete this.` 
            });
        }

        // Execute as a transaction to ensure database integrity
        await prisma.$transaction([
            // 1. Delete all matches (both directions)
            prisma.match.deleteMany({
                where: {
                    OR: [
                        { lostItemId: id },
                        { foundItemId: id }
                    ]
                }
            }),
            // 2. Delete all claim requests
            prisma.claimRequest.deleteMany({
                where: { itemId: id }
            }),
            // 3. Delete location
            prisma.location.deleteMany({
                where: { itemId: id }
            }),
            // 4. Finally delete the item itself
            prisma.item.delete({
                where: { id }
            })
        ]);

        // Log if admin deleted it
        if (isAdmin && !isOwner) {
            await logAdminAction(req.user.id, 'DELETE_ITEM', id, `Admin deleted item: ${item.title}`);
        }

        console.log(`[Success] Item ${id} and all related records purged.`);
        res.json({ message: 'Item removed successfully' });
    } catch (error) {
        console.error('[Delete Error]', error);
        res.status(500).json({ 
            message: 'Database error during deletion. It might be linked to other records.', 
            error: error.message 
        });
    }
});

module.exports = router;
