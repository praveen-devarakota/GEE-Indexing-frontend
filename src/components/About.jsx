import React from "react";
import "../styles/homepage.css";

export default function About() {
  return (
    <section id="about">
      <div className="container intro">
        {/* Pond visual */}
        <div className="pond-visual">
          <div className="pond-badge">
            <b>Temporal intelligence</b>
            <span>Observe • Compare • Act</span>
          </div>
        </div>

        {/* Text */}
        <div>
          <div className="section-tag">About Jal Sanchay</div>
          <h2 className="section-heading">A clearer view of every drop.</h2>

          <p className="section-copy">
            Jal Sanchay brings satellite imagery, GIS analysis and temporal
            monitoring into one evidence-led workspace. It helps research teams
            evaluate farm ponds, strengthen water conservation planning and
            measure the contribution of local interventions to National
            Development Mission and SDG outcomes.
          </p>

          <p className="section-copy">
            Built for rigorous local-scale impact evaluation, the platform turns
            complex spatial data into useful, traceable decisions.
          </p>
        </div>
      </div>
    </section>
  );
}
