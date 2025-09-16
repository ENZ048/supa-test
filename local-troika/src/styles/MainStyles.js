import styled, { keyframes } from "styled-components";

const slideOut = keyframes`
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  40% {
    transform: scale(0.97);
  }
  100% {
    opacity: 0;
    transform: translateY(100px) scale(0.9);
  }
`;

const pop = keyframes`
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  60% {
    transform: scale(1.15);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
`;

const fadeInItem = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const Wrapper = styled.div`
  @keyframes slideOut {
    0% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    40% {
      transform: scale(0.97);
    }
    100% {
      opacity: 0;
      transform: translateY(100px) scale(0.9);
    }
  }

  @keyframes pop {
    0% {
      transform: scale(0.5);
      opacity: 0;
    }
    60% {
      transform: scale(1.15);
      opacity: 1;
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes fadeInItem {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    0% {
      opacity: 0;
      transform: scale(0.9);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  font-family: "Amaranth", "Poppins", sans-serif;
`;

export const Overlay = styled.div`
  opacity: 0;
  animation: fadeIn 0.4s ease forwards 0s;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: transparent;
  backdrop-filter: blur(12px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  overscroll-behavior: contain; /* prevents scroll chaining to host page */
  touch-action: pan-y; /* keeps vertical scrolling smooth inside */
  z-index: 2147481000; /* sits above WP sticky headers/admin bar */
  overflow: visible; /* Ensure buttons are not clipped */

  @media (max-width: 768px) {
    align-items: flex-start; /* Position chatbox at top on mobile */
    padding-top: 10px; /* Small top padding for mobile */
  }

  @media (max-width: 480px) {
    align-items: flex-start; /* Position chatbox at top on small mobile */
    padding-top: 5px; /* Minimal top padding for small mobile */
  }
`;

export const Chatbox = styled.div`
  &.closing {
    animation: slideOut 0.5s ease forwards;
  }
  transform: translateY(40px);
  opacity: 0;
  animation: slideUp 0.5s ease-out forwards;
  width: 100%; /* Changed from 90% */
  max-width: 380px; /* Decreased from 420px */
  height: 96vh; /* Set to 80vh for all devices */
  max-height: 96vh; /* Ensure max height is also 80vh */

  @media (max-width: 768px) and (max-height: 642px) {
    width: 95%; /* Use more of available width */
    max-width: 95%; /* Allow it to expand more */
    height: 95vh; /* Use more screen space */
    max-height: 95vh;
  }

  @media (max-width: 768px) {
    width: 95%; /* Use more of available width */
    max-width: 95%; /* Allow it to expand more */
    height: 95vh; /* Use more screen space */
    max-height: 95vh;
  }

  @media (max-width: 480px) {
    width: 98%; /* Use almost full width on mobile */
    max-width: 98%; /* Allow it to expand almost fully */
    height: 85vh; /* Use almost full screen height */
    max-height: 85vh;
  }
  background: linear-gradient(
    135deg,
    rgb(235, 224, 255) 0%,
    rgb(215, 255, 252) 100%
  );
  /* Inner rounding now that outer frame supplies bezel */
  /* Increased rounding for chat window */
  border-radius: 30px;
  /* Remove heavy outer shadow; let frame handle it */
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;

  @media (max-width: 480px) {
    /* Increased rounding for mobile while keeping inside bezel */
    border-radius: 24px;
  }
`;

export const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  position: relative;
  overflow: hidden;
  background: transparent;
`;

export const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
  background: transparent;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(241, 241, 241, 0.3);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(193, 193, 193, 0.6);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(168, 168, 168, 0.8);
  }
`;

export const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px; /* Adds space between messages */
  padding: 1.25rem;
`;
