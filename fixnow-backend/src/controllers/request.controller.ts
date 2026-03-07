
import { Request, Response } from 'express';
import * as serviceRequestService from '../services/request.service';

//Customer
export const createRequest = async ( req: Request, res: Response,)=> {
    try {
        const { serviceId, addressId, requestType } = req.body;
        const request = await serviceRequestService.createServiceRequest(
            req.user!.id,
            serviceId,
            addressId,
            requestType
        );
        res.status(201).json({ message: "Service request created successfully", request });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
export const getMyRequests = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { status } = req.query;
        const requests = await serviceRequestService.getRequestByCustomer(
            req.user!.id, 
            status as any
        );
        res.json(requests);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// export const getRequestDetail = async (
//     req: Request,
//     res: Response,
// ): Promise<void> => {
//     try {
//         const request = await serviceRequestService.getRequestByDetail(
//             req.params.id,
//             req.user._id
//         );
//         res.json(request);
//     }   catch (error: any) {
//         res.status(400).json({ message: error.message });
//     }
// };

export const cancelRequest = async (
    req: Request<{id : string}>,
    res: Response,
): Promise<void> => {
    try {
        const request = await serviceRequestService.cancelServiceRequest(
            req.params.id ,
            req.user!.id
        );
        res.json({ message: "Request cancelled successfully", request });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const confirmCompletion = async (req: Request, res: Response) => {
    try {
        const result = await serviceRequestService.confirmServiceRequestCompletion(
            req.params.id as string,
            req.user!.id
        );
        res.json({ message: "Service completion confirmed", data: result});
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }   
};

//Provider
export const getProviderRequests = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const status  = req.query.status as any;
        const requests = await serviceRequestService.getRequestForProvider(
            req.user!.id,
            status
        );
        res.json(requests);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
 
export const respondRequest = async (
    req: Request<{id: string}>,
    res: Response,
): Promise<void> => {
    try {        
        const { action } = req.body;
        const request = 
        await serviceRequestService.respondToRequest(
            req.params.id,
            req.user!.id,
            action
        );
        res.json({ message: "Request responded to successfully", request });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const startService = async (req: Request, res: Response) => {
    try {
        const result = await serviceRequestService.startServiceRequest(
            req.params.id as string, 
            req.user!.id
        );
        res.json({ message: "Service request started", data: result});
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const uploadCompletionEvidenceController = async (req: Request, res: Response) => {
    try {
        const result = await serviceRequestService.uploadCompletionEvidence(
            req.params.id as string,
            req.user!.id,
            req.body.mediaUrls,
            req.body.note
        );
        res.json({ message: "Evidence uploaded successfully", data: result });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
 
export const completeService = async (req: Request, res: Response) => {
    try {
        const result = await serviceRequestService.completeServiceRequest(
            req.params.id as string,
            req.user!.id
        );
        res.json({ message: "Service request completed", data: result});
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};



