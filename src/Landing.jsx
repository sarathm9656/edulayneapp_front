import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./landing.css";

const Landing = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    document.body.classList.add("landing-page");
    return () => {
      document.body.classList.remove("landing-page");
    };
  }, []);

  useEffect(() => {
    const canTilt =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (!canTilt) return;

    const tiltElements = Array.from(document.querySelectorAll("[data-tilt]"));
    const cleanups = tiltElements.map((el) => {
      let rafId = 0;

      const setTilt = (event) => {
        const rect = el.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const px = x / rect.width - 0.5;
        const py = y / rect.height - 0.5;

        const rotateY = px * 14;
        const rotateX = -py * 10;

        el.style.setProperty("--tilt-ry", `${rotateY.toFixed(2)}deg`);
        el.style.setProperty("--tilt-rx", `${rotateX.toFixed(2)}deg`);
        el.style.setProperty("--tilt-glow-x", `${(x / rect.width) * 100}%`);
        el.style.setProperty("--tilt-glow-y", `${(y / rect.height) * 100}%`);
        el.classList.add("is-tilting");
      };

      const onPointerMove = (event) => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => setTilt(event));
      };

      const onPointerLeave = () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
        el.classList.remove("is-tilting");
        el.style.setProperty("--tilt-ry", "0deg");
        el.style.setProperty("--tilt-rx", "0deg");
        el.style.setProperty("--tilt-glow-x", "50%");
        el.style.setProperty("--tilt-glow-y", "35%");
      };

      el.addEventListener("pointermove", onPointerMove);
      el.addEventListener("pointerleave", onPointerLeave);

      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        el.removeEventListener("pointermove", onPointerMove);
        el.removeEventListener("pointerleave", onPointerLeave);
      };
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, []);

  const courses = useMemo(
    () => [
      {
        id: "digital-marketing",
        title: "Digital Marketing with AI",
        badge: "AI + Growth",
        image: "/img/explore-image.png",
        description:
          "Blend digital marketing fundamentals with AI tools to plan, execute, and optimize smarter campaigns.",
        bullets: [
          "SEO, social, ads, email automation, and analytics — with AI workflows.",
          "Create personalized campaigns and make data-backed decisions faster.",
        ],
      },
      {
        id: "ai-ml",
        title: "AI & Machine Learning",
        badge: "Build Models",
        image: "/img/courses.png",
        description:
          "Learn core AI concepts, modern ML techniques, and hands-on model building with real datasets.",
        bullets: [
          "Supervised/unsupervised learning, evaluation, and deployment basics.",
          "Turn data into predictions and solve real business + tech problems.",
        ],
      },
      {
        id: "cyber-security",
        title: "Cyber Security",
        badge: "Defend & Secure",
        image: "/img/bg.jpg",
        description:
          "A career-focused path to identify, analyze, and defend against modern cyber threats.",
        bullets: [
          "Ethical hacking, pentesting, network security, and digital forensics.",
          "Risk management, incident response, and industry-standard tools.",
        ],
      },
      {
        id: "prompt-engineering",
        title: "Prompt Engineering",
        badge: "AI Skill",
        image: "/img/recorded-course.png",
        description:
          "Master prompt techniques for tools like ChatGPT and beyond to get accurate, high-quality outputs.",
        bullets: [
          "Prompt patterns, iteration methods, and optimization strategies.",
          "Use cases for productivity, marketing, writing, and automation.",
        ],
      },
      {
        id: "mern-stack",
        title: "MERN Stack",
        badge: "Full Stack",
        image: "/img/group-course.png",
        description:
          "Build full‑featured apps with MongoDB, Express, React, and Node.js — from APIs to UI.",
        bullets: [
          "Design REST APIs, model data, and ship responsive React interfaces.",
          "Build production-ready projects with real-world patterns.",
        ],
      },
    ],
    []
  );

  return (
    <div className={`landing-page ${isVisible ? "is-visible" : ""}`}>
      {/* Header */}
      <header className="landing-header">
        <div className="header-container">
          <div className="logo-section">
            <img src="/img/edulayne-full-logo.png" alt="Edulayne" className="logo-image" />
          </div>
          <nav className="nav-menu">
            <a href="#home" className="nav-link">Home</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#courses" className="nav-link">Courses</a>
            <a href="#digital-marketing" className="nav-link">Digital Marketing</a>
            <a href="#ai-ml" className="nav-link">AI &amp; ML</a>
            <a href="#cyber-security" className="nav-link">Cyber Security</a>
            <a href="#prompt-engineering" className="nav-link">Prompt Engineering</a>
            <a href="#mern-stack" className="nav-link">MERN Stack</a>
          </nav>
          <div className="header-actions">
            <Link to="/users/login" className="login-btn">Login</Link>
            <Link to="/users/login" className="signup-btn">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-eyebrow">Learn. Build. Get hired.</div>
              <h1 className="hero-title">
                <span className="shining-text">Master</span> Future Skills
              </h1>
              <p className="hero-subtitle">
                Don’t wait for the future — build it. Learn with mentor support, real projects, and a modern curriculum designed for outcomes.
              </p>
              <div className="hero-actions">
                <Link to="/users/login" className="cta-primary">Explore Courses</Link>
                <a href="#courses" className="cta-ghost">See curriculum</a>
              </div>

              <div className="hero-stats">
                <div className="stat-pill" data-tilt>
                  <div className="stat-pill-icon">🎯</div>
                  <div className="stat-pill-text">
                    <strong>Mentor-led</strong>
                    <span>Guidance that sticks</span>
                  </div>
                </div>
                <div className="stat-pill" data-tilt>
                  <div className="stat-pill-icon">🧪</div>
                  <div className="stat-pill-text">
                    <strong>Projects</strong>
                    <span>Build portfolio work</span>
                  </div>
                </div>
                <div className="stat-pill" data-tilt>
                  <div className="stat-pill-icon">⚡</div>
                  <div className="stat-pill-text">
                    <strong>AI-first</strong>
                    <span>Use modern tools</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-visual" aria-hidden="true">
              <div className="visual-scene" data-tilt>
                <div className="visual-card visual-main">
                  <img src="/img/explore-image.png" alt="" className="visual-image" />
                  <div className="visual-overlay">
                    <div className="visual-badge tilt-pop">
                      <span className="visual-dot" />
                      Live learning paths
                    </div>
                  </div>
                </div>
                <div className="visual-card visual-secondary tilt-pop">
                  <img src="/img/courses.png" alt="" className="visual-image" />
                </div>
                <div className="visual-card visual-tertiary tilt-pop">
                  <img src="/img/instructor.png" alt="" className="visual-image" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features-section">
        <div className="section-head">
          <h2 className="section-title">Built for outcomes</h2>
          <p className="section-subtitle">
            Everything is designed to move you from learning to building — fast.
          </p>
        </div>

        <div className="features-grid">
          <article className="feature-card" data-tilt>
            <div className="feature-icon">🧑‍🏫</div>
            <h3>Mentor support</h3>
            <p>Get clarity quickly with structured guidance, checkpoints, and feedback.</p>
          </article>
          <article className="feature-card" data-tilt>
            <div className="feature-icon">🧩</div>
            <h3>Real projects</h3>
            <p>Build practical work that looks great in your portfolio — not toy demos.</p>
          </article>
          <article className="feature-card" data-tilt>
            <div className="feature-icon">🧠</div>
            <h3>AI workflows</h3>
            <p>Learn how to use AI tools effectively — to research, build, test, and ship.</p>
          </article>
          <article className="feature-card" data-tilt>
            <div className="feature-icon">📈</div>
            <h3>Progress tracking</h3>
            <p>Stay on track with milestones that keep momentum (and motivation) high.</p>
          </article>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="courses-section">
        <div className="section-head">
          <h2 className="section-title">
            Pick a <span className="shining-text">learning path</span>
          </h2>
          <p className="section-subtitle">
            Explore our most popular tracks. Each course includes hands-on practice and guided learning.
          </p>
        </div>

        <div className="courses-grid">
          {courses.map((course) => (
            <article key={course.id} id={course.id} className="course-card" data-tilt>
              <div className="course-media">
                <img src={course.image} alt="" className="course-image" />
                <div className="course-badge tilt-pop">{course.badge}</div>
              </div>
              <div className="course-body">
                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">{course.description}</p>
                <ul className="course-points">
                  {course.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <Link to="/users/login" className="cta-secondary">More Details</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="about-section">
        <div className="about-grid">
          <div className="about-visual" data-tilt>
            <img src="/img/learners.png" alt="" className="about-image" />
            <div className="about-float about-float-one tilt-pop">
              <img src="/img/leaners-icon.png" alt="" />
              <span>Community</span>
            </div>
            <div className="about-float about-float-two tilt-pop">
              <img src="/img/instructors-icon.png" alt="" />
              <span>Mentors</span>
            </div>
          </div>
          <div className="about-content">
            <h2 className="section-title">Learn with structure. Grow with confidence.</h2>
            <p className="section-subtitle">
              Edulayne combines modern curriculum, mentor support, and hands-on projects so you can build skills that employers value.
            </p>
            <div className="about-actions">
              <Link to="/users/login" className="cta-primary">Get Started</Link>
              <a href="#courses" className="cta-ghost">Browse courses</a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <h2 className="section-title"><span className="shining-text">What Our Students Say</span></h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p>"The mentors are very supportive and guide you till you’re confident."</p>
            <div className="testimonial-author">
              <div className="author-avatar">👤</div>
              <div className="author-info"><h4>Lintu P Thomas</h4><span>Ernakulam</span></div>
            </div>
          </div>
          <div className="testimonial-card">
            <p>"Got my first job after Edulayne’s Full Stack Development program! Can’t thank them enough 🙌"</p>
            <div className="testimonial-author">
              <div className="author-avatar">👤</div>
              <div className="author-info"><h4>Riswana P</h4><span>Ernakulam</span></div>
            </div>
          </div>
          <div className="testimonial-card">
            <p>"Edulayne’s mentors don’t just teach — they guide me step by step toward success."</p>
            <div className="testimonial-author">
              <div className="author-avatar">👤</div>
              <div className="author-info"><h4>Abin Babu</h4><span>Ernakulam</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-section">
            <div className="footer-logo">
              <img src="/img/edulayne-full-logo.png" alt="Edulayne" className="footer-logo-img" />
            </div>
            <p>The ultimate learning platform for future‑ready skills.</p>
          </div>
          <div className="footer-section">
            <h4>Platform</h4>
            <ul>
              <li><a href="#courses">Courses</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#features">Features</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Community</a></li>
              <li><a href="#">Feedback</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Edulayne. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
