import React from "react";
import "../styles/homepage.css";

const features = [
  {
    icon: "◌",
    title: "About & Help",
    description: "Learn more about our platform and get the support you needed.",
  },
  {
    icon: "▤",
    title: "Analytical Dashboard",
    description:
      "Turn spatial evidence into clear views, reports and decision-ready insights.",
  },
  {
    icon: "∿",
    title: "Phenological Analytics",
    description:
      "Analyze seasonal vegetation patterns using satellite-based phonological insights.",
  },
  {
    icon: "◒",
    title: "Farm Pond Monitoring",
    description:
      "Track pond presence, surface-water dynamics and surrounding agricultural response.",
  },
  {
    icon: "◎",
    title: "SDG Assessment",
    description:
      "Link observable local impacts with development indicators and sustainability targets.",
  },
  {
    icon: "⌖",
    title: "Our Team",
    description: "Driven by creativity, united by innovation.",
  },
];

export default function FeatureCards() {
  return (
    <section className="capabilities" id="capabilities">
      <div className="container">
        <div className="heading-row">
          <div>
            <div className="section-tag">Platform capabilities</div>
            <h2 className="section-heading">Evidence, mapped into action.</h2>
          </div>
          <p className="section-copy">
            A modular environment for understanding the impact of artificial
            water conservation structures across locations and developmental
            indicators.
          </p>
        </div>

        <div className="grid">
          {features.map((f) => (
            <article className="feature" key={f.title}>
              <div className="icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
