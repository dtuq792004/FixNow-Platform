import mongoose from "mongoose";
import Request from "../models/request.model";
import { Payment } from "../models/payment.model";
import { settlePayment } from "./settlement.service";

export class RequestService {

  static async providerComplete(id: string) {
    const request = await Request.findById(id);
    request!.status = "COMPLETED";
    request!.providerCompletedAt = new Date();
    await request!.save();
  }

  static async customerConfirm(id: string) {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

      const sr = await Request.findById(id).session(session);
      sr!.customerConfirmedAt = new Date();
      await sr!.save({ session });

      const payment = await Payment.findOne({
        requestId: sr!._id,
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