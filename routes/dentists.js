const express = require("express");
const router = express.Router();
const { body, query, param, validationResult } = require("express-validator");
const Dentist = require("../models/Dentist");
const { protect } = require("../middleware/auth");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// GET /api/dentists - Fetch all dentists with search, filter, pagination
router.get("/", async (req, res, next) => {
  try {
    const {
      search,
      location,
      page = 1,
      limit = 12,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const filter = { isActive: true };

    if (search) {
      filter.$text = { $search: search };
    }
    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    const [dentists, total] = await Promise.all([
      Dentist.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Dentist.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: dentists,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dentists/:id - Get single dentist
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid dentist ID")],
  validate,
  async (req, res, next) => {
    try {
      const dentist = await Dentist.findById(req.params.id);
      if (!dentist) {
        return res
          .status(404)
          .json({ success: false, message: "Dentist not found" });
      }
      res.json({ success: true, data: dentist });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/dentists - Add new dentist (Admin only)
router.post(
  "/",
  protect,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("qualification")
      .trim()
      .notEmpty()
      .withMessage("Qualification is required"),
    body("yearsOfExperience")
      .isInt({ min: 0 })
      .withMessage("Valid years of experience required"),
    body("clinicName").trim().notEmpty().withMessage("Clinic name is required"),
    body("address").trim().notEmpty().withMessage("Address is required"),
    body("location").trim().notEmpty().withMessage("Location is required"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const dentist = await Dentist.create(req.body);
      res
        .status(201)
        .json({ success: true, data: dentist, message: "Dentist added successfully" });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/dentists/:id - Update dentist (Admin only)
router.put(
  "/:id",
  protect,
  [param("id").isMongoId().withMessage("Invalid dentist ID")],
  validate,
  async (req, res, next) => {
    try {
      const dentist = await Dentist.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!dentist) {
        return res
          .status(404)
          .json({ success: false, message: "Dentist not found" });
      }
      res.json({ success: true, data: dentist, message: "Dentist updated successfully" });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/dentists/:id - Soft delete dentist (Admin only)
router.delete(
  "/:id",
  protect,
  [param("id").isMongoId().withMessage("Invalid dentist ID")],
  validate,
  async (req, res, next) => {
    try {
      const dentist = await Dentist.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );
      if (!dentist) {
        return res
          .status(404)
          .json({ success: false, message: "Dentist not found" });
      }
      res.json({ success: true, message: "Dentist removed successfully" });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/dentists/meta/locations - Get unique locations
router.get("/meta/locations", async (req, res, next) => {
  try {
    const locations = await Dentist.distinct("location", { isActive: true });
    res.json({ success: true, data: locations.sort() });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
