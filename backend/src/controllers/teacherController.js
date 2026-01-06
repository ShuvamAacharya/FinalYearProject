export const teacherDashboard = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome Teacher",
    user: req.user,
  });
};
