import Request from "../models/request.model";

/**
 * Cho phép customer chọn thanh toán khi provider hoàn thành (cash).
 * Chuyển trạng thái request từ AWAITING_PAYMENT → PENDING
 * để request xuất hiện trên job market của provider.
 */
export const payLater = async (requestId: string, customerId: string) => {
  const request = await Request.findOne({ _id: requestId, customerId });

  if (!request) {
    throw new Error("Request not found");
  }

  if (request.status !== "AWAITING_PAYMENT") {
    throw new Error(
      `Cannot switch to pay-later: request is already in '${request.status}' status`
    );
  }

  request.status = "PENDING";
  await request.save();

  return request;
};
