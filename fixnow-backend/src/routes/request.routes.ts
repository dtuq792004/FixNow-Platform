import { Router } from "express";
import express from 'express';
import { 
    createRequestController,
    getMyRequestsController,
    cancelRequestController,
    getAvailableRequestsController,
    respondRequestController,
    startServiceController,
    completeServiceController,
    RequestController
} from '../controllers/request.controller';

 import { authMiddleware } from '../middlewares/auth.middleware'

const router = Router();

router.post("/:id/complete", RequestController.providerComplete);

// //Customer routes
router.post('/', authMiddleware, createRequestController);

router.get('/customer', authMiddleware, getMyRequestsController);
router.patch('/:id/cancel', authMiddleware, cancelRequestController);
// //Provider routes
router.get('/provider', authMiddleware, getAvailableRequestsController);
router.patch('/:id/respond', authMiddleware, respondRequestController);
router.patch('/:id/start', authMiddleware, startServiceController);
router.patch('/:id/complete', authMiddleware, completeServiceController);
export default router;
