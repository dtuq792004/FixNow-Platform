import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { 
    getMyRequests, 
    cancelRequest,
    getProviderRequests,
    respondRequest
 } from '../controllers/request.controller';
const router = express.Router();

router.get('/my-requests', authMiddleware, getMyRequests);
router.put('/cancel/:id', authMiddleware, cancelRequest);
router.get('/provider-requests', authMiddleware, getProviderRequests);
router.put('/provider-requests/:id/respond', authMiddleware, respondRequest);
export default router;  
