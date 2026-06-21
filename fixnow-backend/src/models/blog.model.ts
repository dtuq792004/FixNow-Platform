import mongoose, { Document, Schema, Types } from "mongoose";

export type BlogStatus = "DRAFT" | "PUBLISHED";

export interface IBlogImage {
  url: string;
  alt?: string;
  caption?: string;
}

export interface IBlogSection {
  label?: string;
  heading: string;
  content: string;
  images: IBlogImage[];
  quote?: string;
  tips: string[];
}

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  coverImage: IBlogImage;
  sections: IBlogSection[];
  status: BlogStatus;
  isFeatured: boolean;
  readTimeMinutes: number;
  seoTitle?: string;
  seoDescription?: string;
  authorId: Types.ObjectId;
  publishedAt?: Date | null;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const imageSchema = new Schema<IBlogImage>(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, trim: true, default: "" },
    caption: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const sectionSchema = new Schema<IBlogSection>(
  {
    label: { type: String, trim: true, default: "", maxlength: 80 },
    heading: { type: String, trim: true, default: "", maxlength: 180 },
    content: { type: String, required: true, trim: true },
    images: { type: [imageSchema], default: [] },
    quote: { type: String, trim: true, default: "" },
    tips: { type: [String], default: [] },
  },
  { _id: true },
);

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, required: true, trim: true, maxlength: 500 },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    tags: { type: [String], default: [] },
    coverImage: { type: imageSchema, required: true },
    sections: {
      type: [sectionSchema],
      required: true,
      validate: {
        validator: (sections: IBlogSection[]) => sections.length > 0,
        message: "Bài viết phải có ít nhất một phần nội dung",
      },
    },
    status: { type: String, enum: ["DRAFT", "PUBLISHED"], default: "DRAFT" },
    isFeatured: { type: Boolean, default: false },
    readTimeMinutes: { type: Number, min: 1, default: 5 },
    seoTitle: { type: String, trim: true, maxlength: 180, default: "" },
    seoDescription: { type: String, trim: true, maxlength: 320, default: "" },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    publishedAt: { type: Date, default: null },
    viewCount: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true },
);

blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ title: "text", excerpt: "text", category: "text", tags: "text" });

export const Blog = mongoose.model<IBlog>("Blog", blogSchema);
