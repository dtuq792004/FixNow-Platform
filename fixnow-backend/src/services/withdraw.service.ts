import mongoose from "mongoose";
import { WithdrawRequest } from "../models/withdrawRequest.model";
import { Wallet } from "../models/wallet.model";

export const createWithdrawRequestService = async (
  userId: string,
  amount: number,
  bankName: string,
  accountNumber: string,
  accountHolder: string
) => {

  if (amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  const wallet = await Wallet.findOne({ userId });

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  if (wallet.balance < amount) {
    throw new Error("Insufficient balance");
  }

  const existingPending = await WithdrawRequest.findOne({
    userId,
    status: "PENDING"
  });

  if (existingPending) {
    throw new Error("You already have a pending withdraw request");
  }

  wallet.balance -= amount;
  wallet.pending += amount;

  await wallet.save();

  const withdrawRequest = await WithdrawRequest.create({
    userId,
    amount,
    bankName,
    accountNumber,
    accountHolder,
    status: "PENDING"
  });

  return withdrawRequest;
};

export const approveWithdrawRequestService = async (
  requestId: string,
  adminId: string
) => {

  const request = await WithdrawRequest.findById(requestId);

  if (!request) {
    throw new Error("Withdraw request not found");
  }

  if (request.status !== "PENDING") {
    throw new Error("Request already processed");
  }

  const wallet = await Wallet.findOne({ userId: request.userId });

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  wallet.pending -= request.amount;
  wallet.totalWithdrawn += request.amount;

  await wallet.save();

  request.status = "APPROVED";
  request.processedBy = new mongoose.Types.ObjectId(adminId);
  request.processedAt = new Date();

  await request.save();

  return request;
};

export const rejectWithdrawRequestService = async (
  requestId: string,
  adminId: string,
  reason: string
) => {

  const request = await WithdrawRequest.findById(requestId);

  if (!request) {
    throw new Error("Withdraw request not found");
  }

  if (request.status !== "PENDING") {
    throw new Error("Request already processed");
  }

  const wallet = await Wallet.findOne({ userId: request.userId });

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  wallet.pending -= request.amount;
  wallet.balance += request.amount;

  await wallet.save();

  request.status = "REJECTED";
  request.rejectReason = reason;
  request.processedBy = new mongoose.Types.ObjectId(adminId);
  request.processedAt = new Date();

  await request.save();

  return request;
};

export const getUserWithdrawRequestsService = async (userId: string) => {
  return WithdrawRequest.find({ userId }).sort({ createdAt: -1 });
};

export const getAllWithdrawRequestsService = async (status?: string) => {

  const filter: any = {};

  if (status) {
    filter.status = status;
  }

  return WithdrawRequest.find(filter)
    .populate("userId", "fullName email")
    .sort({ createdAt: -1 });
};
