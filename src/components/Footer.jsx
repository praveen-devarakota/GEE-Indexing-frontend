import React from "react";
import "../styles/homepage.css";

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer-grid">
          {/* Brand blurb */}
          <div>
            <div className="footer-brand">Jal Sanchay</div>
            <p>
              Geospatial decision support for water conservation, sustainable
              agriculture and accountable development outcomes.
            </p>
          </div>

          {/* Navigate */}
          <div>
            <h4>Navigate</h4>
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#capabilities">Capabilities</a>
            <a href="#contact">Contact</a>
          </div>

          {/* Institutions */}
          <div>
            <h4>Institutions</h4>
            <a href="https://www.isro.gov.in/" target="_blank" rel="noreferrer">
              ISRO
            </a>
            <a href="#">Siddhartha Academy</a>
            <a href="#">Project acknowledgements</a>
          </div>

          {/* Contact */}
          <div>
            <h4>Contact</h4>
            <p>Research &amp; Development Cell</p>
            <a href="mailto:research@jalsanchay.org">
              research@jalsanchay.org
            </a>
            <p>India</p>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Jal Sanchay. All rights reserved.</span>
          <span>
            Developing Efficient Local Scale Impact Evaluation Tools Using
            Geospatial Systems.
          </span>
        </div>
      </div>
    </footer>
  );
}
