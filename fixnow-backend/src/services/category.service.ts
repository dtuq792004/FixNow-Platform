import Category from "../models/category.model";

// CREATE
export const createCategory = async (data: any) => {
  const category = await Category.create(data);
  return category;
};

// GET ALL
export const getCategories = async () => {
  const categories = await Category.find().sort({ createdAt: -1 });
  return categories;
};

// GET WITH STATS (Provider count)
export const getCategoriesWithStats = async () => {
  const categories = await Category.find().sort({ name: 1 });
  
  // Aggregate provider counts from Provider model
  const providerCounts = await (require("../models/provider.model").Provider).aggregate([
    { $unwind: "$serviceCategories" },
    { $group: { _id: "$serviceCategories", count: { $sum: 1 } } }
  ]);

  const countMap = providerCounts.reduce((acc: any, curr: any) => {
    acc[curr._id.toString()] = curr.count;
    return acc;
  }, {});

  return categories.map(cat => ({
    ...cat.toObject(),
    providerCount: countMap[cat._id.toString()] || 0
  }));
};

// GET BY ID
export const getCategoryById = async (id: string) => {
  const category = await Category.findById(id);

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

// UPDATE
export const updateCategory = async (id: string, data: any) => {
  const category = await Category.findByIdAndUpdate(
    id,
    data,
    { new: true }
  );

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

// DELETE
export const deleteCategory = async (id: string) => {
  const category = await Category.findByIdAndDelete(id);

  if (!category) {
    throw new Error("Category not found");
  }

  return true;
};