import { Category } from "../models/category.model.js";

export const addCategory = async (req, res) => {
  try {
    const { title, description } = req.body;
    const categoryCreation = await Category.create({
      title,
      description,
    });
    if (categoryCreation) {
      const responsePayload = {
        status: 200,
        message: "The category has been created.",
        data: null,
        error: null,
      };
      return res.status(200).json(responsePayload);
    } else {
      const responsePayload = {
        status: 500,
        message: null,
        data: null,
        error: "Sorry, the category can not be created.",
      };
      return res.status(500).json(responsePayload);
    }
  } catch (err) {
    console.log(err);
    const responsePayload = {
      status: 500,
      message: null,
      data: null,
      error: "Internal server error.",
    };
    return res.status(500).json(responsePayload);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteCategory = await Category.findByIdAndDelete(id);
    if (deleteCategory) {
      const responsePayload = {
        status: 200,
        message: "The category has been deleted successfully.",
        data: null,
        error: null,
      };
      return res.status(200).json(responsePayload);
    }
  } catch (err) {
    console.log(err);
    const responsePayload = {
      status: 500,
      message: null,
      data: null,
      error: "Internal server error.",
    };
    return res.status(500).json(responsePayload);
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const updateCategory = await Category.findByIdAndUpdate(
      id,
      {
        $set: {
          title: title,
          description: description,
        },
      },
      {
        new: true,
      }
    );

    if (updateCategory) {
      const responsePayload = {
        status: 200,
        message: "The category has been added successfully.",
        data: null,
        error: null,
      };
      return res.status(200).json(responsePayload);
    } else {
      const responsePayload = {
        status: 200,
        message: null,
        data: null,
        error: "Category can not be updated.",
      };
      return res.status(200).json(responsePayload);
    }
  } catch (err) {
    console.log(err);
    const responsePayload = {
      status: 500,
      message: null,
      data: null,
      error: "Internal server error.",
    };
    return res.status(500).json(responsePayload);
  }
};

export const listAllCategory = async (req, res) => {
  try {
    // Extract query parameters for search, pagination, and sorting
    const {
      search,
      page = 1,
      limit = 1,
      sortBy = "createdAt",
      order = "asc",
    } = req.body;

    // Set up search query if a search term is provided
    const searchQuery = search
      ? { title: { $regex: search, $options: "i" } } // case-insensitive search on 'name' field
      : {};

    // Convert page and limit to integers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Set sorting order, either 'asc' for ascending or 'desc' for descending
    const sortOrder = order === "asc" ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    // Fetch categories based on search, pagination, and sorting options
    const categoryList = await Category.find(searchQuery)
      .sort(sortOptions)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    // Fetch the total count for pagination
    const totalCategories = await Category.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalCategories / limitNum);

    // Build response payload
    const responsePayload = {
      status: 200,
      message:
        categoryList.length > 0
          ? "Category list"
          : "Sorry, there is no category.",
      data: {
        categories: categoryList,
        pagination: {
          totalCategories,
          currentPage: pageNum,
          totalPages,
          pageSize: limitNum,
        },
      },
      error: null,
    };

    return res.status(200).json(responsePayload);
  } catch (err) {
    console.error(err);
    const responsePayload = {
      status: 500,
      message: null,
      data: null,
      error: "Internal server error.",
    };
    return res.status(500).json(responsePayload);
  }
};
