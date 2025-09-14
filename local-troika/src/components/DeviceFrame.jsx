import React from "react";
import styled from "styled-components";

/* iPhone-like device frame (bezel) */
const DeviceFrame = styled.div`
  position: relative;
  width: 100%;
  max-width: 388px; /* Adjusted for narrower chat (380 + 4 + 4) */
  margin: 0 auto; /* Center the frame on all screen sizes */
  padding: 8px 4px; /* Slimmer left/right bezel */
  border-radius: 36px; /* Adjusted for slimmer profile */

  @media (max-width: 768px) and (max-height: 642px) {
    max-width: 328px; /* Adjusted for narrower chat (320 + 4 + 4) */
  }

  @media (max-width: 768px) {
    max-width: 358px; /* Adjusted for narrower chat (350 + 4 + 4) */
  }
  background: rgb(0, 0, 0); /* Clean white device frame */
  box-shadow: 0 4px 18px rgba(138, 43, 226, 0.15),
    0 2px 5px rgba(20, 184, 166, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.2); /* Black border outline */
  display: flex;
  align-items: stretch;
  justify-content: center;
  overflow: visible; /* Ensure buttons are not clipped */
  -webkit-mask-image: none; /* Remove mask to prevent button clipping */

  /* Ensure buttons are visible outside the frame */
  &::before,
  &::after {
    z-index: 1; /* Lower than buttons */
  }

  /* Subtle inner shadow around the glass edge */
  &:after {
    content: "";
    position: absolute;
    inset: 2px;
    border-radius: 32px;
    pointer-events: none;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15),
      inset 0 0 5px rgba(138, 43, 226, 0.05),
      inset 0 0 2px rgba(20, 184, 166, 0.05);
  }

  /* iPhone-like notch/Dynamic Island */
  &:before {
    content: "";
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 28px;
    background: rgb(0, 0, 0);
    border-radius: 16px;
    z-index: 50;
    box-shadow: 0 2px 8px rgba(138, 43, 226, 0.2);
  }

  /* Bottom gesture bar */
  .gesture-bar {
    position: absolute;
    bottom: 4px; /* Slightly raised due to uniform bezel */
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 4px;
    background: linear-gradient(
      90deg,
      rgba(138, 43, 226, 0.3),
      rgba(20, 184, 166, 0.2)
    );
    border-radius: 3px;
    filter: blur(0.2px);
  }

  @media (max-width: 480px) {
    max-width: 340px; /* Reduced width for mobile devices */
    padding: 8px 4px; /* Keep consistent bezel thickness */
    border-radius: 30px;
    &:after {
      inset: 2px;
      border-radius: 26px;
    }
    &:before {
      top: 10px;
      width: 80px;
      height: 24px;
      border-radius: 14px;
    }
    .gesture-bar {
      bottom: 4px;
      width: 78px;
      height: 3px;
    }
  }
`;

/* iPhone-style Power Button (Mock/Decorative) */
const PowerButton = styled.div`
  position: absolute;
  right: -4px;
  top: 185px;
  width: 10px;
  height: 60px;
  background: rgb(0, 0, 0);
  border-radius: 4px 0 0 4px;
  box-shadow: inset 0 0 3px rgba(255, 255, 255, 0.2),
    inset 0 -2px 6px rgba(138, 43, 226, 0.3), 0 2px 8px rgba(138, 43, 226, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  z-index: -1;
  pointer-events: none;

  @media (max-width: 480px) {
    right: -3px;
    top: 165px;
    width: 8px;
    height: 50px;
  }
`;

/* iPhone-style Volume Buttons (Mock/Decorative) */
const VolumeUpButton = styled.div`
  position: absolute;
  left: -4px;
  top: 195px;
  width: 10px;
  height: 35px;
  background: rgb(0, 0, 0);
  border-radius: 0 4px 4px 0;
  box-shadow: inset 0 0 3px rgba(255, 255, 255, 0.2),
    inset 0 -2px 6px rgba(138, 43, 226, 0.3), 0 2px 8px rgba(138, 43, 226, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  z-index: -1;
  pointer-events: none;

  @media (max-width: 480px) {
    left: -3px;
    top: 175px;
    width: 8px;
    height: 30px;
  }
`;

const VolumeDownButton = styled.div`
  position: absolute;
  left: -4px;
  top: 240px;
  width: 10px;
  height: 35px;
  background: rgb(0, 0, 0);
  border-radius: 0 4px 4px 0;
  box-shadow: inset 0 0 3px rgba(255, 255, 255, 0.2),
    inset 0 -2px 6px rgba(138, 43, 226, 0.3), 0 2px 8px rgba(138, 43, 226, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  z-index: -1;
  pointer-events: none;

  @media (max-width: 480px) {
    left: -3px;
    top: 215px;
    width: 8px;
    height: 30px;
  }
`;

/* iPhone-style Silent/Ringer Switch (Mock/Decorative) */
const SilentSwitch = styled.div`
  position: absolute;
  left: -4px;
  top: 155px;
  width: 10px;
  height: 20px;
  background: rgb(0, 0, 0);
  border-radius: 0 4px 4px 0;
  box-shadow: inset 0 0 3px rgba(255, 255, 255, 0.2),
    inset 0 -2px 6px rgba(138, 43, 226, 0.3), 0 2px 8px rgba(138, 43, 226, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  z-index: -1;
  pointer-events: none;

  @media (max-width: 480px) {
    left: -3px;
    top: 140px;
    width: 8px;
    height: 18px;
  }
`;

const DeviceFrameComponent = ({ children }) => {
  return (
    <DeviceFrame>
      {/* iPhone-style Hardware Buttons (Mock/Decorative) */}
      <PowerButton />
      <SilentSwitch />
      <VolumeUpButton />
      <VolumeDownButton />
      {children}
    </DeviceFrame>
  );
};

export default DeviceFrameComponent;
