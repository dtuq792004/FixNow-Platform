import Request, { IRequest, RequestType } from "../models/request.model";

class RequestService {
  async createRequest(data: Partial<IRequest>) {
    const request = await Request.create({
      ...data,
      requestType: "NORMAL",
    });
    return request;
  }

  async createUrgentRequest(data: Partial<IRequest>) {
    const request = await Request.create({
      ...data,
      requestType: "URGENT",
      status: "PENDING", // có thể ưu tiên xử lý ở logic khác
    });
    return request;
  }

  async createRecurringRequest(data: Partial<IRequest>) {
    // đơn giản: lưu như NORMAL nhưng type khác
    const request = await Request.create({
      ...data,
      requestType: "RECURRING",
    });

    return request;
  }

  async getCustomerRequests(customerId: string) {
    return Request.find({ customerId }).populate("serviceId providerId");
  }
}

export default new RequestService();