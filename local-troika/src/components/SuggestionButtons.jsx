import React from "react";
import styled from "styled-components";

const SuggestionContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
`;

const IconContainer = styled.div`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (min-width: 481px) and (max-width: 768px) {
    left: 6px;
  }
`;

const TextContainer = styled.div`
  flex: 1;
  text-align: center;
  padding-left: 16px; /* Space for the icon */
`;

const SuggestionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%; /* <-- Add this line to fix alignment */
  padding: 12px 20px;
  /* 1. Set a transparent border to define the border's thickness */
  border: 2px solid transparent;
  border-radius: 20px;
  color: #495057;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  /* 2. Apply two backgrounds */
  background-image: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%),
    /* Inner background */
      linear-gradient(135deg, #14b8a6 0%, #3b82f6 50%, #8b5cf6 100%); /* Border gradient */

  /* 3. Define the origin and clip for each background */
  background-origin: border-box;
  background-clip: padding-box, border-box;

  /* Animation properties (unchanged) */
  opacity: 0;
  transform: translateX(-30px);
  animation: fadeInLeft 1s ease-in-out forwards;
  animation-delay: ${(props) => props.$delay || "0s"};

  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    /* Update the inner background on hover */
    background-image: linear-gradient(135deg, #ffffff 0%, #f1f3f4 100%),
      linear-gradient(135deg, #14b8a6 0%, #3b82f6 50%, #8b5cf6 100%);
  }

  &:active {
    transform: translateY(0) scale(1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
  }

  @media (max-width: 480px) {
    font-size: 0.75rem;
    padding: 10px 16px;
  }

  img {
    width: 16px;
    height: 16px;
    object-fit: contain;
    display: block;
    flex-shrink: 0;
  }
`;

// The rest of your component remains the same
const SuggestionButtons = ({ onSuggestionClick, isVisible }) => {
  const suggestions = ["Free Demo", "Database", "How it works", "Plans"];

  if (!isVisible) return null;

  return (
    <SuggestionContainer>
      {suggestions.map((suggestion, index) => (
        <SuggestionButton
          key={index}
          $delay={`${index * 1}s`} // Each button appears 1 second after the previous
          onClick={() => onSuggestionClick(suggestion)}
        >
          <ButtonContent>
            <IconContainer>
              <img src="/icons8-gemini-ai-32.png" alt="AI Icon" />
            </IconContainer>
            <TextContainer>
              {suggestion}
            </TextContainer>
          </ButtonContent>
        </SuggestionButton>
      ))}
    </SuggestionContainer>
  );
};

export default SuggestionButtons;
