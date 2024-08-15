// routes/goals.js
const express = require('express');
const router = express.Router();
const Goal = require('../models/goal'); // Adjust path as necessary
const verifyToken = require('../middleware/verifyToken');



// POST endpoint to save or update a goal
router.post('/',verifyToken, async (req, res) => {
    const idOfAdmin = req.query.idOfAdmin;

    // Check if idOfAdmin is provided
    if (!idOfAdmin) {
      return res.status(400).json({ message: 'idOfAdmin is required.' });
    }

    const { totalPrice, goal, date, count } = req.body;

    try {
        // Check if a goal with the same date and idOfAdmin exists
        let existingGoal = await Goal.findOne({ date, idOfAdmin });

        if (existingGoal) {
            // If goal exists for this date and idOfAdmin, update it
            existingGoal.goal = goal; // Update the goal value
            existingGoal.count = count; // Update the count value
            existingGoal.totalPrice = totalPrice; // Update the totalPrice value
            await existingGoal.save(); // Save the updated goal

            res.status(200).json(existingGoal); // Respond with the updated goal
        } else {
            // If no goal exists for this date and idOfAdmin, create a new one
            const newGoal = new Goal({ totalPrice, goal, date, count, idOfAdmin });
            await newGoal.save();

            res.status(201).json(newGoal); // Respond with the newly created goal
        }
    } catch (err) {
        console.error('Error saving or updating goal:', err);
        res.status(500).json({ error: 'Failed to save or update goal' });
    }
});






// GET endpoint to retrieve all goals with idOfAdmin
router.get('/',verifyToken, async (req, res) => {
    const idOfAdmin = req.query.idOfAdmin;

    // Check if idOfAdmin is provided
    if (!idOfAdmin) {
        return res.status(400).json({ message: 'idOfAdmin is required.' });
    }

    try {
        // Find all goals for the specified idOfAdmin
        const goals = await Goal.find({ idOfAdmin });

        res.status(200).json({ status: true, goals });
    } catch (err) {
        console.error('Error fetching goals:', err);
        res.status(500).json({ status: false, error: 'Failed to fetch goals' });
    }
});






// GET endpoint to retrieve a specific goal by date and idOfAdmin
router.get('/:date',verifyToken, async (req, res) => {
    const idOfAdmin = req.query.idOfAdmin;

    // Check if idOfAdmin is provided
    if (!idOfAdmin) {
      return res.status(400).json({ message: 'idOfAdmin is required.' });
    }

    const { date } = req.params;

    try {
        // Find the goal by date and idOfAdmin
        const goal = await Goal.findOne({ date, idOfAdmin });

        if (!goal) {
            return res.status(404).json({ status: false, error: 'Goal not found' });
        }

        res.status(200).json({ status: true, goal });
    } catch (err) {
        console.error('Error fetching goal:', err);
        res.status(500).json({ status: false, error: 'Failed to fetch goal' });
    }
});







// DELETE endpoint to delete a goal by date and idOfAdmin
router.delete('/:date',verifyToken, async (req, res) => {
    const idOfAdmin = req.query.idOfAdmin;

    // Check if idOfAdmin is provided
    if (!idOfAdmin) {
        return res.status(400).json({ message: 'idOfAdmin is required.' });
    }

    const { date } = req.params;

    try {
        // Attempt to find and delete the goal by date and idOfAdmin
        const deletedGoal = await Goal.findOneAndDelete({ date, idOfAdmin });

        if (!deletedGoal) {
            return res.status(404).json({ status: false, error: 'Goal not found' });
        }

        res.status(200).json({ status: true, message: 'Goal deleted successfully', deletedGoal });
    } catch (err) {
        console.error('Error deleting goal:', err);
        res.status(500).json({ status: false, error: 'Failed to delete goal' });
    }
});





module.exports = router;
