const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret_key', {
        expiresIn: '30d',
    });
};

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
            
            // Fetch full user from DB to ensure we have the most current role
            const user = await prisma.user.findUnique({ 
                where: { id: decoded.id },
                select: { id: true, role: true, name: true, email: true }
            });

            if (!user) {
                console.error('User not found in DB for ID:', decoded.id);
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            req.user = user;
            console.log(`Auth Success: User ${user.email} (Role: ${user.role})`);
            next();
        } catch (error) {
            console.error('Token verification failed:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { generateToken, protect };
