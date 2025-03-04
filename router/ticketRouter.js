const express = require('express');
const Ticket = require('../model/ticket'); // Assume you create a Ticket model
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Create a ticket
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, description } = req.body;
        const ticket = new Ticket({
            title,
            description,
            userId: req.user.id
        });
        await ticket.save();
        res.status(201).json(ticket);
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ message: 'Error creating ticket' });
    }
});

// Get tickets (for both users and admins)
router.get('/', authMiddleware, async (req, res) => {
    try {
        let tickets;
        if (req.user.role === 'admin') {
            tickets = await Ticket.find().populate('userId', 'username email');
        } else {
            tickets = await Ticket.find({ userId: req.user.id });
        }
        res.json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ message: 'Error fetching tickets' });
    }
});

// Update ticket status (admin only)
router.put('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const { status } = req.body;
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        res.json(ticket);
    } catch (error) {
        console.error('Error updating ticket:', error);
        res.status(500).json({ message: 'Error updating ticket' });
    }
});

module.exports = router; 