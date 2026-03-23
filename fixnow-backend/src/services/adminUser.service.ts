import User from "../models/user.model";

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

  if (search) {
    const searchRegex = new RegExp(search, "i");
    filter.$or = [
      { fullName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex }
    ];
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter)
  ]);

  return {
    users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
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