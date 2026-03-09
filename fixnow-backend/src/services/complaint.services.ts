import { Complaint, ComplaintStatus } from "../models/complaint.model";

export const createTicket = async (data: any) => {
  const ticket = await Complaint.create({
    requestId: data.requestId,
    customerId: data.customerId,
    providerId: data.providerId,
    content: data.content,
    warrantyRequested: data.warrantyRequested
  });

  return ticket;
};

export const getTickets = async (page: number, limit: number, query: any) => {
  const options = {
    page,
    limit,
    sort: { createdAt: -1 },
    populate: ["customerId", "providerId", "handledBy"]
  };

  return await Complaint.paginate(query, options);
};

export const getTicketById = async (id: string) => {
  return await Complaint.findById(id)
    .populate("customerId")
    .populate("providerId")
    .populate("handledBy");
};

export const processTicket = async (id: string, adminId: string) => {
  return await Complaint.findByIdAndUpdate(
    id,
    {
      status: ComplaintStatus.PROCESSING,
      handledBy: adminId
    },
    { new: true }
  );
};

export const resolveTicket = async (id: string, adminId: string) => {
  return await Complaint.findByIdAndUpdate(
    id,
    {
      status: ComplaintStatus.RESOLVED,
      handledBy: adminId
    },
    { new: true }
  );
};

export const getCustomerTickets = async (customerId: string, page: number, limit: number) => {
  return await Complaint.paginate(
    { customerId },
    { page, limit, sort: { createdAt: -1 } }
  );
};

export const getProviderTickets = async (providerId: string, page: number, limit: number) => {
  return await Complaint.paginate(
    { providerId },
    { page, limit, sort: { createdAt: -1 } }
  );
};