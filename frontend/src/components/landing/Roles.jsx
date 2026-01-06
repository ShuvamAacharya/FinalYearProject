const Roles = () => {
  return (
    <section className="roles">
      <div className="container">
        <h2>Who Can Use EduCity?</h2>
        <div className="roles-grid">
          <div className="role-card">
            <h3>👨‍🎓 Student</h3>
            <p>Enroll in courses, complete assessments, track progress, and earn certificates.</p>
          </div>
          <div className="role-card">
            <h3>👩‍🏫 Instructor</h3>
            <p>Create courses, upload content, design quizzes, and monitor student performance.</p>
          </div>
          <div className="role-card">
            <h3>👨‍💼 Administrator</h3>
            <p>Manage users, approve courses, moderate content, and generate reports.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Roles;