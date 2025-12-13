import { Router } from 'express';
import { createPaste, getPaste, getPasteStats, viewPaste } from '../controllers/pasteController';
import { validatePasteBody, rateLimiter } from '../middlewares';

const router = Router();

// Apply rate limiting to all routes
router.use(rateLimiter(100, 60000)); // 100 requests per minute

// API Routes
router.post('/paste', validatePasteBody, createPaste);
router.get('/paste/:id', getPaste);
router.get('/paste/:id/stats', getPasteStats);

// Public view route (with syntax highlighting)
router.get('/paste/:id/view', viewPaste);

export default router;
