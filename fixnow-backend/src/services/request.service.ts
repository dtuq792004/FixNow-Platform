import Request, { RequestStatus } from "../models/request.model";
import mongoose from "mongoose";
//Customer
export const createServiceRequest  = async (
    customerId: string,
    serviceId: string,
    addressId: string,
    requestType: "NORMAL" | "URGENT" | "RECURRING"
) => {  
    const request = await Request.create({
        customer: customerId,
        service: serviceId,
        address: addressId,
        requestType,
        status: "PENDING"
    });
    return request;
};
export const getRequestByCustomer = async (
    customerId: string, 
    status?: RequestStatus
) => {
    const filter: any = { customerId: new mongoose.Types.ObjectId(customerId) };
    if (status) {
        filter.status = status;
    }
    return await Request.find(filter)
        .populate("serviceId", "name price")
        .populate("providerId", "fullName phone")
        .sort({ createdAt: -1 });
};

export const getRequestByDetail = async (
    requestId: string,
    customerId: string
) => {
    const request = await Request.findById(requestId)
        if (!request) {
            throw new Error("Service request not found");
        }
        if (request.customer.toString() !== customerId) {
            throw new Error("Access denied");
        }
        return request;
};

export const cancelServiceRequest = async (
    requestId: string,
    customerId: string
) => {
    const request = await Request.findById(requestId);
    if (!request) {
        throw new Error("Service request not found");
    }
    if (request.customer.toString() !== customerId) {
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
};

export const confirmServiceRequestCompletion = async ( 
    requestId: string, 
    customerId: string
) => {
    const request = await Request.findById(requestId);
    if (!request) {
        throw new Error("Service request not found");
    }

    if (!request.customer) {
        throw new Error("Customer not found in request");
    }
    if (request.customer.toString() !== customerId) {
        throw new Error("Access denied");
    }
    if (request.status !== "WAITING_CUSTOMER_CONFIRM") {
        throw new Error("Only requests waiting for customer confirmation can be confirmed");
    }
    request.status = "COMPLETED";
    request.customerConfirmedAt = new Date();
    await request.save();

    return request;
};

//Provider
export const getRequestForProvider = async (
    providerId: string,
    status?: RequestStatus
) => {
    const filter: any = { provider: new mongoose.Types.ObjectId(providerId) };
    if (status) {
        filter.status = status;
    }

    filter.$for = [
        { $eq: ["$status", "PENDING"] },
        { providerId: new mongoose.Types.ObjectId(providerId) },
    ];

    return await Request.find(filter)
        .populate("serviceId", "name price")
        .populate("customerId", "fullName phone")
        .sort({ createdAt: -1 });
};

export const respondToRequest = async (
    requestId: string,
    providerId: string,
    action: "ACCEPT" | "REJECT"
) => {
    const request = await Request.findById(requestId);
    if (!request) {
        throw new Error("Service request not found");
    }
    if (request.provider?.toString() !== providerId) {
        throw new Error("Access denied");
    }
    if (request.status !== "PENDING") {
        throw new Error("Only pending requests can be responded to");
    }

    if (action === "ACCEPT") {
        request.status = "ACCEPTED";
        request.provider = new mongoose.Types.ObjectId(providerId);
    }
    if (action === "REJECT") {
        request.status = "REJECTED";
    }
    await request.save();

    return request;
};

export const startServiceRequest = async ( 
    requestId: string, 
    providerId: string 
) => {
    const request = await Request.findById(requestId);
    if (!request) {
        throw new Error("Service request not found");
    }
    if (request.provider?.toString() !== providerId) {
        throw new Error("Access denied");
    }
    if (request.status !== "ACCEPTED") {
        throw new Error("Only accepted requests can be started");
    }
    request.status = "IN_PROGRESS";
    request.startAt = new Date();
    await request.save();

    return request;
};

export const uploadCompletionEvidence  = async (
    requestId: string,
    providerId: string,
    mediaUrls: string[],
    note: string
) => {
    const request = await Request.findById(requestId);
    if (!request) {
        throw new Error("Service request not found");
    }
    if (request.provider?.toString() !== providerId) {
        throw new Error("Access denied");
    }
    if (request.status !== "IN_PROGRESS") {
        throw new Error("Only in-progress requests can have completion evidence uploaded");
    }
    request.completionMedia = mediaUrls;
    request.completionNote = note;

    await request.save();

    return request;
};

export const completeServiceRequest = async ( requestId: string, providerId: string ) => {
    const request = await Request.findById(requestId);
    if (!request) {
        throw new Error("Service request not found");
    }
    if (request.provider?.toString() !== providerId) {
        throw new Error("Access denied");
    }
    if (request.status !== "IN_PROGRESS") {
        throw new Error("Only in-progress requests can be completed");
    }
    request.status = "WAITING_CUSTOMER_CONFIRM";
    request.providerCompletedAt = new Date();
    await request.save();

    return request;
};


