import React from "react";
import Navbar from "../components/Navbar";
import MapWithTimeseries from "../components/MapWithTimeseries";
import "../styles/homepage.css";

export default function Dashboard() {
  return (
    <>
      <Navbar />
      <MapWithTimeseries />
    </>
  );
}