import Service from "../models/service.model";

const normalizeServicePrice = (data: any) => {
  if (data.price === undefined) return data;

  const price = Number(data.price);
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Giá dịch vụ phải là số lớn hơn hoặc bằng 0");
  }

  return { ...data, price };
};

export const createService = async (providerId: string, data: any) => {

  const service = await Service.create({
    ...normalizeServicePrice(data),
    providerId,
    status: "PENDING"
  });

  return service;
};


export const getServices = async (query: any) => {
  const { keyword, categoryId, minPrice, maxPrice } = query;

  const filter: any = {
    status: "APPROVED"
  };

  if (keyword) {
    filter.name = { $regex: keyword, $options: "i" };
  }

  if (categoryId) {
    filter.categoryId = categoryId;
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  return Service.find(filter).populate("categoryId providerId");
};


export const getServicesByCategory = async (categoryId: string) => {
  const services = await Service.find({ categoryId, status: "APPROVED" }).populate("categoryId");
  return services;
};

export const getProviderServices = async (providerId: string) => {
  return Service.find({ providerId })
    .populate("categoryId", "name type")
    .sort({ createdAt: -1 });
};


export const updateService = async (
  serviceId: string,
  providerId: string,
  data: any
) => {

  const service = await Service.findOneAndUpdate(
    {
      _id: serviceId,
      providerId
    },
    normalizeServicePrice(data),
    { new: true, runValidators: true }
  );

  if (!service) {
    throw new Error("Service not found or unauthorized");
  }

  return service;
};


export const deleteService = async (
  serviceId: string,
  providerId: string
) => {

  const service = await Service.findOneAndDelete({
    _id: serviceId,
    providerId
  });

  if (!service) {
    throw new Error("Service not found or unauthorized");
  }

  return service;
};

export const approveService = async (serviceId: string) => {

  const service = await Service.findByIdAndUpdate(
    serviceId,
    { status: "APPROVED" },
    { new: true }
  );

  if (!service) {
    throw new Error("Service not found");
  }

  return service;
};

export const rejectService = async (serviceId: string) => {

  const service = await Service.findByIdAndUpdate(
    serviceId,
    { status: "REJECTED" },
    { new: true }
  );

  if (!service) {
    throw new Error("Service not found");
  }

  return service;
};
