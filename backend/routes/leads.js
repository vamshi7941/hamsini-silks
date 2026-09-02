import express from 'express';
import * as leadController from '../controllers/leadController.js';

const router = express.Router();

router.post('/', leadController.createLead);
router.get('/', leadController.listLeads);

// POST /api/leads/import-customers - bulk import all customers into leads
router.post('/import-customers', leadController.importCustomers);

export default router;
