import React from "react";
import styled from "styled-components";
import RecordingBars from "./RecordingBars";

const VoiceInputIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 15px;
  margin: 0;
`;

const ListeningText = styled.div`
  font-size: 0.8rem;
  background: linear-gradient(135deg, #8a2be2, #14b8a6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-top: 8px;
  font-weight: 500;
  animation: textGlow 2s ease-in-out infinite alternate;

  @keyframes textGlow {
    0% {
      opacity: 0.8;
    }
    100% {
      opacity: 1;
    }
  }
`;

const VoiceInputIndicatorComponent = ({ isRecording }) => {
  if (!isRecording) return null;

  return (
    <VoiceInputIndicator>
      <RecordingBars isVisible={isRecording} />
      <ListeningText>Listening...</ListeningText>
    </VoiceInputIndicator>
  );
};

export default VoiceInputIndicatorComponent;
