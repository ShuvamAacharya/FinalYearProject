export const studentDashboard = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Welcome to Student Dashboard",
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};