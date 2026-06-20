import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose, { Model, Types } from "mongoose";

import User from "../models/user.model";
import { Address } from "../models/address.model";
import Category from "../models/category.model";
import { Provider } from "../models/provider.model";
import Service from "../models/service.model";
import { ProviderRequest } from "../models/providerRequest.model";
import Request from "../models/request.model";
import { Payment } from "../models/payment.model";
import { Wallet } from "../models/wallet.model";
import { WithdrawRequest } from "../models/withdrawRequest.model";
import { Promotion } from "../models/promotion.model";
import { PlatformSetting } from "../models/platformSetting.model";
import { ServiceHistory } from "../models/serviceHistory.model";
import Feedback from "../models/feedback.model";
import { Complaint } from "../models/complaint.model";
import Conversation from "../models/conversation.model";
import Message from "../models/message.model";
import { Location } from "../models/location.model";
import { Notification } from "../models/notification.model";
import Session from "../models/session.model";

const SEED_SIZE = 5;
const BASE_REVENUE_SEED_SIZE = 40;
const RECENT_DAILY_REVENUE_SEED_SIZE = 30;
const REVENUE_SEED_SIZE =
  BASE_REVENUE_SEED_SIZE + RECENT_DAILY_REVENUE_SEED_SIZE;
const id = (group: number, index: number) =>
  new Types.ObjectId(`${group.toString(16).padStart(2, "0")}${index.toString(16).padStart(22, "0")}`);

const ids = {
  users: Array.from({ length: SEED_SIZE }, (_, i) => id(1, i + 1)),
  addresses: Array.from({ length: SEED_SIZE }, (_, i) => id(2, i + 1)),
  categories: Array.from({ length: SEED_SIZE }, (_, i) => id(3, i + 1)),
  providers: Array.from({ length: SEED_SIZE }, (_, i) => id(4, i + 1)),
  services: Array.from({ length: SEED_SIZE }, (_, i) => id(5, i + 1)),
  providerRequests: Array.from({ length: SEED_SIZE }, (_, i) => id(6, i + 1)),
  requests: Array.from({ length: SEED_SIZE }, (_, i) => id(7, i + 1)),
  payments: Array.from({ length: SEED_SIZE }, (_, i) => id(8, i + 1)),
  wallets: Array.from({ length: SEED_SIZE }, (_, i) => id(9, i + 1)),
  withdrawals: Array.from({ length: SEED_SIZE }, (_, i) => id(10, i + 1)),
  promotions: Array.from({ length: SEED_SIZE }, (_, i) => id(11, i + 1)),
  settings: Array.from({ length: SEED_SIZE }, (_, i) => id(12, i + 1)),
  histories: Array.from({ length: SEED_SIZE }, (_, i) => id(13, i + 1)),
  feedbacks: Array.from({ length: SEED_SIZE }, (_, i) => id(14, i + 1)),
  complaints: Array.from({ length: SEED_SIZE }, (_, i) => id(15, i + 1)),
  conversations: Array.from({ length: SEED_SIZE }, (_, i) => id(16, i + 1)),
  messages: Array.from({ length: SEED_SIZE }, (_, i) => id(17, i + 1)),
  locations: Array.from({ length: SEED_SIZE }, (_, i) => id(18, i + 1)),
  notifications: Array.from({ length: SEED_SIZE }, (_, i) => id(19, i + 1)),
  sessions: Array.from({ length: SEED_SIZE }, (_, i) => id(20, i + 1)),
  revenueRequests: Array.from({ length: REVENUE_SEED_SIZE }, (_, i) => id(21, i + 1)),
  revenuePayments: Array.from({ length: REVENUE_SEED_SIZE }, (_, i) => id(22, i + 1)),
  daNangCustomer: id(1, 6),
  daNangAddress: id(2, 6),
  daNangRequest: id(7, 6),
};

async function upsertMany(model: Model<any>, documents: Record<string, unknown>[]) {
  await model.bulkWrite(
    documents.map((document) => ({
      updateOne: {
        filter: { _id: document._id },
        update: { $set: document },
        upsert: true,
      },
    })),
  );
}

