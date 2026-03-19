require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const Dentist = require("../models/Dentist");
const Admin = require("../models/Admin");

console.log("MONGO URI:", process.env.MONGODB_URI);

const dentists = [
  {
    name: "Dr. Priya Sharma",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    qualification: "BDS, MDS (Orthodontics)",
    specialization: "Orthodontics & Braces",
    yearsOfExperience: 12,
    clinicName: "SmileCare Dental Clinic",
    address: "42, Banjara Hills Road No. 12",
    location: "Hyderabad",
    phone: "+91-9876543210",
    email: "dr.priya@smilecare.com",
    rating: 4.8,
    reviewCount: 234,
    consultationFee: 600,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  },
  {
    name: "Dr. Arun Kumar",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    qualification: "BDS, MDS (Prosthodontics)",
    specialization: "Dental Implants & Crowns",
    yearsOfExperience: 18,
    clinicName: "PearlDent Advanced Dental",
    address: "Jubilee Hills, Road No. 45",
    location: "Hyderabad",
    phone: "+91-9876543211",
    email: "dr.arun@pearldent.com",
    rating: 4.9,
    reviewCount: 412,
    consultationFee: 800,
    availableDays: ["Monday", "Wednesday", "Friday", "Saturday"],
  },
  {
    name: "Dr. Meena Reddy",
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
    qualification: "BDS, MDS (Periodontics)",
    specialization: "Gum Treatment & Oral Surgery",
    yearsOfExperience: 9,
    clinicName: "DentaCare Multi-Speciality",
    address: "Kondapur Main Road, Near Forum Mall",
    location: "Hyderabad",
    phone: "+91-9876543212",
    email: "dr.meena@dentacare.com",
    rating: 4.7,
    reviewCount: 189,
    consultationFee: 500,
    availableDays: ["Tuesday", "Thursday", "Saturday", "Sunday"],
  },
  {
    name: "Dr. Rajesh Nair",
    photo: "https://randomuser.me/api/portraits/men/54.jpg",
    qualification: "BDS, MDS (Endodontics)",
    specialization: "Root Canal Specialist",
    yearsOfExperience: 15,
    clinicName: "RootCare Dental Studio",
    address: "Koramangala 5th Block",
    location: "Bangalore",
    phone: "+91-9876543213",
    email: "dr.rajesh@rootcare.com",
    rating: 4.9,
    reviewCount: 356,
    consultationFee: 700,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  },
  {
    name: "Dr. Sunita Patel",
    photo: "https://randomuser.me/api/portraits/women/25.jpg",
    qualification: "BDS, MDS (Pedodontics)",
    specialization: "Children's Dentistry",
    yearsOfExperience: 7,
    clinicName: "KidSmile Dental Care",
    address: "Anna Nagar, 2nd Street",
    location: "Chennai",
    phone: "+91-9876543214",
    email: "dr.sunita@kidsmile.com",
    rating: 4.8,
    reviewCount: 128,
    consultationFee: 450,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  },
  {
    name: "Dr. Vikram Singh",
    photo: "https://randomuser.me/api/portraits/men/77.jpg",
    qualification: "BDS, MDS (Cosmetic Dentistry)",
    specialization: "Smile Makeover & Whitening",
    yearsOfExperience: 11,
    clinicName: "Aesthetics Dental Lounge",
    address: "Viman Nagar, Near Phoenix Market",
    location: "Pune",
    phone: "+91-9876543215",
    email: "dr.vikram@aestheticsdental.com",
    rating: 4.6,
    reviewCount: 203,
    consultationFee: 900,
    availableDays: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  },
  {
    name: "Dr. Ananya Das",
    photo: "https://randomuser.me/api/portraits/women/52.jpg",
    qualification: "BDS, MDS (Oral Medicine)",
    specialization: "Oral Diagnosis & Radiology",
    yearsOfExperience: 8,
    clinicName: "OralHealth Diagnostic Centre",
    address: "Salt Lake Sector V",
    location: "Kolkata",
    phone: "+91-9876543216",
    email: "dr.ananya@oralhealth.com",
    rating: 4.5,
    reviewCount: 97,
    consultationFee: 400,
    availableDays: ["Monday", "Wednesday", "Friday"],
  },
  {
    name: "Dr. Sanjay Mehta",
    photo: "https://randomuser.me/api/portraits/men/41.jpg",
    qualification: "BDS, MDS (Maxillofacial Surgery)",
    specialization: "Jaw Surgery & Implants",
    yearsOfExperience: 20,
    clinicName: "MaxiloFacial Surgical Centre",
    address: "Linking Road, Bandra West",
    location: "Mumbai",
    phone: "+91-9876543217",
    email: "dr.sanjay@maxilofacial.com",
    rating: 5.0,
    reviewCount: 578,
    consultationFee: 1200,
    availableDays: ["Monday", "Tuesday", "Thursday", "Friday"],
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/dentist-booking"
    );
    console.log("✅ Connected to MongoDB for seeding");

    // Clear existing data
    await Dentist.deleteMany({});
    await Admin.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Insert dentists
    const insertedDentists = await Dentist.insertMany(dentists);
    console.log(`✅ Seeded ${insertedDentists.length} dentists`);

    // Create default admin
    await Admin.create({
      username: "admin",
      password: "admin123",
      role: "superadmin",
    });
    console.log("✅ Created admin user (username: admin, password: admin123)");

    console.log("\n🎉 Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedDB();
