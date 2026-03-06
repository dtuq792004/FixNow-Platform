import { Router } from 'express';
import * as feedbackController from '../controllers/feedback.controller';

const router = Router();

router.get('/', feedbackController.getAllFeedbacks);
router.get('/provider/:id', feedbackController.getFeedbackByProviderId); // lấy feedback của riêng 1 thằng provider
router.get('/customer/:id', feedbackController.getFeedbackByCustomerId); // lấy tất cả feedback của 1 thằng customer, những cái nó từng feedback
router.post('/', feedbackController.createFeedback);
router.get('/search', feedbackController.searchFeedbacks);
router.get("/request/:id",feedbackController.getFeedbackByRequestId);
router.patch("/reply/:id",feedbackController.replyFeedback);

export default router;
