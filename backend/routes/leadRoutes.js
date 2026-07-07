const express = require('express');
const multer = require('multer');
const leadController = require('../controllers/leadController');

const router = express.Router();

// Configure multer for file memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Bind paths to controller actions
router.post('/upload', upload.single('file'), leadController.uploadCSV);
router.post('/import-batch', leadController.importBatch);
router.post('/import', leadController.importAll);
router.get('/leads', leadController.getLeads);
router.put('/leads/:id', leadController.updateLead);
router.delete('/leads/:id', leadController.deleteLead);

module.exports = router;
