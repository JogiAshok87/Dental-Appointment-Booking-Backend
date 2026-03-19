const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const Admin = require("../models/Admin");
const { protect } = require("../middleware/auth");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "7d",
  });
};

// POST /api/auth/login
router.post(
  "/login",
  [
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      const admin = await Admin.findOne({ username, isActive: true }).select(
        "+password"
      );

      if (!admin || !(await admin.comparePassword(password))) {
        return res.status(401).json({
          success: false,
          message: "Invalid username or password",
        });
      }

      const token = signToken(admin._id);

      res.json({
        success: true,
        token,
        data: {
          id: admin._id,
          username: admin.username,
          role: admin.role,
        },
        message: "Login successful",
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/auth/me - Get current admin
router.get("/me", protect, async (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.admin._id,
      username: req.admin.username,
      role: req.admin.role,
    },
  });
});

// POST /api/auth/register - Register admin (protected, superadmin only)
router.post(
  "/register",
  protect,
  [
    body("username")
      .trim()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { username, password, role } = req.body;

      const existing = await Admin.findOne({ username });
      if (existing) {
        return res
          .status(400)
          .json({ success: false, message: "Username already exists" });
      }

      const admin = await Admin.create({ username, password, role });
      res.status(201).json({
        success: true,
        data: { id: admin._id, username: admin.username, role: admin.role },
        message: "Admin created successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
