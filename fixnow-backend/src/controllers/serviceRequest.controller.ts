import { Request, Response } from 'express';
import * as serviceRequestService from "../services/serviceRequest.service";

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
