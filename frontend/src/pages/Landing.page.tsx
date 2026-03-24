import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./landing.page.css";

const sections = {
  home: "edu-home",
  teach: "edu-teach",
  learn: "edu-learn",
  certificates: "edu-certificates",
  about: "edu-about",
} as const;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  const scrollToId = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goCourses = () => {
    setMenuOpen(false);
    navigate("/courses");
  };

  return (
    <div className="edu-landing">
      <header
        className={`edu-nav${navScrolled ? " edu-nav--scrolled" : ""}`}
        id={sections.home}
      >
        <div className="edu-nav__inner">
          <button
            type="button"
            className="edu-nav__brand"
            onClick={() => scrollToId(sections.home)}
            aria-label="EduCity home"
          >
            EduCity
          </button>

          <nav aria-label="Primary">
            <ul className="edu-nav__links">
              <li>
                <button
                  type="button"
                  className="edu-nav__link"
                  onClick={() => scrollToId(sections.home)}
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="edu-nav__link"
                  onClick={goCourses}
                >
                  Courses
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="edu-nav__link"
                  onClick={() => scrollToId(sections.teach)}
                >
                  Teach
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="edu-nav__link"
                  onClick={() => scrollToId(sections.learn)}
                >
                  Learn
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="edu-nav__link"
                  onClick={() => scrollToId(sections.certificates)}
                >
                  Certificates
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="edu-nav__link"
                  onClick={() => scrollToId(sections.about)}
                >
                  About
                </button>
              </li>
            </ul>
          </nav>

          <div className="edu-nav__actions">
            <button
              type="button"
              className="edu-btn edu-btn--ghost"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
              type="button"
              className="edu-btn edu-btn--primary"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </div>

          <button
            type="button"
            className="edu-nav__toggle"
            aria-expanded={menuOpen}
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div
        className={`edu-nav__drawer${menuOpen ? " edu-nav__drawer--open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className="edu-nav__drawer-bg"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
        <div className="edu-nav__drawer-panel">
          <button
            type="button"
            className="edu-nav__drawer-link"
            onClick={() => scrollToId(sections.home)}
          >
            Home
          </button>
          <button
            type="button"
            className="edu-nav__drawer-link"
            onClick={goCourses}
          >
            Courses
          </button>
          <button
            type="button"
            className="edu-nav__drawer-link"
            onClick={() => scrollToId(sections.teach)}
          >
            Teach
          </button>
          <button
            type="button"
            className="edu-nav__drawer-link"
            onClick={() => scrollToId(sections.learn)}
          >
            Learn
          </button>
          <button
            type="button"
            className="edu-nav__drawer-link"
            onClick={() => scrollToId(sections.certificates)}
          >
            Certificates
          </button>
          <button
            type="button"
            className="edu-nav__drawer-link"
            onClick={() => scrollToId(sections.about)}
          >
            About
          </button>
          <div className="edu-nav__drawer-actions">
            <button
              type="button"
              className="edu-btn edu-btn--ghost"
              onClick={() => {
                setMenuOpen(false);
                navigate("/login");
              }}
              style={{ width: "100%" }}
            >
              Login
            </button>
            <button
              type="button"
              className="edu-btn edu-btn--primary"
              onClick={() => {
                setMenuOpen(false);
                navigate("/register");
              }}
              style={{ width: "100%" }}
            >
              Register
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="edu-hero" aria-labelledby="hero-title">
        <div className="edu-hero__grid">
          <div>
            <p className="edu-section__eyebrow">Dual-persona learning</p>
            <h1 id="hero-title" className="edu-hero__headline">
              Learn. Teach. Earn Certificates —{" "}
              <span className="edu-hero__gradient">All in One Platform</span>
            </h1>
            <p className="edu-hero__sub">
              Switch roles between student and instructor instantly and grow your
              knowledge community.
            </p>
            <div className="edu-hero__ctas">
              <button
                type="button"
                className="edu-hero__btn edu-hero__btn--solid"
                onClick={() => navigate("/register")}
              >
                Start Learning
              </button>
              <button
                type="button"
                className="edu-hero__btn edu-hero__btn--outline"
                onClick={() => navigate("/register")}
              >
                Become Instructor
              </button>
            </div>
          </div>

          <div className="edu-hero__illustration" aria-hidden>
            <div className="edu-collab-board">
              <div className="edu-collab-board__header">
                <span className="edu-collab-dot" />
                <span className="edu-collab-dot" />
                <span className="edu-collab-dot" />
              </div>
              <div className="edu-collab-board__content">
                <div className="edu-collab-bubble edu-collab-bubble--student">
                  <span>Student</span>
                  <strong>Quiz completed: 92%</strong>
                </div>
                <div className="edu-collab-link" />
                <div className="edu-collab-bubble edu-collab-bubble--instructor">
                  <span>Instructor</span>
                  <strong>Feedback shared</strong>
                </div>
              </div>
            </div>

            <div className="edu-role-card edu-role-card--student">
              <div className="edu-role-card__icon" aria-hidden>📚</div>
              <div className="edu-role-card__label">Current mode</div>
              <div className="edu-role-card__title">Student</div>
            </div>

            <div className="edu-role-switch" title="Switch roles">
              <span className="edu-role-switch__glyph" aria-hidden>⇄</span>
            </div>

            <div className="edu-role-card edu-role-card--instructor">
              <div className="edu-role-card__icon" aria-hidden>🎓</div>
              <div className="edu-role-card__label">Switch to</div>
              <div className="edu-role-card__title">Instructor</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="edu-features" className="edu-features">
        <div className="edu-section">
          <p className="edu-section__eyebrow">Platform capabilities</p>
          <h2 className="edu-section__title">Built for serious learners &amp; educators</h2>
          <p className="edu-section__lead">
            Every feature connects teaching and learning—so your progress, content,
            and credentials stay in sync.
          </p>
          <div className="edu-card-grid">
            {[
              {
                icon: "🔁",
                title: "Role switching system",
                text: "Switch between student and instructor modes instantly with one unified account.",
              },
              {
                icon: "🛠️",
                title: "Course creation tools",
                text: "Structure modules, upload lessons, and publish rich learning paths in minutes.",
              },
              {
                icon: "✅",
                title: "Interactive quizzes",
                text: "Reinforce concepts with auto-graded assessments and instant feedback.",
              },
              {
                icon: "⛓️",
                title: "Blockchain certificates",
                text: "Issue fraud-resistant credentials learners can verify anywhere.",
              },
              {
                icon: "📊",
                title: "Progress tracking dashboards",
                text: "Track completion, performance, and growth trends with real-time analytics.",
              },
              {
                icon: "🌐",
                title: "Community-based learning",
                text: "Collaborate with peers, cohorts, and mentors in a shared learning community.",
              },
            ].map((f) => (
              <article key={f.title} className="edu-feature-card">
                <div className="edu-feature-card__icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="edu-how" className="edu-section">
        <p className="edu-section__eyebrow">How it works</p>
        <h2 className="edu-section__title">From signup to verified certificate</h2>
        <p className="edu-section__lead">
          A clear path for students, instructors, and admins—designed for real
          academic workflows.
        </p>
        <div className="edu-timeline">
          {[
            {
              step: "01",
              title: "Register",
              text: "Create one EduCity profile. Choose student or instructor to start; upgrade roles as you grow.",
            },
            {
              step: "02",
              title: "Enroll in courses",
              text: "Browse the catalog, join cohorts, and access structured content on any device.",
            },
            {
              step: "03",
              title: "Take quizzes",
              text: "Check understanding with interactive assessments tied to each learning objective.",
            },
            {
              step: "04",
              title: "Teach others",
              text: "Flip to instructor tools—author lessons, track learners, and refine your material.",
            },
            {
              step: "05",
              title: "Earn certificates",
              text: "Receive secure, verifiable credentials when you complete programs—ready for LinkedIn or transcripts.",
            },
          ].map((item) => (
            <div key={item.step} className="edu-timeline__item">
              <div className="edu-timeline__dot" />
              <div className="edu-timeline__step">Step {item.step}</div>
              <h3 className="edu-timeline__title">{item.title}</h3>
              <p className="edu-timeline__text">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Instructor */}
      <section id={sections.teach} className="edu-section">
        <div className="edu-split edu-split--reverse">
          <div className="edu-split__visual">
            <div className="edu-mock">
              <div className="edu-mock__bar">
                <span className="edu-mock__dot" />
                <span className="edu-mock__dot" />
                <span className="edu-mock__dot" />
              </div>
              <div className="edu-mock__body">
                <div className="edu-mock__rows">
                  <div className="edu-mock__row" style={{ width: "45%" }} />
                  <div className="edu-mock__row edu-mock__row--short" />
                  <div className="edu-mock__row" style={{ width: "80%" }} />
                  <div className="edu-mock__row" style={{ width: "55%" }} />
                </div>
              </div>
            </div>
          </div>
          <div className="edu-split__copy">
            <p className="edu-section__eyebrow">For instructors</p>
            <h2 className="edu-section__title">Teach at scale—without losing the human touch</h2>
            <p className="edu-section__lead" style={{ marginBottom: 0 }}>
              Everything you need to launch cohorts, iterate on content, and see how
              students engage.
            </p>
            <ul className="edu-split__list">
              {[
                "Author courses with modular lessons and rich media uploads.",
                "Track enrollments, progress, and quiz performance per learner.",
                "Collaborate with admins on quality, access, and reporting.",
              ].map((t) => (
                <li key={t}>
                  <span className="edu-split__check">✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Student */}
      <section id={sections.learn} className="edu-section">
        <div className="edu-split">
          <div className="edu-split__copy">
            <p className="edu-section__eyebrow">For students</p>
            <h2 className="edu-section__title">Learn smarter with structure you can trust</h2>
            <p className="edu-section__lead" style={{ marginBottom: 0 }}>
              From self-paced modules to university programs, stay oriented and
              motivated.
            </p>
            <ul className="edu-split__list">
              {[
                "Browse and filter courses aligned to your goals.",
                "Resume where you left off with progress saved across devices.",
                "Review quiz attempts and know exactly what to study next.",
              ].map((t) => (
                <li key={t}>
                  <span className="edu-split__check">✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="edu-split__visual">
            <div className="edu-mock">
              <div className="edu-mock__bar">
                <span className="edu-mock__dot" />
                <span className="edu-mock__dot" />
                <span className="edu-mock__dot" />
              </div>
              <div className="edu-mock__body">
                <div className="edu-dash-stats">
                  <div className="edu-dash-stat">
                    <div className="edu-dash-stat__val">12</div>
                    <div className="edu-dash-stat__lbl">Courses</div>
                  </div>
                  <div className="edu-dash-stat">
                    <div className="edu-dash-stat__val">86%</div>
                    <div className="edu-dash-stat__lbl">Progress</div>
                  </div>
                  <div className="edu-dash-stat">
                    <div className="edu-dash-stat__val">4</div>
                    <div className="edu-dash-stat__lbl">Certs</div>
                  </div>
                </div>
                <div className="mini-bar">
                  <span style={{ width: "72%" }} />
                </div>
                <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.75rem" }}>
                  Quizzes passed this week
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certificate */}
      <section id={sections.certificates} className="edu-section">
        <p className="edu-section__eyebrow">Credentials</p>
        <h2 className="edu-section__title">Certificates employers and schools can verify</h2>
        <p className="edu-section__lead">
          Each credential is tied to a secure record—share a link or QR and let
          anyone confirm authenticity.
        </p>
        <div className="edu-cert-showcase">
          <div className="edu-cert-card">
            <div className="edu-cert-card__inner">
              <div className="edu-cert-card__seal" aria-hidden>
                ✓
              </div>
              <h3>Certificate of Completion</h3>
              <p className="edu-cert-card__meta">
                Awarded to <strong>Alex Morgan</strong>
                <br />
                Advanced Web Architecture · March 2025
              </p>
              <div className="edu-cert-card__qr" aria-hidden />
              <span className="edu-cert-card__badge">Verified on EduCity chain</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard previews */}
      <section id="edu-dashboards" className="edu-section">
        <p className="edu-section__eyebrow">Inside the product</p>
        <h2 className="edu-section__title">Dashboards tailored to every role</h2>
        <p className="edu-section__lead">
          Admins oversee the platform, instructors run cohorts, and students stay on
          track—each with a focused workspace preview.
        </p>
        <div className="edu-dash-grid">
          <article className="edu-dash-card">
            <div className="edu-dash-card__head edu-dash-card__head--admin">
              <span aria-hidden>◆</span> Admin overview
            </div>
            <div className="edu-dash-card__body">
              <div className="edu-dash-stats">
                <div className="edu-dash-stat">
                  <div className="edu-dash-stat__val">2.4k</div>
                  <div className="edu-dash-stat__lbl">Users</div>
                </div>
                <div className="edu-dash-stat">
                  <div className="edu-dash-stat__val">118</div>
                  <div className="edu-dash-stat__lbl">Courses</div>
                </div>
                <div className="edu-dash-stat">
                  <div className="edu-dash-stat__val">99.2%</div>
                  <div className="edu-dash-stat__lbl">Uptime</div>
                </div>
              </div>
              <div className="mini-bar">
                <span style={{ width: "88%" }} />
              </div>
              <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.65rem" }}>
                Engagement trend (30 days)
              </p>
            </div>
          </article>

          <article className="edu-dash-card">
            <div className="edu-dash-card__head edu-dash-card__head--instructor">
              <span aria-hidden>◇</span> Instructor studio
            </div>
            <div className="edu-dash-card__body">
              <div className="edu-mock__rows">
                <div className="edu-mock__row" style={{ width: "90%" }} />
                <div className="edu-mock__row" style={{ width: "75%" }} />
                <div className="edu-mock__row edu-mock__row--short" />
              </div>
              <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "1rem" }}>
                3 drafts · 12 published lessons · 48 active learners
              </p>
            </div>
          </article>

          <article className="edu-dash-card">
            <div className="edu-dash-card__head edu-dash-card__head--student">
              <span aria-hidden>○</span> Student hub
            </div>
            <div className="edu-dash-card__body">
              <div className="edu-dash-stats">
                <div className="edu-dash-stat">
                  <div className="edu-dash-stat__val">5</div>
                  <div className="edu-dash-stat__lbl">Active</div>
                </div>
                <div className="edu-dash-stat">
                  <div className="edu-dash-stat__val">92%</div>
                  <div className="edu-dash-stat__lbl">Avg quiz</div>
                </div>
                <div className="edu-dash-stat">
                  <div className="edu-dash-stat__val">2</div>
                  <div className="edu-dash-stat__lbl">Due soon</div>
                </div>
              </div>
              <div className="mini-bar">
                <span style={{ width: "64%" }} />
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Testimonials */}
      <section id="edu-testimonials" className="edu-section">
        <p className="edu-section__eyebrow">Stories</p>
        <h2 className="edu-section__title">Trusted by learners and faculty</h2>
        <p className="edu-section__lead">
          Whether you are upskilling solo or running a university cohort, EduCity
          adapts to how you work.
        </p>
        <div className="edu-quote-grid">
          <blockquote className="edu-quote">
            <p>
              “I teach by day and take micro-courses at night. One login, two hats—my
              certificates finally live beside the courses I author.”
            </p>
            <footer className="edu-quote__author">
              <div className="edu-quote__avatar">DR</div>
              <div>
                <div className="edu-quote__name">Dr. Rina Shah</div>
                <div className="edu-quote__role">Instructor, State University</div>
              </div>
            </footer>
          </blockquote>
          <blockquote className="edu-quote">
            <p>
              “Quizzes are tied to modules, progress is obvious, and I exported a
              blockchain-backed cert for my internship panel—huge win.”
            </p>
            <footer className="edu-quote__author">
              <div className="edu-quote__avatar">JM</div>
              <div>
                <div className="edu-quote__name">Jordan Martinez</div>
                <div className="edu-quote__role">Computer Science student</div>
              </div>
            </footer>
          </blockquote>
          <blockquote className="edu-quote">
            <p>
              “Our admins needed oversight without slowing faculty down. The role
              dashboards gave us compliance-friendly visibility overnight.”
            </p>
            <footer className="edu-quote__author">
              <div className="edu-quote__avatar">LC</div>
              <div>
                <div className="edu-quote__name">Luis Chen</div>
                <div className="edu-quote__role">Program administrator</div>
              </div>
            </footer>
          </blockquote>
        </div>
      </section>

      {/* CTA */}
      <section id="edu-cta" className="edu-cta" aria-labelledby="cta-title">
        <h2 id="cta-title">Join EduCity today</h2>
        <p>
          Bring your institution, your cohort, or your solo learning goals—start
          free and scale when you are ready.
        </p>
        <button
          type="button"
          className="edu-btn edu-btn--primary"
          onClick={() => navigate("/register")}
        >
          Create free account
        </button>
      </section>

      {/* About */}
      <section id={sections.about} className="edu-section">
        <div className="edu-about-box section">
          <p className="edu-section__eyebrow">About EduCity</p>
          <h2 className="edu-section__title">One platform, every academic role</h2>
          <p>
            EduCity is designed for university students, self-learners, instructors,
            and administrators who need modern tools without siloed logins. We
            combine structured courses, assessments, teaching workflows, and
            verifiable credentials so growth is measurable—and portable.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="edu-footer">
        <div className="edu-footer__grid">
          <div>
            <div className="edu-footer__brand">EduCity</div>
            <p style={{ margin: 0, fontSize: "0.875rem", lineHeight: 1.6 }}>
              Dual-persona learning with dashboards, quizzes, and secure certificates
              for the whole campus community.
            </p>
            <div className="edu-social" aria-label="Social media">
              <a href="https://twitter.com" target="_blank" rel="noreferrer">
                X
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                in
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer">
                gh
              </a>
            </div>
          </div>
          <div>
            <h4>Quick links</h4>
            <ul>
              <li>
                <button type="button" onClick={() => scrollToId(sections.home)}>
                  Home
                </button>
              </li>
              <li>
                <button type="button" onClick={goCourses}>
                  Courses
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate("/login")}>
                  Login
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate("/register")}>
                  Register
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4>Product</h4>
            <ul>
              <li>
                <button type="button" onClick={() => scrollToId(sections.teach)}>
                  Teach
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToId(sections.learn)}>
                  Learn
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToId(sections.certificates)}
                >
                  Certificates
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToId("edu-dashboards")}
                >
                  Dashboards
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li>
                <a href="mailto:hello@educity.dev">hello@educity.dev</a>
              </li>
              <li>
                <span>Remote-first · Global campuses</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="edu-footer__bottom">
          © {new Date().getFullYear()} EduCity. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
