import { Router } from 'express';
import {
  getAllFeedbacks,
  getFeedbackByProviderId,
  getFeedbackByCustomerId,
  getFeedbackByRequestId,
  searchFeedbacks,
} from '../controllers/feedback-query.controller';
import {
  createFeedback,
  replyFeedback,
} from '../controllers/feedback-write.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// ── Read ──────────────────────────────────────────────────────────────────────
router.get('/', getAllFeedbacks);
router.get('/search', searchFeedbacks);
router.get('/provider/:id', getFeedbackByProviderId);
router.get('/customer/:id', getFeedbackByCustomerId);
router.get('/request/:id', getFeedbackByRequestId);

// ── Write (auth required) ─────────────────────────────────────────────────────
router.post('/', authMiddleware, createFeedback);
router.patch('/reply/:id', authMiddleware, replyFeedback);

export default router;
