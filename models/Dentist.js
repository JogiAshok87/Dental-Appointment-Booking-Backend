const mongoose = require("mongoose");

const dentistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Dentist name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    photo: {
      type: String,
      default: "",
    },
    qualification: {
      type: String,
      required: [true, "Qualification is required"],
      trim: true,
    },
    specialization: {
      type: String,
      trim: true,
      default: "General Dentistry",
    },
    yearsOfExperience: {
      type: Number,
      required: [true, "Years of experience is required"],
      min: [0, "Years of experience cannot be negative"],
    },
    clinicName: {
      type: String,
      required: [true, "Clinic name is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    consultationFee: {
      type: Number,
      default: 500,
    },
    availableDays: {
      type: [String],
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

dentistSchema.index({ location: 1 });
dentistSchema.index({ name: "text", clinicName: "text", location: "text" });

module.exports = mongoose.model("Dentist", dentistSchema);