async function upsertManyWithExactTimestamps(
  model: Model<any>,
  documents: Record<string, unknown>[],
) {
  await model.collection.bulkWrite(
    documents.map((document) => ({
      updateOne: {
        filter: { _id: document._id as Types.ObjectId },
        update: { $set: document },
        upsert: true,
      },
    })),
  );
}

async function seed() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error("MONGO_URI is not defined in .env");

  await mongoose.connect(mongoUri);
  console.log(`Connected to MongoDB database: ${mongoose.connection.name}`);

  const passwordHash = await bcrypt.hash("FixNow@123", 10);
  const now = new Date();
  const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await upsertMany(
    User,
    [
      ...ids.users.map((_id, i) => ({
        _id,
        email: `seed.user${i + 1}@fixnow.local`,
        passwordHash,
        fullName: `Người dùng mẫu ${i + 1}`,
        phone: `090000000${i + 1}`,
        role: i < 2 ? "CUSTOMER" : i < 4 ? "PROVIDER" : "ADMIN",
        status: "ACTIVE",
        isEmailVerified: true,
      })),
      {
        _id: ids.daNangCustomer,
        email: "customer.danang@fixnow.local",
        passwordHash,
        fullName: "Nguyễn Minh Anh",
        phone: "0905123456",
        role: "CUSTOMER",
        status: "ACTIVE",
        isEmailVerified: true,
      },
    ],
  );

  const categorySeed = [
    {
      name: "Điện dân dụng",
      type: "electrical",
      description: "Sửa chữa điện, ổ cắm và thiết bị điện",
      iconUrl: "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.7.2/svgs/solid/bolt.svg",
    },
    {
      name: "Điện nước",
      type: "plumbing",
      description: "Xử lý rò rỉ, đường ống và thiết bị nước",
      iconUrl: "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.7.2/svgs/solid/droplet.svg",
    },
    {
      name: "Máy lạnh",
      type: "hvac",
      description: "Vệ sinh, bảo trì và sửa chữa máy lạnh",
      iconUrl: "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.7.2/svgs/solid/snowflake.svg",
    },
    {
      name: "Gia dụng",
      type: "appliance",
      description: "Sửa chữa thiết bị gia dụng tại nhà",
      iconUrl: "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.7.2/svgs/solid/blender.svg",
    },
    {
      name: "Sơn sửa",
      type: "painting",
      description: "Sơn mới, chống thấm và hoàn thiện nhà",
      iconUrl: "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.7.2/svgs/solid/paint-roller.svg",
    },
  ];
  await upsertMany(
    Category,
    ids.categories.map((_id, i) => ({
      _id,
      ...categorySeed[i],
      isActive: true,
    })),
  );

  await upsertMany(
    Address,
    [
      ...ids.addresses.map((_id, i) => ({
        _id,
        userId: ids.users[i],
        label: i === 0 ? "Nhà riêng" : `Địa chỉ mẫu ${i + 1}`,
        addressLine: `${10 + i} Nguyễn Huệ`,
        ward: `Phường ${i + 1}`,
        district: `Quận ${i + 1}`,
        city: "TP. Hồ Chí Minh",
        latitude: 10.77 + i * 0.01,
        longitude: 106.69 + i * 0.01,
        isDefault: true,
      })),
      {
        _id: ids.daNangAddress,
        userId: ids.daNangCustomer,
        label: "Nhà riêng Đà Nẵng",
        addressLine: "24 Trần Phú",
        ward: "Thạch Thang",
        district: "Hải Châu",
        city: "Đà Nẵng",
        latitude: 16.07576,
        longitude: 108.22278,
        isDefault: true,
      },
    ],
  );

  await upsertMany(
    Provider,
    ids.providers.map((_id, i) => ({
      _id,
      userId: ids.users[i],
      description: `Kỹ thuật viên FixNow mẫu ${i + 1}`,
      experienceYears: i + 2,
      activeStatus: i % 2 === 0 ? "ONLINE" : "OFFLINE",
      verified: true,
      serviceCategories: [ids.categories[i]],
      workingAreas: [`Quận ${i + 1}`, "TP. Hồ Chí Minh"],
    })),
  );

  await upsertMany(
    Service,
    ids.services.map((_id, i) => ({
      _id,
      providerId: ids.users[i],
      categoryId: ids.categories[i],
      name: `Dịch vụ sửa chữa mẫu ${i + 1}`,
      description: `Kiểm tra và xử lý sự cố mẫu ${i + 1}`,
      price: 150000 + i * 50000,
      unit: i % 2 === 0 ? "job" : "hour",
      status: "APPROVED",
      image: [`https://picsum.photos/seed/fixnow-service-${i + 1}/900/520`],
    })),
  );

  await upsertMany(
    ProviderRequest,
    ids.providerRequests.map((_id, i) => ({
      _id,
      userId: ids.users[i],
      fullName: `Ứng viên mẫu ${i + 1}`,
      phone: `091000000${i + 1}`,
      experience: `${i + 1} năm kinh nghiệm`,
      specialties: [ids.categories[i]],
      serviceArea: `Quận ${i + 1}, TP. Hồ Chí Minh`,
      idCard: `07920000000${i + 1}`,
      motivation: "Muốn cung cấp dịch vụ chất lượng trên FixNow",
      status: i < 3 ? "APPROVED" : i === 3 ? "PENDING" : "REJECTED",
      reviewedBy: i === 3 ? undefined : ids.users[4],
      reviewedAt: i === 3 ? undefined : now,
      rejectionReason: i === 4 ? "Cần bổ sung hồ sơ chuyên môn" : undefined,
    })),
  );

  const requestStatuses = ["COMPLETED", "IN_PROGRESS", "ACCEPTED", "PENDING", "CANCELLED"];
  await upsertMany(
    Request,
    [
      ...ids.requests.map((_id, i) => ({
        _id,
        customerId: ids.users[i % 2],
        providerId: ids.users[i],
        categoryId: ids.categories[i],
        services: [ids.services[i]],
        addressId: ids.addresses[i % 2],
        addressText: `${10 + i} Nguyễn Huệ, TP. Hồ Chí Minh`,
        title: `Yêu cầu sửa chữa mẫu ${i + 1}`,
        description: `Khách hàng cần xử lý sự cố mẫu ${i + 1}`,
        note: "Vui lòng liên hệ trước khi đến",
        media: [],
        requestType: i === 1 ? "URGENT" : i === 2 ? "RECURRING" : "NORMAL",
        totalPrice: 150000 + i * 50000,
        discountAmount: i * 10000,
        finalPrice: 150000 + i * 40000,
        promoCode: i === 0 ? "FIXNOW10" : undefined,
        status: requestStatuses[i],
        startAt: new Date(now.getTime() + i * 24 * 60 * 60 * 1000),
        providerCompletedAt: i === 0 ? now : undefined,
        completionMedia: i === 0 ? ["https://example.com/fixnow/completed-1.jpg"] : [],
        completionNote: i === 0 ? "Đã hoàn thành và kiểm tra hoạt động" : undefined,
      })),
      {
        _id: ids.daNangRequest,
        customerId: ids.daNangCustomer,
        providerId: ids.users[2],
        categoryId: ids.categories[2],
        services: [ids.services[2]],
        addressId: ids.daNangAddress,
        addressText: "24 Trần Phú, Thạch Thang, Hải Châu, Đà Nẵng",
        title: "Kiểm tra và sửa máy lạnh tại Đà Nẵng",
        description: "Máy lạnh hoạt động nhưng không mát, cần kiểm tra gas và vệ sinh hệ thống.",
        note: "Vui lòng gọi khách hàng trước khi đến khoảng 15 phút.",
        media: [],
        requestType: "NORMAL",
        totalPrice: 250000,
        discountAmount: 0,
        finalPrice: 250000,
        status: "ACCEPTED",
        startAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        completionMedia: [],
      },
    ],
  );

  const paymentStatuses = ["SUCCESS", "PENDING", "SUCCESS", "FAILED", "REFUNDED"];
  await upsertMany(
    Payment,
    ids.payments.map((_id, i) => {
      const amount = 150000 + i * 40000;
      const platformFee = amount * 0.2;
      return {
        _id,
        requestId: ids.requests[i],
        customerId: ids.users[i % 2],
        providerId: ids.users[i],
        orderCode: 260620000 + i,
        amount,
        platformFee,
        providerAmount: amount - platformFee,
        status: paymentStatuses[i],
        transactionRef: `SEED-TXN-${i + 1}`,
      };
    }),
  );

  const revenueSeedDates = createRevenueSeedDates(now);
  const revenueAmounts = Array.from({ length: REVENUE_SEED_SIZE }, (_, i) =>
    180000 + ((i * 73000) % 620000),
  );
  const revenueProviderUserId = ids.users[2];

  await upsertManyWithExactTimestamps(
    Request,
    ids.revenueRequests.map((_id, i) => {
      const amount = revenueAmounts[i];
      const createdAt = revenueSeedDates[i];
      return {
        _id,
        customerId: ids.users[i % 2],
        providerId: revenueProviderUserId,
        categoryId: ids.categories[i % ids.categories.length],
        services: [ids.services[i % ids.services.length]],
        addressId: ids.addresses[i % 2],
        addressText: `${20 + (i % 10)} Nguyễn Huệ, TP. Hồ Chí Minh`,
        title: `Công việc doanh thu mẫu ${i + 1}`,
        description: `Dữ liệu mẫu phục vụ biểu đồ doanh thu provider ${i + 1}`,
        note: "Dữ liệu được tạo tự động bằng seed",
        media: [],
        requestType: i % 7 === 0 ? "URGENT" : "NORMAL",
        totalPrice: amount,
        discountAmount: 0,
        finalPrice: amount,
        status: "COMPLETED",
        startAt: createdAt,
        providerCompletedAt: createdAt,
        completionMedia: [],
        completionNote: "Đã hoàn thành công việc mẫu",
        createdAt,
        updatedAt: createdAt,
      };
    }),
  );

  await upsertManyWithExactTimestamps(
    Payment,
    ids.revenuePayments.map((_id, i) => {
      const amount = revenueAmounts[i];
      const platformFee = Math.round(amount * 0.2);
      const createdAt = revenueSeedDates[i];
      return {
        _id,
        requestId: ids.revenueRequests[i],
        customerId: ids.users[i % 2],
        providerId: revenueProviderUserId,
        orderCode: 260700000 + i,
        amount,
        platformFee,
        providerAmount: amount - platformFee,
        status: "SUCCESS",
        transactionRef: `SEED-REVENUE-TXN-${String(i + 1).padStart(2, "0")}`,
        createdAt,
        updatedAt: createdAt,
      };
    }),
  );

  const seededProviderRevenue = revenueAmounts.reduce(
    (sum, amount) => sum + amount - Math.round(amount * 0.2),
    0,
  );
  await upsertMany(
    Wallet,
    ids.wallets.map((_id, i) => ({
      _id,
      userId: ids.users[i],
      balance: i === 2 ? seededProviderRevenue : 500000 + i * 100000,
      pending: i * 50000,
      totalEarned: i === 2 ? seededProviderRevenue : 1000000 + i * 200000,
      totalWithdrawn: i * 100000,
    })),
  );

  await upsertMany(
    WithdrawRequest,
    ids.withdrawals.map((_id, i) => ({
      _id,
      userId: ids.users[i],
      amount: 100000 + i * 50000,
      status: i < 2 ? "APPROVED" : i < 4 ? "PENDING" : "REJECTED",
      bankName: ["Vietcombank", "Techcombank", "MB Bank", "ACB", "BIDV"][i],
      accountNumber: `100000000${i + 1}`,
      accountHolder: `NGUOI DUNG MAU ${i + 1}`,
      processedBy: i === 2 || i === 3 ? undefined : ids.users[4],
      rejectReason: i === 4 ? "Thông tin tài khoản chưa chính xác" : undefined,
      processedAt: i === 2 || i === 3 ? undefined : now,
    })),
  );

  await upsertMany(
    Promotion,
    ids.promotions.map((_id, i) => ({
      _id,
      code: i === 0 ? "FIXNOW10" : `SEEDPROMO${i + 1}`,
      discountType: i % 2 === 0 ? "PERCENT" : "AMOUNT",
      discountValue: i % 2 === 0 ? 10 + i * 5 : 20000 + i * 10000,
      usageLimit: 100 + i * 50,
      usedCount: i * 3,
      expiredAt: future,
      isActive: i !== 4,
    })),
  );

  await upsertMany(
    PlatformSetting,
    ids.settings.map((_id, i) => ({
      _id,
      platformFeePercent: 15 + i,
      minWithdrawAmount: 100000 + i * 25000,
      updatedBy: ids.users[4],
    })),
  );

  await upsertMany(
    ServiceHistory,
    ids.histories.map((_id, i) => ({
      _id,
      customerId: ids.users[i % 2],
      providerId: ids.providers[i],
      serviceId: ids.services[i],
      addressId: ids.addresses[i % 2],
      status: i < 4 ? "COMPLETED" : "CANCELLED",
      completedAt: i < 4 ? now : undefined,
    })),
  );

  await upsertMany(
    Feedback,
    ids.feedbacks.map((_id, i) => ({
      _id,
      requestId: ids.requests[i],
      customerId: ids.users[i % 2],
      providerId: ids.providers[i],
      providerReply: i % 2 === 0 ? "Cảm ơn bạn đã sử dụng dịch vụ FixNow" : undefined,
      status: i === 4 ? "HIDDEN" : "VISIBLE",
      servicesFeedbacks: [
        {
          serviceId: ids.services[i],
          rating: 5 - (i % 3),
          comment: `Đánh giá dịch vụ mẫu ${i + 1}`,
        },
      ],
    })),
  );

  await upsertMany(
    Complaint,
    ids.complaints.map((_id, i) => ({
      _id,
      requestId: ids.requests[i],
      customerId: ids.users[i % 2],
      providerId: ids.users[i],
      content: `Nội dung khiếu nại mẫu ${i + 1}`,
      warrantyRequested: i % 2 === 0,
      status: i < 2 ? "RESOLVED" : i < 4 ? "PROCESSING" : "OPEN",
      handledBy: i === 4 ? undefined : ids.users[4],
    })),
  );

  await upsertMany(
    Conversation,
    ids.conversations.map((_id, i) => ({
      _id,
      participants: [ids.users[i % 2], ids.users[i]],
      lastMessage: ids.messages[i],
    })),
  );

  await upsertMany(
    Message,
    ids.messages.map((_id, i) => ({
      _id,
      conversationId: ids.conversations[i],
      sender: ids.users[i],
      content: i === 3
        ? "https://example.com/fixnow/chat-image-4.jpg"
        : `Tin nhắn trao đổi mẫu ${i + 1}`,
      type: i === 3 ? "IMAGE" : "TEXT",
      seen: i < 3,
    })),
  );

  await upsertMany(
    Location,
    ids.locations.map((_id, i) => ({
      _id,
      providerId: ids.users[i],
      lat: i === 2 ? 16.06591 : 10.77 + i * 0.01,
      lng: i === 2 ? 108.22066 : 106.69 + i * 0.01,
      accuracy: 5 + i,
      heading: i * 45,
      speed: i * 2,
      isOnline: i % 2 === 0,
      lastSeenAt: now,
    })),
  );

  const notificationTypes = [
    "SYSTEM",
    "TICKET_CREATED",
    "TICKET_RESOLVED",
    "WARRANTY_REQUESTED",
    "SYSTEM",
  ];
  await upsertMany(
    Notification,
    ids.notifications.map((_id, i) => ({
      _id,
      recipientId: ids.users[i],
      title: `Thông báo mẫu ${i + 1}`,
      message: `Nội dung thông báo FixNow mẫu ${i + 1}`,
      type: notificationTypes[i],
      entityId: ids.requests[i],
      entityType: "Request",
      isRead: i < 2,
    })),
  );

  await upsertMany(
    Session,
    ids.sessions.map((_id, i) => ({
      _id,
      userId: ids.users[i],
      refreshToken: `seed-refresh-token-${i + 1}-fixnow`,
      expiresAt: future,
    })),
  );

  const models: Array<[string, Model<any>, Types.ObjectId[]]> = [
    ["User", User, [...ids.users, ids.daNangCustomer]],
    ["Address", Address, [...ids.addresses, ids.daNangAddress]],
    ["Category", Category, ids.categories],
    ["Provider", Provider, ids.providers],
    ["Service", Service, ids.services],
    ["ProviderRequest", ProviderRequest, ids.providerRequests],
    ["Request", Request, [...ids.requests, ids.daNangRequest]],
    ["Payment", Payment, ids.payments],
    ["Wallet", Wallet, ids.wallets],
    ["WithdrawRequest", WithdrawRequest, ids.withdrawals],
    ["Promotion", Promotion, ids.promotions],
    ["PlatformSetting", PlatformSetting, ids.settings],
    ["ServiceHistory", ServiceHistory, ids.histories],
    ["Feedback", Feedback, ids.feedbacks],
    ["Complaint", Complaint, ids.complaints],
    ["Conversation", Conversation, ids.conversations],
    ["Message", Message, ids.messages],
    ["Location", Location, ids.locations],
    ["Notification", Notification, ids.notifications],
    ["Session", Session, ids.sessions],
    ["Revenue Request", Request, ids.revenueRequests],
    ["Revenue Payment", Payment, ids.revenuePayments],
  ];

  const recentRevenueByDay = await Payment.aggregate<{
    _id: string;
    count: number;
  }>([
    {
      $match: {
        _id: { $in: ids.revenuePayments.slice(BASE_REVENUE_SEED_SIZE) },
        status: "SUCCESS",
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
            timezone: "Asia/Ho_Chi_Minh",
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  console.log("\nSeed verification:");
  for (const [name, model, modelIds] of models) {
    const count = await model.countDocuments({ _id: { $in: modelIds } });
    console.log(`${name.padEnd(20)} ${count}/${modelIds.length}`);
  }
  console.log("Recent revenue days:", recentRevenueByDay);

  console.log("\nCustomer login: seed.user1@fixnow.local / FixNow@123");
  console.log("Provider chart login: seed.user3@fixnow.local / FixNow@123");
  console.log("Da Nang customer login: customer.danang@fixnow.local / FixNow@123");
  console.log(`Da Nang request: ${ids.daNangRequest.toString()}`);
}

function createRevenueSeedDates(now: Date) {
  const dates: Date[] = [];

  // Hai giao dịch mỗi ngày trong 7 ngày gần nhất.
  for (let dayOffset = 6; dayOffset >= 0; dayOffset -= 1) {
    for (let entry = 0; entry < 2; entry += 1) {
      const date = new Date(now);
      date.setDate(date.getDate() - dayOffset);
      date.setHours(9 + entry * 6, 15 + dayOffset, 0, 0);
      dates.push(date);
    }
  }

  // Giao dịch trải đều 11 tháng trước để biểu đồ 12 tháng có xu hướng rõ.
  for (let monthOffset = 11; monthOffset >= 1; monthOffset -= 1) {
    const entriesInMonth = monthOffset <= 10 ? 2 : 1;
    for (let entry = 0; entry < entriesInMonth; entry += 1) {
      const date = new Date(now);
      date.setDate(8 + entry * 12);
      date.setMonth(date.getMonth() - monthOffset);
      date.setHours(10 + entry * 4, monthOffset, 0, 0);
      dates.push(date);
    }
  }

  // Năm hiện tại đã có dữ liệu phía trên; thêm dữ liệu cho bốn năm trước.
  for (let yearOffset = 4; yearOffset >= 1; yearOffset -= 1) {
    const date = new Date(now);
    date.setFullYear(date.getFullYear() - yearOffset);
    date.setMonth((yearOffset * 2) % 12, 15);
    date.setHours(11, yearOffset * 5, 0, 0);
    dates.push(date);
  }

  // Điểm bổ sung để tổng số payment mẫu đạt đúng 40.
  const extraDate = new Date(now);
  extraDate.setFullYear(extraDate.getFullYear() - 2);
  extraDate.setMonth(9, 22);
  extraDate.setHours(14, 30, 0, 0);
  dates.push(extraDate);

  // Thêm 30 payment: 6 giao dịch/ngày cho 5 ngày trước, không tính hôm nay.
  for (let dayOffset = 5; dayOffset >= 1; dayOffset -= 1) {
    for (let entry = 0; entry < 6; entry += 1) {
      const date = new Date(now);
      date.setDate(date.getDate() - dayOffset);
      date.setHours(8 + entry * 2, 5 + entry * 7, 0, 0);
      dates.push(date);
    }
  }

  return dates;
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
