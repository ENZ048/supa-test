import React from "react";
import styled from "styled-components";

const RecordingBarsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  height: 20px;
  margin-left: 8px;
`;

const RecordingBar = styled.div`
  width: 3px;
  height: 100%;
  background: linear-gradient(135deg, #8a2be2, #14b8a6);
  border-radius: 2px;
  animation: recordingPulse 1s ease-in-out infinite;

  @keyframes recordingPulse {
    0%,
    100% {
      height: 4px;
      opacity: 0.3;
    }
    50% {
      height: 16px;
      opacity: 1;
    }
  }
`;

const RecordingBars = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <RecordingBarsContainer>
      <RecordingBar style={{ animationDelay: "0s" }} />
      <RecordingBar style={{ animationDelay: "0.1s" }} />
      <RecordingBar style={{ animationDelay: "0.2s" }} />
      <RecordingBar style={{ animationDelay: "0.3s" }} />
      <RecordingBar style={{ animationDelay: "0.4s" }} />
    </RecordingBarsContainer>
  );
};

export default RecordingBars;
