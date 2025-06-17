import React from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

export default function ParticlesBackground() {
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: -1 },
        background: {
          color: {
            value: "#ffffff"
          }
        },
        particles: {
          number: {
            value: 30,
            density: {
              enable: true,
              area: 800
            }
          },
          color: {
            value: "#00bfff"
          },
          shape: {
            type: "circle"
          },
          opacity: {
            value: 0.3,
            random: true
          },
          size: {
            value: 10,
            random: true
          },
          move: {
            direction: "top",
            enable: true,
            outModes: {
              default: "out"
            },
            speed: 2
          }
        },
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "bubble"
            },
            resize: true
          },
          modes: {
            bubble: {
              distance: 200,
              size: 15,
              duration: 2,
              opacity: 0.5,
              speed: 3
            }
          }
        }
      }}
    />
  );
}
