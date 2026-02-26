export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Tên đăng nhập và mật khẩu là bắt buộc" });
    }

    const user = (await User.findOne({ username })
      .select("+password")) as UserDocument | null;

    if (!user || user.status !== "Active") {
      return res
        .status(401)
        .json({ message: "Thông tin đăng nhập không hợp lệ" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Thông tin đăng nhập không hợp lệ" });
    }

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      ACCESS_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    const refreshToken = crypto.randomBytes(64).toString("hex");

    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_TTL,
    });

    return res.json({
      message: "Đăng nhập thành công",
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};