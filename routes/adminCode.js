const express = require('express');
const router = express.Router();


let adminCode = "omarvenom123";

// POST endpoint to save or update a goal
router.post('/', async (req, res) => {
    const { adminCodeFromClient } = req.body;

    try { 
   

        if (adminCodeFromClient==adminCode) {
            res.status(200).json({"statue": true}); // Respond with the updated goal
        } else {
            res.status(200).json({"statue": false,"error": `${adminCodeFromClient} not true`}); // Respond with the updated goal
        }
    } catch (err) {
        console.error('Error AdminCode:', err);
        res.status(500).json({ error: 'Error AdminCode' });
    }
});



module.exports = router;