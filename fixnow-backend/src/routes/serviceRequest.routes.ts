import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { 
    getMyRequests, 
    cancelRequest
 } from '../controllers/serviceRequest.controller';
const router = express.Router();

router.get('/my-requests', authMiddleware, getMyRequests);
router.put('/cancel/:id', authMiddleware, cancelRequest);
export default router;  
