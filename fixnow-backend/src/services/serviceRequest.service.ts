import mongoose from "mongoose";
import { ServiceRequest } from "../models/serviceRequest.model";
import { Payment } from "../models/payment.model";
import { settlePayment } from "./settlement.service";

export class ServiceRequestService {

  static async providerComplete(id: string) {
    const sr = await ServiceRequest.findById(id);
    sr!.status = "COMPLETED";
    sr!.completedAt = new Date();
    await sr!.save();
  }

  static async customerConfirm(id: string) {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

      const sr = await ServiceRequest.findById(id).session(session);
      sr!.customerConfirmedAt = new Date();
      await sr!.save({ session });

      const payment = await Payment.findOne({
        serviceRequestId: sr!._id,
        status: "SUCCESS"
      }).session(session);

      await settlePayment(payment);

      await session.commitTransaction();

    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }
  
}