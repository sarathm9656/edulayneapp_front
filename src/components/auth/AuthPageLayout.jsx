import { useEffect } from "react";
import AuthShowcase from "./AuthShowcase";

const AuthPageLayout = ({
  children,
  showcaseEyebrow,
  showcaseTitle,
  showcaseDescription,
}) => {
  useEffect(() => {
    document.body.classList.add("login-page");

    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  return (
    <div className="auth-shell">
      <div className="container-fluid p-0">
        <div className="row g-0">
          {/* Left Side: Form */}
          <div className="col-lg-6 col-12 auth-form-side">
            {children}
          </div>

          {/* Right Side: Showcase */}
          <div className="col-lg-6 d-none d-lg-block">
            <div className="auth-showcase-panel min-vh-100 d-flex align-items-center justify-content-center">
              <AuthShowcase
                eyebrow={showcaseEyebrow}
                title={showcaseTitle}
                description={showcaseDescription}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPageLayout;
