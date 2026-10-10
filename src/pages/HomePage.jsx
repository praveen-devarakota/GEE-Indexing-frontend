import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import FeatureCards from "../components/FeatureCards";
import Footer from "../components/Footer";
import "../styles/homepage.css";

// Team section
function Team() {
  return (
    <section className="tech team">
      <div className="container" style={{ textAlign: "center" }}>
        <h2
          className="section-heading"
          style={{ color: "#ffffff", margin: "0 0 8px" }}
        >
          Our Team
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1px 1fr",
            alignItems: "start",
            gap: "0",
            padding: "40px 0",
          }}
        >
          {/* Left side — two profiles */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "50px",
              flexWrap: "wrap",
              paddingRight: "40px",
            }}
          >
            {/* Dr Suneetha Manne */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: 145,
                  height: 145,
                  borderRadius: "50%",
                  background: "#0b4d78",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src="/SunithaManne.png"
                  alt="Dr Suneetha Manne"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <strong className="team-name">Dr Suneetha Manne</strong>
              <span className="team-role" style={{ textAlign: "center", maxWidth: "180px" }}>
                Principal Investigator, Dean (Research, Development & Technology)<br />
                Professor & Head, Department of Artificial Intelligence, Siddhartha Academy of Higher Education, Vijayawada
              </span>
            </div>

            {/* Dr. Girish S Pujar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: 145,
                  height: 145,
                  borderRadius: "50%",
                  background: "#0b4d78",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src="/isro-sir.jpeg"
                  alt="Dr. Girish S Pujar"
                  style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.1)" }}
                />
              </div>
              <strong className="team-name">Dr. Girish S Pujar</strong>
              <span className="team-role" style={{ textAlign: "center", maxWidth: "180px" }}>
                Indian Space Research Organisation (ISRO), Bangalore
              </span>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              background: "rgba(255,255,255,0.2)",
              width: "1px",
              alignSelf: "stretch",
              minHeight: "200px",
            }}
          />

          {/* Right side — 4 people in 2x2 grid */}
          <div style={{
            paddingLeft: "40px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "36px",
            justifyItems: "center",
          }}>

            {/* Dr. Radhesyam Vaddi */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <strong className="team-name">Dr. Radhesyam Vaddi</strong>
              <span className="team-role" style={{ textAlign: "center", maxWidth: "160px" }}>
                Investigator, Associate Professor, Dept. of AI, Siddhartha Academy of Higher Education, Vijayawada
              </span>
            </div>

            {/* Dr. Veeramallu Satya Sahithi */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <strong className="team-name">Dr. Veeramallu Satya Sahithi</strong>
              <span className="team-role" style={{ textAlign: "center", maxWidth: "160px" }}>
                Investigator, Assistant Professor, Dept. of AI, Siddhartha Academy of Higher Education, Vijayawada
              </span>
            </div>

            {/* Hemanth Cheepulla */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <strong className="team-name">Hemanth Cheepulla</strong>
              <span className="team-role" style={{ textAlign: "center", maxWidth: "160px" }}>
                Project Associate, Dept. of AI, Siddhartha Academy of Higher Education, Vijayawada
              </span>
            </div>

            {/* Dr. MSR Murthy */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <strong className="team-name">Dr. MSR Murthy</strong>
              <span className="team-role" style={{ textAlign: "center", maxWidth: "160px" }}>
                Academic Advisor, Siddhartha Academy of Higher Education, Vijayawada
              </span>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

// Students marquee section
const students = [
  { name: "Pandu Ranga Tummuri", year: "4th year" },
  { name: "Praveen Devarakota", year: "4th year" },
  { name: "Bhimavarapu Aashika Reddy", year: "2nd year" },
  { name: "Shaik Khaja Fakhruddin", year: "2nd year" },
];

function Students() {
  // Duplicate for seamless loop
  const all = [...students, ...students];

  return (
    <section className="marquee-section">
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h2
          className="section-heading"
          style={{
            fontFamily: "Georgia, serif",
            color: "#061b32",
            fontSize: "clamp(1.4rem, 2.5vw, 2.2rem)",
            fontWeight: "700",
          }}
        >
          Student Contributors
        </h2>
      </div>
      <div style={{ overflow: "hidden" }}>
        <div className="marquee-track">
          {all.map((s, i) => (
            <div className="marquee-card" key={i}>
              <strong>
                {s.name} <small>({s.year})</small>
              </strong>
              <span>Department of Information Technology</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <section id="about">
          <div className="container intro">
            <div className="pond-visual">
              <div className="pond-badge">
                <b>Temporal intelligence</b>
                <span>Observe • Compare • Act</span>
              </div>
            </div>
            <div>
              <div className="section-tag">About Jal Sanchay</div>
              <h2 className="section-heading">A clearer view of every drop.</h2>
              <p className="section-copy">
                Jal Sanchay brings satellite imagery, GIS analysis and temporal
                monitoring into one evidence-led workspace. It helps research
                teams evaluate farm ponds, strengthen water conservation
                planning and measure the contribution of local interventions to
                National Development Mission and SDG outcomes.
              </p>
              <p className="section-copy">
                Built for rigorous local-scale impact evaluation, the platform
                turns complex spatial data into useful, traceable decisions.
              </p>
            </div>
          </div>
        </section>

        <hr
          style={{
            border: "none",
            borderTop: "2px solid #0b4d78",
            margin: "0 auto",
            width: "80%",
            opacity: 0.25,
          }}
        />

        <FeatureCards />
        <Team />
        <Students />
      </main>
      <Footer />
    </>
  );
}