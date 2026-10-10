import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/homepage.css";
export default function Hero() {
const navigate = useNavigate();
const { login } = useAuth();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const handleLogin = async (e) => {
  e.preventDefault();

  setError("");
  setLoading(true);

  try {
    await login(email, password);
    navigate("/dashboard");
  } catch (err) {
    setError(err.message || "Login failed");
  } finally {
    setLoading(false);
  }
};
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        {/* Left — headline + CTA */}
        <div>
          <div className="eyebrow">
            <span className="pulse"></span>
            National Development Mission Research
          </div>

          <h1>
            An Impact Analysis Platform for
            <br />
            developmental initiatives.
          </h1>

          <p className="lede">
            A geospatial decision-support system for monitoring farm ponds,
            understanding temporal change, and assessing sustainable development
            outcomes through satellite intelligence.
          </p>

          <div className="hero-actions">
            <a
              className="button primary"
              href="#capabilities"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Explore the platform →
            </a>
            <a
              className="button ghost"
              href="#about"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Our research
            </a>
          </div>

          <div className="statline">
            <div>
              <b>03</b>
              <span>Satellite data sources</span>
            </div>
            <div>
              <b>05+</b>
              <span>Geospatial analysis layers</span>
            </div>
            <div>
              <b>17</b>
              <span>SDG goals in view</span>
            </div>
          </div>
        </div>

        {/* Right — login card */}
        <aside className="login-card">
          <h2>Welcome back</h2>
          <p>Sign in to your Jal Sanchay research workspace.</p>

          <form onSubmit={handleLogin}>
            <label className="field">
              <span style={{ fontFamily: "Georgia, serif" }}>Email address</span>
             <input
  type="email"
  placeholder="name@institution.edu"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
/>
            </label>

            <label className="field">
              <span style={{ fontFamily: "Georgia, serif" }}>Password</span>
             <input
  type="password"
  placeholder="••••••••"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
/>
            </label>

            <div className="card-meta">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <a href="#">Forgot password?</a>
            </div>

            <button
  className="button primary"
  type="submit"
  disabled={loading}
>
  {loading ? "Signing in..." : "Secure sign in →"}
</button>

          </form>

          <div className="register">
            New research collaborator?{" "}
           <Link to="/register">Create an account</Link>
          </div>
        </aside>
      </div>
    </section>
  );
}