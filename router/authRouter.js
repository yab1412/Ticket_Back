const express = require('express');
const User = require('../model/user');
const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({ username, email, password, role });
        await user.save();
        
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Error registering user.' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({ email });
        console.log('User found:', user ? 'Yes' : 'No');
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        console.log('Login successful for user:', email);
        
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET
        );

        res.json({
            token,
            role: user.role,
            message: 'Login successful'
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in.' });
    }
});

// Add a debug route to check stored users
router.get('/debug/users', async (req, res) => {
    try {
        const users = await User.find({}, { email: 1, role: 1 }); // Don't include passwords
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

module.exports = router;
