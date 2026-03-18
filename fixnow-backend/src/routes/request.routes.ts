// import express from 'express';
// import { authMiddleware } from '../middlewares/auth.middleware'
// import { 
//     createRequest,
//     getMyRequests, 
//     cancelRequest,
//     getProviderRequests,
//     respondRequest,
//     startService,
//     uploadCompletionEvidenceController,
//     completeService,
//     confirmCompletion
//  } from '../controllers/request.controller';
// import { roleMiddleware } from '../middlewares/role.middleware';
// const router = express.Router();
// //Customer routes
// router.post('/', authMiddleware, roleMiddleware("CUSTOMER"), createRequest);
// router.get('/my-requests', authMiddleware, getMyRequests);
// router.put('/cancel/:id', authMiddleware, cancelRequest);
// router.patch('/:id/confirm-completion', authMiddleware, confirmCompletion);
// //Provider routes
// router.get('/provider-requests', authMiddleware, getProviderRequests);
// router.put('/provider-requests/:id/respond', authMiddleware, respondRequest);
// router.patch('/provider-requests/:id/start', authMiddleware, startService);
// router.post('/provider-requests/:id/upload-evidence', authMiddleware, uploadCompletionEvidenceController);
// router.patch('/provider-requests/:id/complete', authMiddleware, completeService);
// export default router;  
