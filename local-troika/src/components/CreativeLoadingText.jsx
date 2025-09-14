import React, { useState, useEffect } from "react";
import styled from "styled-components";

const LoadingTextWrapper = styled.div`
  background: #000000;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 14px;
  font-weight: 500;
  opacity: 0.8;
  animation: fadeInOut 2s ease-in-out infinite;

  @keyframes fadeInOut {
    0%,
    100% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
  }
`;

const CreativeLoadingText = () => {
  const loadingTexts = [
    "Polishing brilliance...",
    "Wiring up possibilities...",
    "Coding elegance into growth...",
    "Brewing digital magic...",
    "Sculpting your success...",
    "Thinking deeply...",
  ];

  const [currentText, setCurrentText] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText(Math.floor(Math.random() * loadingTexts.length));
    }, 2000); // Change text every 2 seconds

    return () => clearInterval(interval);
  }, [loadingTexts.length]);

  return <LoadingTextWrapper>{loadingTexts[currentText]}</LoadingTextWrapper>;
};

export default CreativeLoadingText;
