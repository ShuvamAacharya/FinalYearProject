import bcrypt from "bcryptjs";
// import User from "../models/user.model.js";

export const adminDashboard = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome Admin",
    user: req.user,
  });
};

/** Create an instructor account (admin only). */
export const createTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "instructor",
    });

    res.status(201).json({
      success: true,
      message: "Instructor created",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("createTeacher error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
