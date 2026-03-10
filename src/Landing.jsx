import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./landing.css";

const sections = [
  { href: "#programs", label: "Programs" },
  { href: "#experience", label: "Experience" },
  { href: "#gallery", label: "Gallery" },
  { href: "#outcomes", label: "Outcomes" },
];

const tracks = [
  {
    id: "digital-marketing",
    title: "Digital Marketing with AI",
    copy:
      "Campaign planning, automation, analytics, and modern AI workflows taught through real execution.",
    image: "/img/explore-image.png",
  },
  {
    id: "ai-machine-learning",
    title: "AI and Machine Learning",
    copy:
      "Model basics, practical datasets, evaluation methods, and guided project delivery in one track.",
    image: "/img/courses.png",
  },
  {
    id: "cyber-security",
    title: "Cyber Security",
    copy:
      "Hands-on secure systems thinking, attack awareness, and defensive practice for serious learners.",
    image: "/img/bg.jpg",
  },
];

const galleryItems = [
  {
    title: "Live mentor classrooms",
    image: "/img/learners.png",
  },
  {
    title: "Instructor-led sessions",
    image: "/img/instructor.png",
  },
  {
    title: "Collaborative cohort learning",
    image: "/img/group-course.png",
  },
];

const stats = [
  { value: "10+", label: "Premium programs" },
  { value: "24/7", label: "Access to learning" },
  { value: "1:1", label: "Mentor support" },
  { value: "Real", label: "Project outcomes" },
];

const Landing = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add("landing-page");

    return () => {
      document.body.classList.remove("landing-page");
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="landing-shell">
      <header className="landing-header">
        <div className="landing-container landing-nav">
          <Link to="/" className="brand-mark" aria-label="Edulayne home" onClick={closeMenu}>
            <img src="/img/edulayne-full-logo.png" alt="Edulayne" />
          </Link>

          <button
            type="button"
            className={`mobile-menu-toggle ${menuOpen ? "active" : ""}`}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={`landing-nav-panel ${menuOpen ? "open" : ""}`}>
            <nav className="landing-links" aria-label="Primary">
              {sections.map((section) => (
                <a key={section.href} href={section.href} onClick={closeMenu}>
                  {section.label}
                </a>
              ))}
            </nav>

            <div className="landing-actions">
              <Link to="/users/login" className="action-link" onClick={closeMenu}>
                Login
              </Link>
              <Link to="/users/login" className="action-button" onClick={closeMenu}>
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {menuOpen ? <button type="button" className="landing-backdrop" aria-label="Close menu" onClick={closeMenu}></button> : null}

      <main>
        <section className="hero-panel">
          <div className="landing-container hero-layout">
            <div className="hero-copy">
              <span className="hero-kicker">Image-first premium learning experience</span>
              <h1>Courses, mentors, and classroom flow that look serious on first view.</h1>
              <p className="hero-text">
                The landing page now pushes visuals first. Instead of icon-heavy blocks,
                the experience uses real classroom images, stronger spacing, and clearer
                entry points for learners on both desktop and mobile.
              </p>

              <div className="hero-cta-row">
                <Link to="/users/login" className="primary-cta">
                  Login
                </Link>
                <a href="#programs" className="secondary-cta">
                  Browse Programs
                </a>
              </div>
            </div>

            <div className="hero-collage" aria-hidden="true">
              <div className="hero-collage-main">
                <img src="/img/learners.png" alt="" />
              </div>
              <div className="hero-collage-side hero-collage-top">
                <img src="/img/instructor.png" alt="" />
              </div>
              <div className="hero-collage-side hero-collage-bottom">
                <img src="/img/explore-image.png" alt="" />
              </div>
            </div>
          </div>
        </section>

        <section className="showcase-strip" id="experience">
          <div className="landing-container showcase-layout">
            <article className="showcase-card showcase-card-large">
              <img src="/img/group-course.png" alt="Students learning together" />
              <div className="showcase-copy">
                <span className="section-kicker">Modern classroom</span>
                <h2>Cleaner sections, stronger images, less visual noise.</h2>
                <p>
                  This version removes the scattered icon feel and replaces it with
                  course imagery, focused copy, and a calmer page rhythm.
                </p>
              </div>
            </article>

            <div className="showcase-stack">
              <article className="showcase-card">
                <img src="/img/courses.png" alt="Course dashboard" />
                <div className="showcase-copy compact">
                  <h3>Structured learning paths</h3>
                  <p>Programs are presented through strong visuals and direct value.</p>
                </div>
              </article>
              <article className="showcase-card">
                <img src="/img/explore-image.png" alt="Learning workspace" />
                <div className="showcase-copy compact">
                  <h3>Better first impression</h3>
                  <p>Desktop and mobile both get a clearer, more premium entry flow.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="programs-section" id="programs">
          <div className="landing-container section-head">
            <span className="section-kicker">Popular programs</span>
            <h2>Real course tracks shown with real visuals.</h2>
            <p>
              Each course card now leans on large images and simple copy instead of
              icon decoration.
            </p>
          </div>

          <div className="landing-container programs-grid">
            {tracks.map((track) => (
              <article className="program-card" key={track.id}>
                <div className="program-image-wrap">
                  <img src={track.image} alt={track.title} className="program-image" />
                </div>
                <div className="program-body">
                  <h3>{track.title}</h3>
                  <p>{track.copy}</p>
                  <Link to="/users/login" className="inline-link">
                    Explore this track
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="gallery-section" id="gallery">
          <div className="landing-container section-head">
            <span className="section-kicker">Learning gallery</span>
            <h2>More images, less empty decoration.</h2>
          </div>

          <div className="landing-container gallery-grid">
            {galleryItems.map((item) => (
              <article className="gallery-card" key={item.title}>
                <img src={item.image} alt={item.title} />
                <div className="gallery-label">{item.title}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="outcomes-section" id="outcomes">
          <div className="landing-container outcomes-layout">
            <div className="outcomes-copy">
              <span className="section-kicker">Clear outcomes</span>
              <h2>Navigation, login access, and section links stay usable on mobile.</h2>
              <p>
                The mobile header now includes a real toggle button that opens the
                navigation links and login action in one clean panel.
              </p>
            </div>

            <div className="stats-grid">
              {stats.map((item) => (
                <article className="stat-card" key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container footer-layout">
          <div>
            <img src="/img/edulayne-full-logo.png" alt="Edulayne" className="footer-logo" />
            <p>Premium digital learning for students, mentors, and career-focused programs.</p>
          </div>

          <div>
            <h4>Sections</h4>
            {sections.map((section) => (
              <a key={section.href} href={section.href}>
                {section.label}
              </a>
            ))}
          </div>

          <div>
            <h4>Access</h4>
            <Link to="/users/login">Login</Link>
            <Link to="/users/login">Get Started</Link>
          </div>
        </div>
        <div className="landing-container footer-bottom">
          <p>&copy; {new Date().getFullYear()} Edulayne. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
