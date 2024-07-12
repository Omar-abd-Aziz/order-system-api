// routes/goals.js
const express = require('express');
const router = express.Router();
const Goal = require('../models/goal'); // Adjust path as necessary

// POST endpoint to save or update a goal
router.post('/', async (req, res) => {
    const { totalPrice ,goal, date, count } = req.body;

    try {
        // Check if a goal with the same date exists
        let existingGoal = await Goal.findOne({ date });

        if (existingGoal) {
            // If goal exists for this date, update it
            existingGoal.goal = goal; // Update the goal value
            existingGoal.count = count; // Update the goal value
            existingGoal.totalPrice = totalPrice; // Update the goal value
            await existingGoal.save(); // Save the updated goal

            res.status(200).json(existingGoal); // Respond with the updated goal
        } else {
            // If no goal exists for this date, create a new one
            const newGoal = new Goal({ totalPrice ,goal, date, count });
            await newGoal.save();

            res.status(201).json(newGoal); // Respond with the newly created goal
        }
    } catch (err) {
        console.error('Error saving or updating goal:', err);
        res.status(500).json({ error: 'Failed to save or update goal' });
    }
});

// GET endpoint to retrieve all goals
router.get('/', async (req, res) => {
    try {
        const goals = await Goal.find();

        res.status(200).json(goals);
    } catch (err) {
        console.error('Error fetching goals:', err);
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});

// GET endpoint to retrieve a specific goal by date
router.get('/:date', async (req, res) => {
    const { date } = req.params;

    try {
        const goal = await Goal.findOne({ date });

        if (!goal) {
            return res.status(404).json({ "statue": false,error: 'Goal not found' });
        }

        res.status(200).json({"statue": true, "goal": goal});
    } catch (err) {
        console.error('Error fetching goal:', err);
        res.status(500).json({ "statue": false,error: 'Failed to fetch goal' });
    }
});





// DELETE endpoint to delete a goal by date
router.delete('/:date', async (req, res) => {
    const { date } = req.params;

    try {
        const deletedGoal = await Goal.findOneAndDelete({ date });

        if (!deletedGoal) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        res.status(200).json({ message: 'Goal deleted successfully', deletedGoal });
    } catch (err) {
        console.error('Error deleting goal:', err);
        res.status(500).json({ error: 'Failed to delete goal' });
    }
});






module.exports = router;
