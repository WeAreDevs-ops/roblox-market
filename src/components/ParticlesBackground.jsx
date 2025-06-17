import React from "react";
import { loadBubblesPreset } from "tsparticles-preset-bubbles";
import { Particles } from "react-tsparticles";
import { useMemo } from "react";

export default function ParticlesBackground() {
  const options = useMemo(() => ({
    preset: "bubbles",
    fullScreen: {
      enable: true,
      zIndex: -1, // Keep particles behind everything
    },
    background: {
      color: {
        value: "#ffffff00" // Transparent so it blends with your theme
      }
    }
  }), []);

  const particlesInit = async (engine) => {
    await loadBubblesPreset(engine);
  };

  return <Particles init={particlesInit} options={options} />;
}
