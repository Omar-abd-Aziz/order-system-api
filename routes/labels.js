const express = require('express');
const router = express.Router();
const Labels = require('../models/labels');
const verifyToken = require('../middleware/verifyToken'); // Path to your verifyToken middleware




// Route to add or update a label
router.post('/add-or-update', verifyToken, async (req, res) => {
    const { labels, nameOfAdmin, idOfAdmin, emailOfAdmin } = req.body;

    try {
        // Find a label with the same idOfAdmin and emailOfAdmin, or create a new one if it doesn't exist
        const updatedLabel = await Labels.findOneAndUpdate(
            { idOfAdmin, emailOfAdmin }, // Search criteria
            { labels, nameOfAdmin, emailOfAdmin }, // Fields to update or set
            { new: true, upsert: true } // Return the updated document; create if it doesn't exist
        );

        res.status(200).json({ message: 'Label added or updated successfully', updatedLabel });
    } catch (error) {
        res.status(500).json({ message: 'Error adding or updating label', error });
    }
});





// Route to remove a label by idOfAdmin
router.delete('/remove/:idOfAdmin', verifyToken, async (req, res) => {
    const { idOfAdmin } = req.params;

    try {
        // Find and delete a label with the matching idOfAdmin
        const deletedLabel = await Labels.deleteOne({ idOfAdmin });

        if (deletedLabel.deletedCount === 0) {
            return res.status(404).json({ message: 'Label not found' });
        }

        res.json({ message: 'Label removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing label', error });
    }
});




// Route to get a specific label by idOfAdmin
router.get('/get/:idOfAdmin', verifyToken, async (req, res) => {
    const { idOfAdmin } = req.params;

    try {
        // Find a label with the matching idOfAdmin
        const label = await Labels.findOne({ idOfAdmin });

        if (!label) {
            return res.status(404).json({ message: 'Label not found' });
        }

        res.json({ message: 'Label retrieved successfully', label });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving label', error });
    }
});




// Route to get all labels
router.get('/all', verifyToken, async (req, res) => {
    try {
        const allLabels = await Labels.find();
        res.json({ message: 'Labels retrieved successfully', allLabels });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving labels', error });
    }
});

// Route to remove all labels
router.delete('/remove-all', verifyToken, async (req, res) => {
    try {
        await Labels.deleteMany({});
        res.json({ message: 'All labels removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing all labels', error });
    }
});

module.exports = router;
