import { Address } from "../models/address.model";
import { Types } from "mongoose";
import ServiceRequest from "../models/request.model";
import { geocodeAddress } from "./geocoding.service";

type AddressData = {
  label?: string;
  addressLine?: string;
  ward?: string;
  district?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
};

const hasCoordinates = (data: AddressData) =>
  typeof data.latitude === "number" && typeof data.longitude === "number";

export const createAddress = async (userId: string, data: AddressData) => {
  const resolvedData = { ...data };
  if (!hasCoordinates(resolvedData)) {
    const coordinates = await geocodeAddress(resolvedData);
    if (coordinates) {
      resolvedData.latitude = coordinates.latitude;
      resolvedData.longitude = coordinates.longitude;
    }
  }

  if (data.isDefault) {
    await Address.updateMany(
      { userId },
      { isDefault: false }
    );
  }

  const address = await Address.create({
    ...resolvedData,
    userId,
  });

  return address;
};

export const updateAddress = async (
  addressId: string,
  userId: string,
  data: AddressData
) => {
  const currentAddress = await Address.findOne({ _id: addressId, userId });
  if (!currentAddress) return null;

  const resolvedData = { ...data };
  const addressChanged = ["addressLine", "ward", "district", "city"]
    .some((field) => field in data);
  if (addressChanged && !hasCoordinates(resolvedData)) {
    const coordinates = await geocodeAddress({
      addressLine: resolvedData.addressLine ?? currentAddress.addressLine,
      ward: resolvedData.ward ?? currentAddress.ward,
      district: resolvedData.district ?? currentAddress.district,
      city: resolvedData.city ?? currentAddress.city,
    });
    resolvedData.latitude = coordinates?.latitude;
    resolvedData.longitude = coordinates?.longitude;
  }

  if (data.isDefault) {
    await Address.updateMany(
      { userId },
      { isDefault: false }
    );
  }

  const address = await Address.findOneAndUpdate(
    { _id: addressId, userId },
    resolvedData,
    { new: true }
  );

  return address;
};

export const deleteAddress = async (addressId: string, userId: string) => {
  const result = await Address.findOneAndDelete({
    _id: addressId,
    userId,
  });

  return result;
};

export const getUserAddresses = async (userId: string) => {
  return Address.find({ userId }).sort({ createdAt: -1 });
};

export const setDefaultAddress = async (userId: string, addressId: string) => {
  await Address.updateMany(
    { userId },
    { isDefault: false }
  );

  const address = await Address.findOneAndUpdate(
    { _id: addressId, userId },
    { isDefault: true },
    { new: true }
  );

  return address;
};

export const getServiceHistory = async (userId: string) => {
  const history = await ServiceRequest.find({
    customerId: userId,
  })
    .populate("providerId", "fullName phone")
    .populate("serviceId", "name price")
    .sort({ createdAt: -1 });

  return history;
};
