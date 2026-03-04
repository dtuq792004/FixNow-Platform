import ServiceRequest, { IServiceRequest, RequestStatus } from "../models/serviceRequest.model";
import mongoose from "mongoose";
//Customer
export const getRequestByCustomer = async (
    customerId: string, 
    status?: RequestStatus
): Promise<IServiceRequest[]> => {
    const filter: any = { customerId: new mongoose.Types.ObjectId(customerId) };
    if (status) {
        filter.status = status;
    }
    return await ServiceRequest.find(filter)
        .populate("serviceId", "name price")
        .populate("providerId", "fullName phone")
        .sort({ createdAt: -1 });
};

export const getRequestByDetail = async (
    requestId: string,
    customerId: string
): Promise<IServiceRequest> => {
    const request = await ServiceRequest.findById(requestId)
        if (!request) {
            throw new Error("Service request not found");
        }
        if (request.customerId.toString() !== customerId) {
            throw new Error("Access denied");
        }
        return request;
};

export const cancelServiceRequest = async (
    requestId: string,
    customerId: string
): Promise<IServiceRequest> => {
    const request = await ServiceRequest.findById(requestId);
    if (!request) {
        throw new Error("Service request not found");
    }
    if (request.customerId.toString() !== customerId) {
        throw new Error("Access denied");
    }
    // if (request.status !== "PENDING") {
    //     throw new Error("Only pending requests can be cancelled");
    // }
    if (["PENDING", "ACCEPTED"].includes(request.status)) {
        throw new Error("Only pending or accepted requests can be cancelled");
    }
    request.status = "CANCELLED";
    await request.save();

    return request;
}

