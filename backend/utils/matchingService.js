const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

const matchItems = async (itemId) => {
    try {
        const currentItem = await prisma.item.findUnique({
            where: { id: itemId },
            include: { location: true }
        });

        if (!currentItem || !currentItem.imageUrl) return;

        // 1. Get embedding from AI Engine
        const filePath = path.join(__dirname, '..', currentItem.imageUrl);
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));

        const response = await axios.post(`${AI_ENGINE_URL}/extract-features`, form, {
            headers: { ...form.getHeaders() }
        });

        const { features } = response.data;

        // 2. Save embedding to current item
        await prisma.item.update({
            where: { id: itemId },
            data: { embeddings: features }
        });

        // 3. Find potential matches
        // For simplicity, we fetch all items of opposite status and compute similarity
        const targetStatus = currentItem.status === 'lost' ? 'found' : 'lost';
        const candidates = await prisma.item.findMany({
            where: { 
                status: targetStatus,
                embeddings: { not: null }
            }
        });

        for (const candidate of candidates) {
            const simResponse = await axios.post(`${AI_ENGINE_URL}/similarity`, {
                vector1: features,
                vector2: candidate.embeddings
            });

            const { similarity } = simResponse.data;

            // Matching Logic: Score = 0.5 * image_similarity + 0.3 * category_match + 0.2 * location_distance
            // For now, let's just use image similarity
            if (similarity > 0.85) {
                const lostItemId = currentItem.status === 'lost' ? currentItem.id : candidate.id;
                const foundItemId = currentItem.status === 'found' ? currentItem.id : candidate.id;

                await prisma.match.upsert({
                    where: { 
                        lostItemId_foundItemId: { lostItemId, foundItemId } 
                    },
                    update: { similarityScore: similarity },
                    create: { lostItemId, foundItemId, similarityScore: similarity }
                });
            }
        }

    } catch (error) {
        console.error('Error in AI matching service:', error.message);
    }
};

module.exports = { matchItems };
