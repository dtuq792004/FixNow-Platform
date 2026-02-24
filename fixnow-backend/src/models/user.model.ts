import mongoose, {
  Schema,
  InferSchemaType,
  HydratedDocument,
} from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: 4,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      match: [/^(0[3|5|7|8|9])[0-9]{8}$/, "Invalid phone number"],
    },

    role: {
      type: String,
      enum: ["Customer", "Provider", "Admin"],
      default: "Customer",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "Banned"],
      default: "Active",
    },

    avatarUrl: {
      type: String,
      default: null,
    },
    otp: {
      type: String,
      default: null,
    },

    otpExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

/* ================= TYPES ================= */
export type User = InferSchemaType<typeof userSchema>;

export type UserDocument = HydratedDocument<User> & {
  comparePassword(candidatePassword: string): Promise<boolean>;
};

/* ================= MIDDLEWARE ================= */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* ================= METHODS ================= */
userSchema.methods.comparePassword = async function (
  this: UserDocument,
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this.password);
};

/* ---------------- HIDE SENSITIVE FIELDS ---------------- */
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.otp;
    delete ret.otpExpires;
    return ret;
  },
});

export const User = mongoose.model("User", userSchema, "users");
