import { Types } from "mongoose";
import { Blog, BlogStatus, IBlog } from "../models/blog.model";
import { BlogReview } from "../models/blogReview.model";

type ListParams = {
  page?: string | number;
  limit?: string | number;
  search?: string;
  status?: BlogStatus;
  category?: string;
};

type BlogPayload = Partial<Pick<
  IBlog,
  | "title"
  | "slug"
  | "excerpt"
  | "category"
  | "tags"
  | "coverImage"
  | "sections"
  | "status"
  | "isFeatured"
  | "readTimeMinutes"
  | "seoTitle"
  | "seoDescription"
>>;

type BlogFilter = {
  status?: BlogStatus;
  category?: string;
  $or?: Array<Record<string, RegExp>>;
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const sanitizeRichText = (value: string) =>
  value
    .replace(/<(script|style|iframe|object|embed)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|style|iframe|object|embed)\b[^>]*\/?>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s+(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, "");

const sanitizePayload = (payload: BlogPayload): BlogPayload => ({
  ...payload,
  sections: payload.sections?.map((section) => ({
    ...section,
    label: section.label?.trim() ?? "",
    heading: section.heading?.trim() ?? "",
    content: sanitizeRichText(section.content ?? ""),
  })),
});

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

async function createUniqueSlug(value: string, excludedId?: string) {
  const base = slugify(value) || `bai-viet-${Date.now()}`;
  let slug = base;
  let suffix = 1;
  while (await Blog.exists({ slug, ...(excludedId ? { _id: { $ne: excludedId } } : {}) })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

function pagination(params: ListParams) {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(30, Math.max(1, Number(params.limit) || 9));
  return { page, limit, skip: (page - 1) * limit };
}

export async function listAdminBlogs(params: ListParams) {
  const { page, limit, skip } = pagination(params);
  const filter: BlogFilter = {};
  if (params.status) filter.status = params.status;
  if (params.category) filter.category = params.category;
  if (params.search?.trim()) {
    const regex = new RegExp(escapeRegex(params.search.trim()), "i");
    filter.$or = [{ title: regex }, { excerpt: regex }, { category: regex }, { tags: regex }];
  }

  const [items, total] = await Promise.all([
    Blog.find(filter)
      .populate("authorId", "fullName email avatar")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Blog.countDocuments(filter),
  ]);
  return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export async function listPublishedBlogs(params: ListParams) {
  const { page, limit, skip } = pagination(params);
  const filter: BlogFilter = { status: "PUBLISHED" };
  if (params.category) filter.category = params.category;
  if (params.search?.trim()) {
    const regex = new RegExp(escapeRegex(params.search.trim()), "i");
    filter.$or = [{ title: regex }, { excerpt: regex }, { category: regex }, { tags: regex }];
  }

  const [items, total] = await Promise.all([
    Blog.find(filter)
      .select("-sections")
      .populate("authorId", "fullName avatar")
      .sort({ isFeatured: -1, publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Blog.countDocuments(filter),
  ]);
  return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export async function getAdminBlog(id: string) {
  if (!Types.ObjectId.isValid(id)) throw new Error("ID bài viết không hợp lệ");
  const blog = await Blog.findById(id).populate("authorId", "fullName email avatar").lean();
  if (!blog) throw new Error("Không tìm thấy bài viết");
  return blog;
}

export async function getPublishedBlog(slug: string) {
  const blog = await Blog.findOneAndUpdate(
    { slug, status: "PUBLISHED" },
    { $inc: { viewCount: 1 } },
    { new: true },
  ).populate("authorId", "fullName avatar");
  if (!blog) throw new Error("Không tìm thấy bài viết");
  return blog;
}

export async function getBlogReviewSummary(slug: string) {
  const blog = await Blog.findOne({ slug, status: "PUBLISHED" }).select("_id");
  if (!blog) throw new Error("Không tìm thấy bài viết");

  const [summary, reviews] = await Promise.all([
    BlogReview.aggregate([
      { $match: { blogId: blog._id } },
      { $group: { _id: null, averageRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } },
    ]),
    BlogReview.find({ blogId: blog._id })
      .select("rating comment createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  return {
    averageRating: summary[0]?.averageRating ?? 0,
    totalReviews: summary[0]?.totalReviews ?? 0,
    reviews,
  };
}

export async function createBlogReview(slug: string, payload: { rating?: number; comment?: string }) {
  const blog = await Blog.findOne({ slug, status: "PUBLISHED" }).select("_id");
  if (!blog) throw new Error("Không tìm thấy bài viết");

  const rating = Number(payload.rating);
  const comment = payload.comment?.trim() ?? "";
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Vui lòng chọn điểm đánh giá từ 1 đến 5");
  }
  if (!comment) throw new Error("Vui lòng nhập nhận xét");

  await BlogReview.create({ blogId: blog._id, rating, comment });
  return getBlogReviewSummary(slug);
}

export async function createBlog(authorId: string, payload: BlogPayload) {
  if (!payload.title?.trim()) throw new Error("Tiêu đề là bắt buộc");
  const safePayload = sanitizePayload(payload);
  const status = safePayload.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  return Blog.create({
    ...safePayload,
    slug: await createUniqueSlug(safePayload.slug || safePayload.title!),
    authorId,
    status,
    publishedAt: status === "PUBLISHED" ? new Date() : null,
  });
}

export async function updateBlog(id: string, payload: BlogPayload) {
  const current = await Blog.findById(id);
  if (!current) throw new Error("Không tìm thấy bài viết");
  const safePayload = sanitizePayload(payload);
  const status = safePayload.status ?? current.status;
  const slugSource = safePayload.slug || safePayload.title;
  const update: BlogPayload & { publishedAt?: Date | null } = { ...safePayload, status };
  if (slugSource) update.slug = await createUniqueSlug(slugSource, id);
  if (status === "PUBLISHED" && !current.publishedAt) update.publishedAt = new Date();
  if (status === "DRAFT") update.publishedAt = null;
  return Blog.findByIdAndUpdate(id, update, { new: true, runValidators: true })
    .populate("authorId", "fullName email avatar");
}

export async function deleteBlog(id: string) {
  const blog = await Blog.findByIdAndDelete(id);
  if (!blog) throw new Error("Không tìm thấy bài viết");
}
