import React, { useEffect, useState } from "react";
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

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="header-container">
          <div className="logo-section">
            <img src="/img/edulayne-logo.png" alt="Edulayne" className="logo-image" />
          </div>
          <nav className="nav-menu">
            <a href="#home" className="nav-link">Home</a>
            <a href="#digital-marketing" className="nav-link">Digital Marketing with AI</a>
            <a href="#ai-ml" className="nav-link">AI &amp; ML</a>
            <a href="#cyber-security" className="nav-link">Cyber Security</a>
            <a href="#prompt-engineering" className="nav-link">Prompt Engineering</a>
            <a href="#mern-stack" className="nav-link">MEARN Stack</a>
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
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="shining-text">Master</span> Future Skills
            </h1>
            <p className="hero-subtitle">
              Don’t wait for the future — build it! Enroll in one of our cutting‑edge courses and gain the in‑demand skills.
            </p>
            <div className="hero-actions">
              <Link to="/users/login" className="cta-primary">Explore Courses</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Course Sections */}
      <section id="digital-marketing" className="course-section">
        <h2 className="section-title"><span className="shining-text">Digital Marketing with AI</span></h2>
        <p>
          Unlock the power of artificial intelligence to elevate your marketing strategies. This course blends the art of digital marketing with the science of AI‑driven tools to help you plan, execute, and optimize smarter campaigns.
        </p>
        <ul>
          <li>Learn SEO, social media optimization, paid advertising, email automation, and performance analytics — all enhanced with AI tools.</li>
          <li>Whether you’re a beginner or an experienced marketer, this course will empower you to make data‑backed decisions, create personalized campaigns, and stay far ahead in today’s competitive digital landscape.</li>
        </ul>
        <Link to="/users/login" className="cta-secondary">More Details</Link>
      </section>

      <section id="ai-ml" className="course-section">
        <h2 className="section-title"><span className="shining-text">AI &amp; Machine Learning</span></h2>
        <p>
          Step into the world of intelligent systems with our comprehensive AI &amp; Machine Learning course. Understand the foundations of artificial intelligence, explore machine learning models, and gain hands‑on experience building predictive systems.
        </p>
        <ul>
          <li>Work on real‑world datasets, apply supervised and unsupervised learning techniques, and learn how to train, test, and deploy AI models.</li>
          <li>By the end of the course, you’ll not only understand how machines learn but also how to use AI effectively to solve complex business and technology challenges.</li>
        </ul>
        <Link to="/users/login" className="cta-secondary">More Details</Link>
      </section>

      <section id="cyber-security" className="course-section">
        <h2 className="section-title"><span className="shining-text">Cyber Security</span></h2>
        <p>
          Become the shield in the digital age with this career‑focused Cyber Security course. Learn how to identify, analyze, and defend against cyber threats that affect individuals and organizations alike.
        </p>
        <ul>
          <li>Master ethical hacking, penetration testing, network security, and digital forensics while gaining real‑world experience through practical labs and simulations.</li>
          <li>The course also covers risk management, incident response, and the latest tools used by cybersecurity professionals worldwide.</li>
        </ul>
        <Link to="/users/login" className="cta-secondary">More Details</Link>
      </section>

      <section id="prompt-engineering" className="course-section">
        <h2 className="section-title"><span className="shining-text">Prompt Engineering</span></h2>
        <p>
          Harness the true power of artificial intelligence through the art of Prompt Engineering. This course teaches you how to communicate effectively with AI tools like ChatGPT, Midjourney, and others to generate accurate, creative, and high‑quality results.
        </p>
        <ul>
          <li>Explore prompt design techniques, optimization strategies, and industry use cases that can dramatically enhance productivity, creativity, and automation.</li>
          <li>By mastering the skill of crafting precise, high‑impact prompts, you’ll unlock new possibilities for business, marketing, writing, and beyond — making AI work smarter for you.</li>
        </ul>
        <Link to="/users/login" className="cta-secondary">More Details</Link>
      </section>

      <section id="mern-stack" className="course-section">
        <h2 className="section-title"><span className="shining-text">ME(A)RN Stack</span></h2>
        <p>
          Master the complete ME(A)RN Stack — MongoDB, Express, React, and Node.js — to build dynamic, responsive, and full‑featured web applications from the ground up.
        </p>
        <ul>
          <li>Design RESTful APIs with Node.js and Express, manage data efficiently using MongoDB, and craft beautiful, interactive interfaces with React.</li>
          <li>Whether you’re a beginner looking to start a career in web development or an experienced coder aiming to upskill, this course equips you with the tools, confidence, and real‑world experience to build production‑ready applications and stand out as a full‑stack developer.</li>
        </ul>
        <Link to="/users/login" className="cta-secondary">More Details</Link>
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
              <img src="/img/edulayne-logo.png" alt="Edulayne" className="footer-logo-img" />
            </div>
            <p>The ultimate learning platform for future‑ready skills.</p>
          </div>
          <div className="footer-section">
            <h4>Platform</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#courses">Courses</a></li>
              <li><a href="#about">About</a></li>
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
