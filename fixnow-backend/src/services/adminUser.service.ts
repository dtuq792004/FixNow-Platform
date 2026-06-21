import User from "../models/user.model";

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getUsers = async (
  role?: string,
  status?: string,
  search?: string,
  page: number = 1,
  limit: number = 5
) => {
  const filter: any = {};

  if (role && role !== "ALL") {
    filter.role = role;
  }

  if (status && status !== "ALL") {
    filter.status = status;
  }

  if (search?.trim()) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [
      { fullName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex }
    ];
  }

  const safePage = Math.max(1, page || 1);
  const safeLimit = Math.min(100, Math.max(1, limit || 10));
  const skip = (safePage - 1) * safeLimit;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    User.countDocuments(filter)
  ]);

  return {
    users,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.max(1, Math.ceil(total / safeLimit))
  };
};

export const getUserById = async (userId: string) => {
  const user = await User.findById(userId).select("-passwordHash");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const updateUserStatus = async (
  userId: string,
  status: "ACTIVE" | "INACTIVE" | "BANNED"
) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { status },
    { new: true }
  ).select("-passwordHash");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const deleteUser = async (userId: string) => {
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};
