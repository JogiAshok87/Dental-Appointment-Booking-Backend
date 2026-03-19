const express = require("express");
const router = express.Router();
const { body, query, param, validationResult } = require("express-validator");
const Appointment = require("../models/Appointment");
const { protect } = require("../middleware/auth");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// GET /api/appointments - Fetch all appointments (Admin)
router.get("/", protect, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      dentist,
      search,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (dentist) filter.dentist = dentist;
    if (search) {
      filter.patientName = { $regex: search, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate("dentist", "name clinicName location photo specialization")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Appointment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: appointments,
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

// GET /api/appointments/stats - Appointment statistics (Admin)
router.get("/stats", protect, async (req, res, next) => {
  try {
    const [total, booked, confirmed, completed, cancelled] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: "Booked" }),
      Appointment.countDocuments({ status: "Confirmed" }),
      Appointment.countDocuments({ status: "Completed" }),
      Appointment.countDocuments({ status: "Cancelled" }),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCount = await Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow },
    });

    res.json({
      success: true,
      data: { total, booked, confirmed, completed, cancelled, today: todayCount },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/appointments - Create appointment (Public)
router.post(
  "/",
  [
    body("patientName")
      .trim()
      .notEmpty()
      .withMessage("Patient name is required")
      .isLength({ max: 100 })
      .withMessage("Name too long"),
    body("age")
      .isInt({ min: 1, max: 120 })
      .withMessage("Age must be between 1 and 120"),
    body("gender")
      .isIn(["Male", "Female", "Other"])
      .withMessage("Gender must be Male, Female, or Other"),
    body("appointmentDate")
      .isISO8601()
      .withMessage("Valid appointment date is required")
      .custom((value) => {
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) {
          throw new Error("Appointment date cannot be in the past");
        }
        return true;
      }),
    body("dentist").isMongoId().withMessage("Valid dentist ID is required"),
    body("phone")
      .optional()
      .isMobilePhone()
      .withMessage("Invalid phone number"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Invalid email address"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const appointment = await Appointment.create(req.body);
      await appointment.populate(
        "dentist",
        "name clinicName location specialization"
      );

      res.status(201).json({
        success: true,
        data: appointment,
        message: "Appointment booked successfully!",
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/appointments/:id/status - Update appointment status (Admin)
router.put(
  "/:id/status",
  protect,
  [
    param("id").isMongoId().withMessage("Invalid appointment ID"),
    body("status")
      .isIn(["Booked", "Confirmed", "Completed", "Cancelled"])
      .withMessage("Invalid status"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const appointment = await Appointment.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true, runValidators: true }
      ).populate("dentist", "name clinicName");

      if (!appointment) {
        return res
          .status(404)
          .json({ success: false, message: "Appointment not found" });
      }

      res.json({
        success: true,
        data: appointment,
        message: `Appointment status updated to ${req.body.status}`,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/appointments/:id - Delete appointment (Admin)
router.delete(
  "/:id",
  protect,
  [param("id").isMongoId().withMessage("Invalid appointment ID")],
  validate,
  async (req, res, next) => {
    try {
      const appointment = await Appointment.findByIdAndDelete(req.params.id);
      if (!appointment) {
        return res
          .status(404)
          .json({ success: false, message: "Appointment not found" });
      }
      res.json({ success: true, message: "Appointment deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
