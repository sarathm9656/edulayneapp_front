import React from "react";

const AuthShowcase = ({
  eyebrow = "Strategy Board",
  title = "Expertise in every move.",
  description = "Access your GoChess dashboard and continue your journey in mastering the game.",
}) => {
  return (
    <div className="auth-showcase">
      <div className="auth-image-container">
        <img src="/img/chess-login-image.svg" alt="Chess Strategy" className="auth-showcase-svg" />
      </div>

      <div className="auth-showcase-copy">
        <span className="auth-showcase-eyebrow">{eyebrow}</span>
        <h2>{title} </h2>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default AuthShowcase;
