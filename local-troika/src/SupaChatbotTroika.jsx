import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from "react";
import ClipLoader from "react-spinners/ClipLoader";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiMail, FiArrowRight } from "react-icons/fi";
import { FaVolumeUp, FaStopCircle } from "react-icons/fa";
import { TypeAnimation } from "react-type-animation";
import { IoSend } from "react-icons/io5";
import { FiMic, FiSquare, FiVolume2, FiVolumeX } from "react-icons/fi";
import ReactMarkdown from "react-markdown";

const GlobalStyle = createGlobalStyle`
  * {
    font-family: "Hanken Grotesk", "Amaranth", "Poppins", sans-serif;
  }

  /* Cosmic Circle Pulse Animation */
.cosmic-circle {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cosmic-core {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: radial-gradient(circle, #ffffff 0%, #60a5fa 30%, #a855f7 70%, transparent 100%);
  box-shadow: 
    0 0 20px #60a5fa,
    0 0 40px #a855f7,
    0 0 60px #ffffff,
    inset 0 0 20px rgba(255, 255, 255, 0.3);
  animation: core-glow 2s ease-in-out infinite alternate;
  z-index: 3;
}

.pulse-ring {
  position: absolute;
  border: 2px solid transparent;
  border-radius: 50%;
  animation: pulse-expand 3s ease-out infinite;
}

.pulse-ring-1 {
  width: 80px;
  height: 80px;
  border-color: rgba(96, 165, 250, 0.6);
  animation-delay: 0s;
}

.pulse-ring-2 {
  width: 120px;
  height: 120px;
  border-color: rgba(168, 85, 247, 0.4);
  animation-delay: 1s;
}

.pulse-ring-3 {
  width: 160px;
  height: 160px;
  border-color: rgba(255, 255, 255, 0.3);
  animation-delay: 2s;
}

@keyframes core-glow {
  0% {
    transform: scale(0.9);
    opacity: 0.8;
    box-shadow: 
      0 0 15px #60a5fa,
      0 0 30px #a855f7,
      0 0 45px #ffffff,
      inset 0 0 15px rgba(255, 255, 255, 0.2);
  }
  100% {
    transform: scale(1.1);
    opacity: 1;
    box-shadow: 
      0 0 25px #60a5fa,
      0 0 50px #a855f7,
      0 0 75px #ffffff,
      inset 0 0 25px rgba(255, 255, 255, 0.4);
  }
}

@keyframes pulse-expand {
  0% {
    transform: scale(0.5);
    opacity: 0.8;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .cosmic-circle {
    width: 150px;
    height: 150px;
  }
  
  .cosmic-core {
    width: 30px;
    height: 30px;
  }
  
  .pulse-ring-1 {
    width: 60px;
    height: 60px;
  }
  
  .pulse-ring-2 {
    width: 90px;
    height: 90px;
  }
  
  .pulse-ring-3 {
    width: 120px;
    height: 120px;
  }
}

.cosmic-circle {
  will-change: transform;
}

.cosmic-core, .pulse-ring {
  will-change: transform, opacity;
}

`;

const Wrapper = styled.div`
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

const Overlay = styled.div`
  opacity: 0;
  animation: fadeIn 0.4s ease forwards 0s;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 96vh;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0rem; /* Added for spacing on smaller screens */
  overscroll-behavior: contain; /* prevents scroll chaining to host page */
  touch-action: pan-y; /* keeps vertical scrolling smooth inside */
  z-index: 2147481000; /* sits above WP sticky headers/admin bar */
`;

const Chatbox = styled.div`
  &.closing {
    animation: slideOut 0.5s ease forwards;
  }
  transform: translateY(40px);
  opacity: 0;
  animation: slideUp 0.5s ease-out forwards;
  width: 100%; /* Changed from 90% */
  max-width: 420px;
  height: 95vh; /* Adjusted for better viewport fit */
  max-height: 700px;
  background-color: #fff6f0;

  /* 1. Base background changed from white to a light gray */
  background-color: #f4f4f8; /* CHANGED from #FFFFFF */

  /* 2. Layered radial gradients with increased opacity */
  background-image:
    /* Top-right aura using your purple color #4313a5 */ radial-gradient(
      ellipse 50% 60% at 90% 20%,
      /* Shape and position */ rgba(67, 19, 165, 0.15),
      /* CHANGED: Opacity increased to 15% */ transparent 80%
        /* Fade to transparent */
    ),
    /* Bottom-left aura using your teal color #017977 */
      radial-gradient(
        ellipse 70% 60% at 10% 90%,
        /* Shape and position */ rgba(1, 121, 119, 0.18),
        /* CHANGED: Opacity increased to 18% */ transparent 80%
          /* Fade to transparent */
      );

  /* Make the background stay fixed while content scrolls */
  background-attachment: fixed;

  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;

  @media (max-width: 480px) {
    height: 97vh;
    max-height: 100vh;
    border-radius: 15px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: none;
  background: transparent;
  flex-shrink: 0;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const Avatar = styled.img`
  width: auto !important;
  height: 70px !important; /* Increased size */
`;

const StatusBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const BotName = styled.div`
  font-weight: 800;
  color: balck;
  font-size: 1.25rem;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const Status = styled.div`
  font-size: 0.7rem;
  color: #666;
  text-align: center;
`;

const CloseBtn = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 2.5rem;
  font-weight: bold;
  cursor: pointer;
  color: #333;
  transition: transform 0.3s ease-in-out, color 0.2s ease;
  z-index: 10;

  &:hover {
    transform: rotate(90deg);
    color: #666;
  }
`;

const AuthContainer = styled.div`
  animation: slideDown 0.5s ease-in-out 0.6s;
  animation-fill-mode: both;
  position: absolute;
  top: 95px; /* height of your chat header */
  left: 0;
  right: -6px;
  bottom: 0;
  width: 90%;
  height: calc(100% - 127px); /* subtract header */
  background: #fff;
  z-index: 20;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
`;

const IconCircle = styled.div`
  animation: pop 3s ease-in-out;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(
    90deg,
    hsla(344, 97%, 63%, 1) 0%,
    hsla(232, 90%, 59%, 1) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
  flex-shrink: 0; /* Prevent shrinking */
`;

const StyledMailIcon = styled(FiMail)`
  color: white;
  font-size: 36px;
`;

const Title = styled.h2`
  animation: fadeInItem 0.5s ease 0.7s both;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1.5rem 0 0.5rem 0;
  color: #4b4b4b;
`;

const SubTitle = styled.p`
  animation: fadeInItem 0.5s ease 0.9s both;
  font-size: 0.875rem;
  color: #777;
  margin-bottom: 2rem;
  max-width: 320px; /* Constrain width for better readability */
  text-align: center;
`;

const Input = styled.input`
  animation: fadeInItem 0.5s ease 1.1s both;
  width: 87%;
  max-width: 370px;
  padding: 1rem;
  font-size: 0.875rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  outline: none;
  margin-bottom: 1rem;
  transition: border-color 0.3s;
  text-align: center; /* Center placeholder and input text */

  &::placeholder {
    text-align: center; /* Specifically center placeholder */
  }

  &:focus {
    border-color: #a97fff;
  }
`;

const bounceX = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(0);
  }
  40% {
    transform: translateX(-6px);
  }
  60% {
    transform: translateX(4px);
  }
`;

const Button = styled.button`
  animation: fadeInItem 0.5s ease 1.3s both;
  width: 100%;
  max-width: 250px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  background: linear-gradient(90deg, #bc3d19 0%, rgba(188, 61, 25, 0.8) 100%);
  color: white;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: all 0.25s ease;

  &:not(:disabled):hover {
    transform: scale(1.03);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
    opacity: 0.95;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .infinite-arrow {
    animation: ${bounceX} 1.2s infinite ease-in-out;
    position: relative;
    top: 1px;
    display: inline-block;
  }
`;

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  position: relative;
  overflow: hidden;
  background: transparent;
`;

const MessagesContainer = styled.div`
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

const InputContainer = styled.div`
  flex-shrink: 0;
  padding: 1.25rem;
  border-top: none;
  background: transparent;
  position: relative;
`;

const ChatInput = styled.input`
  /* reserve enough space on the right for the icon buttons to avoid overlap */
  padding: 1rem 140px 1rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 25px;
  font-size: 0.875rem;
  width: 100%;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.3s;
  background: white;
  &:focus {
    border-color: #a97fff;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

const InputButtons = styled.div`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 8px;

  /* Make all buttons inside input container black */
  button {
    color: rgba(46, 67, 86, 1) !important;
    /* If using SVG icons, also force their color */
    svg {
      color: rgba(46, 67, 86, 1) !important;
    }
  }

  /* ensure buttons don't unexpectedly cover text on small screens */
  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const MessageWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  margin: 0.625rem 0;
  justify-content: ${(props) => (props.$isUser ? "flex-end" : "flex-start")};
  padding: ${(props) => (props.$isUser ? "0 12px 0 0" : "0 0 0 12px")};

  & > div {
    display: flex;
    flex-direction: column;
    align-items: ${(props) => (props.$isUser ? "flex-end" : "flex-start")};
    max-width: 80%; /* Prevent messages from being too wide */
  }
`;

const MessageBubble = styled.div`
  padding: 12px 20px;
  font-size: 1rem;
  line-height: 1.5;
  word-wrap: break-word;
  max-width: 90%;
  overflow: visible;

  /* Conditional styles for the USER's message (right side) */
  ${(props) =>
    props.$isUser
      ? `
    background: #000000;
    color: white;
    align-self: flex-end; /* Aligns the bubble to the right */
    /* top-left | top-right | bottom-right | bottom-left */
    border-radius: 22px 22px 5px 22px; 
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  `
      : `
  /* Conditional styles for the BOT's message (left side) */
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    color: black;
    align-self: flex-start; /* Aligns the bubble to the left */
    /* top-left | top-right | bottom-right | bottom-left */
    border-radius: 22px 22px 22px 5px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  `}
`;

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px; /* Adds space between messages */
  padding: 1.25rem;
`;

const Timestamp = styled.span`
  font-size: 0.625rem;
  color: #888;
  margin-top: 0.375rem;
`;

const TypingBubble = styled(MessageBubble)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  /* Add triangular tail for typing bubble */
  &::before {
    content: "";
    position: absolute;
    left: -8px;
    bottom: 12px;
    width: 0;
    height: 0;
    border-right: 8px solid rgba(255, 255, 255, 0.9);
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
  }
`;

const glow = keyframes`
 0% { box-shadow: 0 0 0px #cc33ff; }
 50% { box-shadow: 0 0 12px #cc33ff; }
 100% { box-shadow: 0 0 0px #cc33ff; }
`;


const OtpContainer = styled.div`
  padding: 0px 24px 24px 24px;
  text-align: center;
  width: 100%;
`;

const Back = styled.div`
  text-align: left;
  cursor: pointer;
  font-size: 24px;
  color: #888;
  margin-bottom: 20px;
  transition: color 0.2s ease;

  &:hover {
    color: #555;
  }
`;

const Shield = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  border-radius: 50%;
  margin: 0 auto 24px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${glow} 2s infinite;
`;

const OtpTitle = styled.h2`
  color: #a855f7;
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
`;

const SubText = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0 0 4px 0;
  line-height: 1.4;
`;

const EmailText = styled.p`
  color: #a855f7;
  font-weight: 600;
  margin: 0 0 32px 0;
  font-size: 14px;
`;

const OtpInputContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.375rem; /* Reduced gap for smaller inputs */
  margin: 0 0 1.5rem 0;
  padding: 0;
`;

const OtpInputBox = styled.input`
  width: 32px !important; /* Made boxes even smaller */
  height: 40px !important;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  background: #f9fafb;
  color: #111827;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: #a855f7;
    background: white;
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type="number"] {
    -moz-appearance: textfield;
  }
`;

const VerifyButton = styled.button`
  background: linear-gradient(135deg, #bc3d19, rgba(188, 61, 25, 0.8));
  color: white;
  font-weight: 600;
  font-size: 14px;
  padding: 14px 24px;
  border-radius: 12px;
  border: none;
  width: 100%;
  margin: 0 0 20px 0;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(188, 61, 25, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ResendLink = styled.p`
  color: #666;
  font-size: 13px;
  margin: 0;
  line-height: 1.4;

  span {
    color: #a855f7;
    cursor: pointer;
    font-weight: 600;
    text-decoration: underline;

    &:hover {
      color: #9333ea;
    }
  }
`;

const SendButton = styled.button`
  background: transparent;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #bc3d19;
  transition: all 0.3s ease;
  flex-shrink: 0;

  svg {
    color: inherit;
    flex-shrink: 0;
    font-size: 25px;
  }

  &:hover:not(:disabled) {
    transform: scale(1.1);
    color: #9333ea;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }
`;

const MuteButton = styled.button`
  background: transparent;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${(props) => (props.$isMuted ? "#ef4444" : "#BC3D19")};
  transition: all 0.3s ease;
  flex-shrink: 0;
  outline: none;

  &:focus {
    outline: none;
    box-shadow: none;
  }

  &:focus-visible {
    outline: none;
  }

  svg {
    color: inherit;
    flex-shrink: 0;
    font-size: 25px;
  }

  &:hover:not(:disabled) {
    transform: scale(1.1);
    color: ${(props) => (props.$isMuted ? "#dc2626" : "#9333ea")};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }
`;

const floatUnit = keyframes`
 0%, 100% {
  transform: translateY(0px);
 }
 50% {
  transform: translateY(-6px);
 }
`;

const FloatingUnit = styled.div`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${floatUnit} 3s ease-in-out infinite;

  @media (max-width: 480px) {
    bottom: 0.5rem;
    right: 0.5rem;
  }
`;

const Label = styled.div`
  background: linear-gradient(90deg, #273c47 0%, #5a3fcf 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(67, 19, 165, 0.18);
  text-shadow: 0 1px 4px rgba(1, 121, 119, 0.18);
  opacity: 0.98;
  border: 1px solid #232946;
  padding: 4px 35px; /* Adjusted padding */
  border-radius: 12px;
  font-weight: 800;
  font-size: 1rem; /* Adjusted font size */
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transform: translate(3px, -4px);
  margin-bottom: 0.5rem; /* Added margin */
`;

const ChatButton = styled.button`
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }

  img {
    width: auto;
    height: 90px; /* Adjusted size */
    @media (max-width: 480px) {
      height: 70px; /* Smaller on mobile */
    }
  }
`;

const VoiceButton = styled.button`
  background: transparent;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${(props) => (props.$isRecording ? "#ef4444" : "#BC3D19")};
  transition: all 0.3s ease;
  flex-shrink: 0;
  position: relative;
  z-index: 9999; /* Higher than overlay */
  transform: ${(props) => (props.$isRecording ? "scale(1.1)" : "scale(1)")};

  /* Add pulsing animation when recording */
  ${(props) =>
    props.$isRecording &&
    `
    animation: pulse 1s infinite;
  `}

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
    100% {
      opacity: 1;
    }
  }

  svg {
    color: inherit;
    flex-shrink: 0;
    font-size: 25px;
  }

  &:hover:not(:disabled) {
    transform: ${(props) => (props.$isRecording ? "scale(1.2)" : "scale(1.1)")};
    color: ${(props) => (props.$isRecording ? "#dc2626" : "#9333ea")};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }
`;

const VoiceMobileInstructions = styled.p`
  text-align: center;
  color: #888;
  font-size: 0.75rem;
  margin: 0.5rem 0 0 0;

  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 0 0.5rem;
  }
`;

const MessageActions = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.375rem;
  gap: 0.5rem;
  justify-content: ${(props) => (props.$isUser ? "flex-end" : "flex-start")};
`;

const PlayButton = styled.button`
  background: rgba(188, 61, 25, 0.1);
  border: 1px solid rgba(188, 61, 25, 0.3);
  border-radius: 50%;
  cursor: pointer;
  color: #bc3d19;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  transition: all 0.2s ease;
  width: 28px;
  height: 28px;
  font-size: 12px;
  outline: none;

  &:focus {
    outline: none;
    box-shadow: none;
  }

  &:focus-visible {
    outline: none;
  }

  &:hover {
    background: rgba(188, 61, 25, 0.2);
    border-color: rgba(188, 61, 25, 0.5);
    transform: scale(1.1);
  }

  &:disabled {
    background: rgba(168, 85, 247, 0.3);
    border-color: rgba(168, 85, 247, 0.6);
    cursor: default;
    transform: none;
  }
`;

const ProductCardsContainer = styled.div`
  margin-top: 12px;
  width: calc(100% + 40px);
  margin-left: -20px;
  margin-right: -20px;
  padding-left: 0 !important;
  padding-right: 0 !important;
  overflow: visible;
  box-sizing: border-box;
  max-width: none !important;

  @media (max-width: 480px) {
    width: calc(100% + 40px);
    margin-left: -20px;
    margin-right: -20px;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
`;

const ProductCarousel = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  overflow-y: visible;
  padding: 8px 20px;
  scroll-behavior: smooth;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  width: 100%;
  justify-content: flex-start;

  /* Hide scrollbar completely */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Firefox */
  scrollbar-width: none;

  /* Prevent text selection during drag */
  &.dragging {
    scroll-behavior: auto;
  }
`;

const ProductCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  width: 280px;
  flex-shrink: 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    border-color: #bc3d19;
    background: linear-gradient(
      135deg,
      #ffffff 0%,
      rgba(188, 61, 25, 0.02) 100%
    );
  }

  @media (max-width: 480px) {
    min-width: 240px;
    max-width: 240px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

    &:hover {
      transform: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      border-color: #bc3d19;
      background: linear-gradient(
        135deg,
        #ffffff 0%,
        rgba(188, 61, 25, 0.02) 100%
      );
    }
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  object-position: top;
  background: #f9fafb;

  @media (max-width: 480px) {
    height: 140px;
  }
`;

const ProductContent = styled.div`
  padding: 12px;

  @media (max-width: 480px) {
    padding: 10px;
  }
`;

const ProductTitle = styled.h3`
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 6px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: 480px) {
    font-size: 12px;
    margin: 0 0 4px 0;
  }
`;

const ProductPrice = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #059669;
  margin-bottom: 6px;

  @media (max-width: 480px) {
    font-size: 13px;
    margin-bottom: 4px;
  }
`;

const ProductSizes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-bottom: 8px;

  @media (max-width: 480px) {
    gap: 2px;
    margin-bottom: 6px;
  }
`;

const SizeTag = styled.span`
  background: #f3f4f6;
  color: #374151;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;

  @media (max-width: 480px) {
    padding: 1px 3px;
    font-size: 9px;
  }
`;

const ProductLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #bc3d19;
  color: white;
  text-decoration: none;
  padding: 6px 10px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(188, 61, 25, 0.3);
    background: linear-gradient(135deg, #bc3d19, rgba(188, 61, 25, 0.9));
    color: #fff8f0;
  }

  @media (max-width: 480px) {
    padding: 5px 8px;
    font-size: 10px;
    gap: 3px;

    &:hover {
      transform: none;
    }
  }
`;

const CarouselButton = styled.button`
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  max-width: 40px;
  max-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #000000;
  font-size: 20px;
  font-weight: bold;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  padding: 0;
  margin: 0;
  line-height: 1;

  ${(props) => (props.$side === "left" ? "left: 10px;" : "right: -60px;")}

  &:hover:not(:disabled) {
    transform: translateY(-50%) scale(1.1);
    color: #bc3d19;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    border-color: rgba(188, 61, 25, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(-50%) scale(0.95);
  }

  &:focus-visible {
    outline: 2px solid rgba(188, 61, 25, 0.5);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    color: #999999;
  }

  svg {
    width: 28px;
    height: 28px;
    color: currentColor;
    fill: currentColor;
    stroke: currentColor;
    stroke-width: 1;
  }

  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    font-size: 18px;

    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

const ProductCardComponent = ({ product }) => {
  const formatPrice = (price) => {
    if (!price) return "Price not available";
    const numPrice = parseInt(price);
    if (isNaN(numPrice)) return "Price not available";
    return `₹${numPrice.toLocaleString("en-IN")}`;
  };

  return (
    <ProductCard>
      <ProductImage
        src={
          product.image || "https://via.placeholder.com/300x200?text=No+Image"
        }
        alt={product.title || "Product"}
        onError={(e) => {
          e.target.src =
            "https://via.placeholder.com/300x200?text=Image+Not+Available";
        }}
      />
      <ProductContent>
        <ProductTitle>
          {product.title || "Product Title Not Available"}
        </ProductTitle>
        <ProductPrice>{formatPrice(product.price)}</ProductPrice>
        {product.available_sizes && product.available_sizes.length > 0 && (
          <ProductSizes>
            {product.available_sizes.slice(0, 6).map((size, index) => (
              <SizeTag key={index}>{size}</SizeTag>
            ))}
            {product.available_sizes.length > 6 && (
              <SizeTag>+{product.available_sizes.length - 6} more</SizeTag>
            )}
          </ProductSizes>
        )}
        {product.url && (
          <ProductLink
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            View Product
            <FiArrowRight size={12} />
          </ProductLink>
        )}
      </ProductContent>
    </ProductCard>
  );
};

const ProductCardsComponent = ({ productCards }) => {
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const totalCards = productCards?.cards?.length ?? 0;

  const scrollLeftArrow = () => {
    if (carouselRef.current) {
      const cardWidth = 280 + 12; // card width + gap
      carouselRef.current.scrollBy({
        left: -cardWidth,
        behavior: "smooth",
      });
    }
  };

  const scrollRightArrow = () => {
    if (carouselRef.current) {
      const cardWidth = 280 + 12; // card width + gap
      carouselRef.current.scrollBy({
        left: cardWidth,
        behavior: "smooth",
      });
    }
  };

  const updateScrollState = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
  const maxScrollLeft = el.scrollWidth - el.clientWidth - 1;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < maxScrollLeft);
  }, []);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
    carouselRef.current.style.cursor = "grabbing";
    carouselRef.current.classList.add("dragging");
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (carouselRef.current) {
      carouselRef.current.style.cursor = "grab";
      carouselRef.current.classList.remove("dragging");
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (carouselRef.current) {
      carouselRef.current.style.cursor = "grab";
      carouselRef.current.classList.remove("dragging");
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
  const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
    updateScrollState();
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
    carouselRef.current.classList.add("dragging");
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
    updateScrollState();
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (carouselRef.current) {
      carouselRef.current.classList.remove("dragging");
    }
  };

  useEffect(() => {
    updateScrollState();
    const el = carouselRef.current;
    if (!el) return;
    const onScroll = () => updateScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => updateScrollState();
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (el) el.classList.remove("dragging");
    };
  }, [updateScrollState]);

  return (
    <ProductCardsContainer>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            overflow: "visible",
            flex: 1,
            boxSizing: "border-box",
          }}
        >
          <CarouselButton
            $side="left"
            onClick={scrollLeftArrow}
            title="Previous products"
            aria-label="Previous products"
            disabled={!canScrollLeft}
          >
            ‹
          </CarouselButton>
          <CarouselButton
            $side="right"
            onClick={scrollRightArrow}
            title="Next products"
            aria-label="Next products"
            disabled={!canScrollRight}
          >
            ›
          </CarouselButton>

          <ProductCarousel
            ref={carouselRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              cursor: isDragging ? "grabbing" : "grab",
            }}
          >
            {(productCards?.cards ?? []).map((product, index) => (
              <ProductCardComponent key={index} product={product} />
            ))}
          </ProductCarousel>
        </div>
      </div>
    </ProductCardsContainer>
  );
};

const OtpInputComponent = ({ otp, setOtp }) => {
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  const handleChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    if (value && !/^[0-9]$/.test(value)) {
      return;
    }

    const newOtp = otp.split("");
    newOtp[index] = value;
    setOtp(newOtp.join(""));

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = otp.split("");
        newOtp[index] = "";
        setOtp(newOtp.join(""));
      }
    }

    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const numbers = text.replace(/\D/g, "").slice(0, 6);
        setOtp(numbers.padEnd(6, ""));

        const nextIndex = Math.min(numbers.length, 5);
        inputRefs.current[nextIndex]?.focus();
      });
    }

    // Only allow numbers and control keys
    if (
      !/[0-9]/.test(e.key) &&
      ![
        "Backspace",
        "Delete",
        "Tab",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
      ].includes(e.key)
    ) {
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    const numbers = paste.replace(/\D/g, "").slice(0, 6);
    setOtp(numbers.padEnd(6, ""));

    const nextIndex = Math.min(numbers.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <OtpInputContainer>
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <OtpInputBox
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otp[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          autoComplete="one-time-code"
        />
      ))}
    </OtpInputContainer>
  );
};

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="typing-indicator">
        <div className="typing-circle" />
        <div className="typing-circle" />
        <div className="typing-circle" />
        <div className="typing-shadow" />
        <div className="typing-shadow" />
        <div className="typing-shadow" />
      </div>
    </StyledWrapper>
  );
};

const CreativeLoadingText = () => {
  const loadingTexts = [
    "Crafting magic...",
    "Weaving thoughts...",
    "Sparking ideas...",
    "Brewing brilliance...",
    "Unleashing creativity...",
    "Channeling wisdom...",
    "Generating insights...",
    "Processing brilliance...",
    "Thinking deeply...",
    "Formulating response...",
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

const LoadingTextWrapper = styled.div`
  color: #bc3d19;
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

const TypingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  padding: 12px 20px;
  min-height: 40px;
`;

const StyledWrapper = styled.div`
  .typing-indicator {
    width: 60px;
    height: 30px;
    position: relative;
    z-index: 4;
    flex-shrink: 0;
  }

  .typing-circle {
    width: 8px;
    height: 8px;
    position: absolute;
    border-radius: 50%;
    background-color: #bc3d19;
    left: 15%;
    transform-origin: 50%;
    animation: typing-circle7124 0.5s alternate infinite ease;
  }

  @keyframes typing-circle7124 {
    0% {
      top: 20px;
      height: 5px;
      border-radius: 50px 50px 25px 25px;
      transform: scaleX(1.7);
    }

    40% {
      height: 8px;
      border-radius: 50%;
      transform: scaleX(1);
    }

    100% {
      top: 0%;
    }
  }

  .typing-circle:nth-child(2) {
    left: 45%;
    animation-delay: 0.2s;
  }

  .typing-circle:nth-child(3) {
    left: auto;
    right: 15%;
    animation-delay: 0.3s;
  }

  .typing-shadow {
    width: 5px;
    height: 4px;
    border-radius: 50%;
    background-color: rgba(188, 61, 25, 0.2);
    position: absolute;
    top: 30px;
    transform-origin: 50%;
    z-index: 3;
    left: 15%;
    filter: blur(1px);
    animation: typing-shadow046 0.5s alternate infinite ease;
  }

  @keyframes typing-shadow046 {
    0% {
      transform: scaleX(1.5);
    }

    40% {
      transform: scaleX(1);
      opacity: 0.7;
    }

    100% {
      transform: scaleX(0.2);
      opacity: 0.4;
    }
  }

  .typing-shadow:nth-child(4) {
    left: 45%;
    animation-delay: 0.2s;
  }

  .typing-shadow:nth-child(5) {
    left: auto;
    right: 15%;
    animation-delay: 0.3s;
  }
`;

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
  background: #000000;
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
  color: #000000;
  margin-top: 8px;
  font-weight: 500;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.3), 0 0 10px rgba(0, 0, 0, 0.2),
    0 0 15px rgba(0, 0, 0, 0.1);
  animation: textGlow 2s ease-in-out infinite alternate;

  @keyframes textGlow {
    0% {
      text-shadow: 0 0 5px rgba(0, 0, 0, 0.3), 0 0 10px rgba(0, 0, 0, 0.2),
        0 0 15px rgba(0, 0, 0, 0.1);
    }
    100% {
      text-shadow: 0 0 8px rgba(0, 0, 0, 0.5), 0 0 16px rgba(0, 0, 0, 0.3),
        0 0 24px rgba(0, 0, 0, 0.2);
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

function stripMarkdown(markdownText) {
  return markdownText
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/[#>`]/g, "")
    .replace(/\n/g, " ");
}

// Function to get time-based greeting messages
function getTimeBasedGreeting() {
  const now = new Date();
  const hour = now.getHours();

  const morningGreetings = [
    "☀️ Good morning! Ready to kickstart your business today?",
    "Morning! A fresh day = fresh ideas. What can I solve for you?",
    "Rise & shine—let's make your business smarter today.",
  ];

  const afternoonGreetings = [
    "Hey 👋 Hope your day's going well! Need a quick business boost?",
    "Welcome! Perfect time for a smart solution—shall we start?",
    "Good afternoon! Tell me what's bugging you, I'll fix it fast.",
  ];

  const eveningGreetings = [
    "Evenings are for smart moves ✨ What's on your mind?",
    "Hey! Don't worry if it's late—business doesn't sleep, and neither do I.",
    "Good evening! Ready to make your next big business move?",
  ];

  const lateNightGreetings = [
    "🌙 Burning the midnight oil? I'm here to help.",
    "You're up late, and so am I. Let's get things done.",
    "Insomniac or hustler? Either way—I've got your back.",
  ];

  let selectedGreetings;

  if (hour >= 6 && hour < 12) {
    // Morning (6 AM – 11 AM)
    selectedGreetings = morningGreetings;
  } else if (hour >= 12 && hour < 18) {
    // Afternoon (12 PM – 5 PM)
    selectedGreetings = afternoonGreetings;
  } else if (hour >= 18 && hour < 24) {
    // Evening/Night (6 PM – 11 PM)
    selectedGreetings = eveningGreetings;
  } else {
    // Late Night (12 AM – 5 AM)
    selectedGreetings = lateNightGreetings;
  }

  // Return a random greeting from the selected time period
  return selectedGreetings[
    Math.floor(Math.random() * selectedGreetings.length)
  ];
}

const SupaChatbot = ({ chatbotId, apiBase }) => {
  const [showChat, setShowChat] = useState(false);
  // const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [animatedMessageIdx, setAnimatedMessageIdx] = useState(null);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [resendTimeout, setResendTimeout] = useState(0);
  const [resendIntervalId, setResendIntervalId] = useState(null);
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const [audioObject, setAudioObject] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [needsAuth, setNeedsAuth] = useState(false); // show OTP modal after 1st msg
  const [authMethod, setAuthMethod] = useState(null); // optional: from API
  const [email, setEmail] = useState("");
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // default unmuted
  const [requireAuthText, setRequireAuthText] = useState(
    "Verify yourself to continue chat"
  );
  const [freeMessageLimit, setFreeMessageLimit] = useState(1);
  const [freeMessagesUsed, setFreeMessagesUsed] = useState(0);
  const [freeMessagesExhausted, setFreeMessagesExhausted] = useState(false);
  const [showInlineAuth, setShowInlineAuth] = useState(false);
  const [showInlineAuthInput, setShowInlineAuthInput] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [chatbotLogo, setChatbotLogo] = useState(
    "https://raw.githubusercontent.com/troika-tech/Asset/refs/heads/main/Supa%20Agent%20new.png"
  );

  const [finalGreetingReady, setFinalGreetingReady] = useState(false);
  const [ttsGenerationInProgress, setTtsGenerationInProgress] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState(getTimeBasedGreeting());
  const ttsGenerationTimeout = useRef(null);
  const lastGeneratedGreeting = useRef(null);

  const recordingTimeout = useRef();
  const overlayRef = useRef(null);
  const chatboxRef = useRef(null);
  const endOfMessagesRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const hasMounted = useRef(false);
  const renderCountRef = useRef(0);
  const greetingAutoPlayed = useRef(false);

  const AUTH_GATE_KEY = (sid, bot) => `supa_auth_gate:${bot}:${sid}`;
  const SESSION_STORE_KEY = (method) =>
    method === "email" ? "chatbot_user_email" : "chatbot_user_phone";
  const FREE_MESSAGES_KEY = (sid, bot) => `supa_free_messages:${bot}:${sid}`;

  // Function to check and update free message count
  const checkFreeMessageLimit = useCallback(() => {
    if (!sessionId || !chatbotId) return false;

    try {
      const stored = localStorage.getItem(
        FREE_MESSAGES_KEY(sessionId, chatbotId)
      );
      const used = stored ? parseInt(stored, 10) : 0;
      setFreeMessagesUsed(used);

      // Check if user can still send free messages (used < limit)
      if (used >= freeMessageLimit) {
        setFreeMessagesExhausted(true);
        return false;
      }

      setFreeMessagesExhausted(false);
      return true;
    } catch (error) {
      console.error("Error checking free message limit:", error);
      return false;
    }
  }, [sessionId, chatbotId, freeMessageLimit]);

  // Function to increment free message count
  const incrementFreeMessageCount = useCallback(() => {
    if (!sessionId || !chatbotId) return;

    try {
      const stored = localStorage.getItem(
        FREE_MESSAGES_KEY(sessionId, chatbotId)
      );
      const current = stored ? parseInt(stored, 10) : 0;
      const newCount = current + 1;

      localStorage.setItem(
        FREE_MESSAGES_KEY(sessionId, chatbotId),
        newCount.toString()
      );
      setFreeMessagesUsed(newCount);

      // If user has reached the limit, mark that free messages are exhausted
      if (newCount >= freeMessageLimit) {
        setFreeMessagesExhausted(true);
        setNeedsAuth(true);
        // Don't set showInlineAuth here, it will be set after bot response completes
      }
    } catch (error) {
      console.error("Error updating free message count:", error);
    }
  }, [sessionId, chatbotId, freeMessageLimit]);

  // Function to generate TTS for greeting message
  const generateGreetingTTS = useCallback(
    async (greetingText, retryCount = 0) => {
      if (!apiBase || ttsGenerationInProgress) return null;

      // Audio is always enabled

      setTtsGenerationInProgress(true);

      try {
        const response = await axios.post(`${apiBase}/text-to-speech`, {
          text: greetingText,
        });

        if (response.data.audio) {
          // Convert base64 data URL to the format expected by playAudio function
          const base64Data = response.data.audio.replace(
            "data:audio/mpeg;base64,",
            ""
          );
          const byteArray = Array.from(atob(base64Data), (c) =>
            c.charCodeAt(0)
          );

          return {
            data: byteArray,
            contentType: "audio/mpeg",
          };
        }
      } catch (error) {
        console.error("Failed to generate greeting TTS:", error);

        // Retry mechanism for failed TTS generation
        if (retryCount < 2) {
          console.log(
            `Retrying greeting TTS generation (attempt ${retryCount + 1})`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (retryCount + 1))
          ); // Exponential backoff
          return generateGreetingTTS(greetingText, retryCount + 1);
        }
      } finally {
        setTtsGenerationInProgress(false);
      }
      return null;
    },
    [apiBase, ttsGenerationInProgress]
  );

  // Function to ensure greeting TTS is generated and updated in chat history
  const ensureGreetingTTS = useCallback(
    async (greetingText, forceUpdate = false) => {
      if (!apiBase || !greetingText) return;

      // Check if we already generated TTS for this exact greeting
      if (!forceUpdate && lastGeneratedGreeting.current === greetingText) {
        return;
      }

      // Clear any existing timeout
      if (ttsGenerationTimeout.current) {
        clearTimeout(ttsGenerationTimeout.current);
      }

      // Debounce TTS generation to prevent rapid successive calls
      ttsGenerationTimeout.current = setTimeout(async () => {
        // Always generate TTS for the current greeting text, even if we have audio for a different greeting
        const greetingAudio = await generateGreetingTTS(greetingText);
        if (greetingAudio) {
          // Mark this greeting as generated
          lastGeneratedGreeting.current = greetingText;

          // Update chat history with audio - ensure we're updating the correct greeting message
          setChatHistory((prev) => {
            if (prev.length === 0) {
              // Create new greeting message with audio
              return [
                {
                  sender: "bot",
                  text: greetingText,
                  audio: greetingAudio,
                },
              ];
            } else {
              // Update existing greeting message with audio
              return prev.map((msg, index) => {
                if (index === 0 && msg.sender === "bot") {
                  return { ...msg, text: greetingText, audio: greetingAudio };
                }
                return msg;
              });
            }
          });

          // Auto-play will be handled by the useEffect that watches for audio changes
        }
      }, 500); // Increased debounce to 500ms
    },
    [apiBase, generateGreetingTTS, showChat]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get(
          `${apiBase}/chatbot/${chatbotId}/config`
        );
        if (cancelled) return;
        console.log("Full API response:", data);
        console.log("API response structure:", JSON.stringify(data, null, 2));
        // The backend returns config data directly, not wrapped in a 'config' object
        const cfg = data || {};
        console.log("Backend config response:", cfg);
        console.log("Chatbot logo from backend:", cfg.chatbot_logo);
        console.log("Available config keys:", Object.keys(cfg));
        const newAuthMethod = cfg.auth_method || "whatsapp";
        const freeLimit =
          typeof cfg.free_messages === "number" ? cfg.free_messages : 1;
        setAuthMethod(newAuthMethod);
        setFreeMessageLimit(freeLimit);
        setRequireAuthText(
          cfg.require_auth_text || "Verify yourself to continue chat"
        );

        // Check if auth is required from the start
        if (cfg.require_auth_from_start) {
          setNeedsAuth(true);
          setShowInlineAuth(true); // Show inline auth instead of full screen
          setShowAuthScreen(false); // Ensure auth screen is never shown
        }

        // Also check if there's a specific config that requires immediate auth
        if (cfg.immediate_auth_required || cfg.require_auth) {
          setNeedsAuth(true);
          setShowInlineAuth(true); // Show inline auth instead of full screen
          setShowAuthScreen(false); // Ensure auth screen is never shown
        }

        // Check for existing session immediately after setting auth method
        const storeKey = SESSION_STORE_KEY(newAuthMethod);
        const saved = localStorage.getItem(storeKey);
        if (saved) {
          try {
            const qs =
              newAuthMethod === "email"
                ? `email=${encodeURIComponent(saved)}`
                : `phone=${encodeURIComponent(saved)}`;

            const url =
              newAuthMethod === "email"
                ? `${apiBase}/otp/check-session?${qs}&chatbotId=${chatbotId}`
                : `${apiBase}/whatsapp-otp/check-session?${qs}&chatbotId=${chatbotId}`;

            const res = await fetch(url);
            if (!res.ok) throw new Error("Session validation failed");
            const json = await res.json();

            if (json.valid) {
              if (newAuthMethod === "email") setEmail(saved);
              else setPhone(saved);
              setVerified(true);
              setNeedsAuth(false);
              setShowAuthScreen(false);
              setShowInlineAuth(false);
              setFreeMessagesUsed(0); // Reset free message count for verified users
              setFreeMessagesExhausted(false);
              // Set the final greeting message for verified users
              setChatHistory([
                {
                  sender: "bot",
                  text: welcomeMessage,
                },
              ]);
              setFinalGreetingReady(true);
              // Generate TTS will be handled by other useEffect hooks
            } else {
              localStorage.removeItem(storeKey);
              toast.info("Your session has expired. Please sign in again.");
              // Force inline auth to show when session is invalid
              setVerified(false);
              setNeedsAuth(true);
              setShowInlineAuth(true);
            }
          } catch (err) {
            localStorage.removeItem(storeKey);
            toast.error(
              "Unable to restore your session. Please sign in again."
            );
            // Force inline auth to show when session validation fails
            setVerified(false);
            setNeedsAuth(true);
            setShowInlineAuth(true);
          }
        }
      } catch {
        setAuthMethod("whatsapp"); // safe fallback
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiBase, chatbotId]);

  // Generate TTS for initial greeting message - works regardless of authentication
  useEffect(() => {
    const generateInitialGreetingTTS = async () => {
      if (
        chatbotId &&
        apiBase &&
        chatHistory.length === 1 &&
        chatHistory[0].sender === "bot" &&
        !chatHistory[0].audio
      ) {
        const greetingText = chatHistory[0].text;
        // Use a timeout to prevent immediate execution
        setTimeout(() => {
          ensureGreetingTTS(greetingText);
        }, 200);
      }
    };

    generateInitialGreetingTTS();
  }, [chatbotId, apiBase, chatHistory, ensureGreetingTTS]); // Added ensureGreetingTTS dependency

  const handleSendOtp = async () => {
    if (resendTimeout > 0 || !authMethod) return;
    try {
      setLoadingOtp(true);

      if (authMethod === "email") {
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
        if (!ok) return toast.error("Enter a valid email address");
        await axios.post(`${apiBase}/otp/request-otp`, { email, chatbotId });
        toast.success("OTP sent to your email!");
      } else {
        const ok = /^[6-9]\d{9}$/.test(phone);
        if (!ok) return toast.error("Enter a valid 10-digit WhatsApp number");
        await axios.post(`${apiBase}/whatsapp-otp/send`, { phone, chatbotId });
        toast.success("OTP sent to your WhatsApp number!");
      }

      setOtpSent(true);

      // start 60s resend timer
      const now = Date.now();
      localStorage.setItem("resend_otp_start", now.toString());
      setResendTimeout(60);
      let countdown = 60;
      const timer = setInterval(() => {
        countdown--;
        setResendTimeout(countdown);
        if (countdown <= 0) {
          clearInterval(timer);
          localStorage.removeItem("resend_otp_start");
        }
      }, 1000);
      setResendIntervalId(timer);
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      if (otp.length !== 6)
        return toast.error("Please enter the complete 6-digit code");
      setLoadingVerify(true);

      let res;
      if (authMethod === "email") {
        res = await axios.post(`${apiBase}/otp/verify-otp`, {
          email,
          otp,
          chatbotId,
        });
      } else {
        res = await axios.post(`${apiBase}/whatsapp-otp/verify`, {
          phone,
          otp,
          chatbotId,
        });
      }

      if (res.data.success) {
        localStorage.setItem(
          SESSION_STORE_KEY(authMethod),
          authMethod === "email" ? email : phone
        );
        setVerified(true);
        setNeedsAuth(false);
        setShowAuthScreen(false);
        setShowInlineAuth(false);
        setShowInlineAuthInput(false);
        setShowOtpInput(false);

        // 🔓 clear persisted gate and free message count so input re-enables
        try {
          const sid = sessionId || localStorage.getItem("sessionId");
          if (sid) {
            localStorage.removeItem(AUTH_GATE_KEY(sid, chatbotId));
            localStorage.removeItem(FREE_MESSAGES_KEY(sid, chatbotId));
            setFreeMessagesUsed(0);
            setFreeMessagesExhausted(false);
          }
        } catch {}

        toast.success(
          "✅ Verified successfully! You can now continue chatting."
        );
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch {
      toast.error("An error occurred during verification.");
    } finally {
      setLoadingVerify(false);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      // apply immediately to current audio if one is playing
      if (audioObject) {
        audioObject.muted = next;
      }
      return next;
    });
  };

  // ✅ FIXED VERSION
  const playAudio = useCallback(
    (audioData, messageIndex) => {
      // Audio is always enabled

      if (audioObject) {
        audioObject.pause();
        URL.revokeObjectURL(audioObject.src);
      }

      if (currentlyPlaying === messageIndex) {
        setCurrentlyPlaying(null);
        setAudioObject(null);
        return;
      }

      let byteArray = null;
      if (audioData?.data) {
        byteArray = Array.isArray(audioData.data)
          ? audioData.data
          : audioData.data.data;
      }

      if (!byteArray) return;

      try {
        const audioBuffer = new Uint8Array(byteArray);
        const mimeType = audioData.contentType || "audio/mpeg";
        const audioBlob = new Blob([audioBuffer], { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);

        const newAudio = new Audio(audioUrl);

        // 🔇 respect mute state
        newAudio.muted = isMuted;

        setAudioObject(newAudio);
        setCurrentlyPlaying(messageIndex);

        newAudio.play().catch((err) => console.error("Audio play failed", err));

        newAudio.onended = () => {
          setCurrentlyPlaying(null);
          setAudioObject(null);
          URL.revokeObjectURL(audioUrl);
        };
      } catch (error) {
        console.error("Error processing audio:", error);
      }
    },
    [audioObject, currentlyPlaying, isMuted]
  );

  useEffect(() => {
    if (audioObject) {
      audioObject.muted = isMuted;
    }
  }, [isMuted, audioObject]);

  // Auto-play greeting TTS when chat opens - improved logic
  useEffect(() => {
    if (
      showChat &&
      chatHistory.length === 1 &&
      chatHistory[0].sender === "bot" &&
      chatHistory[0].audio &&
      !greetingAutoPlayed.current
    ) {
      greetingAutoPlayed.current = true;

      // Small delay to ensure the chat is fully rendered
      const timer = setTimeout(() => {
        playAudio(chatHistory[0].audio, 0);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [showChat, chatHistory, playAudio]);

  // Additional effect to handle late TTS generation and auto-play
  useEffect(() => {
    if (
      showChat &&
      chatHistory.length === 1 &&
      chatHistory[0].sender === "bot" &&
      chatHistory[0].audio &&
      !greetingAutoPlayed.current
    ) {
      // If we have audio but haven't played it yet, play it now
      greetingAutoPlayed.current = true;
      setTimeout(() => {
        playAudio(chatHistory[0].audio, 0);
      }, 100);
    }
  }, [chatHistory, showChat, playAudio]);

  useEffect(() => {
    let id = localStorage.getItem("sessionId");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("sessionId", id);
    }
    setSessionId(id);
  }, []);

  // Set initial greeting immediately to prevent blank screen
  useEffect(() => {
    if (!finalGreetingReady && chatbotId) {
      setChatHistory([
        {
          sender: "bot",
          text: welcomeMessage,
        },
      ]);
      setFinalGreetingReady(true);
    }
  }, [chatbotId, finalGreetingReady, welcomeMessage]);

  // Ensure greeting shows even when auth is required from start
  useEffect(() => {
    if (showChat && chatHistory.length === 0 && chatbotId) {
      setChatHistory([
        {
          sender: "bot",
          text: welcomeMessage,
        },
      ]);
    }
  }, [showChat, chatHistory.length, chatbotId, welcomeMessage]);

  // Update welcome message periodically to keep it dynamic
  useEffect(() => {
    const updateWelcomeMessage = () => {
      setWelcomeMessage(getTimeBasedGreeting());
    };

    // Update immediately
    updateWelcomeMessage();

    // Set up interval to update every hour
    const interval = setInterval(updateWelcomeMessage, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, []);

  // Check free message count when sessionId or chatbotId changes
  useEffect(() => {
    if (sessionId && chatbotId && freeMessageLimit > 0) {
      checkFreeMessageLimit();
    }
  }, [sessionId, chatbotId, freeMessageLimit, checkFreeMessageLimit]);

  const handleSendMessage = useCallback(
    async (inputText) => {
      // If not verified, check free message limit first
      if (!verified) {
        const canSendFreeMessage = checkFreeMessageLimit();
        if (!canSendFreeMessage) {
          setNeedsAuth(true);
          return;
        }
      }

      // Check if user needs auth (either from free message limit or other requirements)
      if (needsAuth && !verified) {
        return;
      }

      if (!sessionId) return;

      const textToSend = inputText || message;
      if (!textToSend.trim()) return;

      if (audioObject) audioObject.pause();

      setUserHasInteracted(true);
      const userMessage = { sender: "user", text: textToSend };
      setChatHistory((prev) => [...prev, userMessage]);
      setMessage("");
      setIsTyping(true);

      // Increment free message count if user is not verified
      if (!verified) {
        incrementFreeMessageCount();
      }

      try {
        console.log("Sending query to backend:", textToSend);
        const response = await axios.post(`${apiBase}/chat/query`, {
          chatbotId,
          query: textToSend,
          sessionId,
          ...(verified ? (authMethod === "email" ? { email } : { phone }) : {}),
        });
        console.log("Backend response:", response.data);

        const { answer, audio, requiresAuthNext, auth_method, product_cards } =
          response.data;

        console.log("Answer length:", answer?.length);
        console.log("Full answer:", answer);
        console.log("Answer ends with:", answer?.slice(-50)); // Last 50 characters
        console.log("Product cards:", product_cards);

        const botMessage = {
          sender: "bot",
          text: answer || "Sorry, I couldn't get that.",
          audio,
          product_cards,
        };
        let botMessageIndex;
        setChatHistory((prev) => {
          const nh = [...prev, botMessage];
          botMessageIndex = nh.length - 1;
          return nh;
        });

        // auto play TTS if present and audio is enabled
        if (audio && true) playAudio(audio, botMessageIndex);

        // Show inline auth after bot response if free messages are exhausted
        // Use the updated count from incrementFreeMessageCount
        const currentFreeMessagesUsed = !verified
          ? freeMessagesUsed + 1
          : freeMessagesUsed;

        if (!verified && currentFreeMessagesUsed >= freeMessageLimit) {
          setShowInlineAuth(true);
        }

        // 👉 key bit: after first answer, require auth for next turn
        // But only if user has used up their free messages
        if (
          requiresAuthNext &&
          !verified &&
          currentFreeMessagesUsed >= freeMessageLimit
        ) {
          setAuthMethod(auth_method || authMethod || "whatsapp");
          setNeedsAuth(true);
          setShowInlineAuth(true);
          try {
            localStorage.setItem(AUTH_GATE_KEY(sessionId, chatbotId), "1");
          } catch {}
        } else if (requiresAuthNext && verified) {
          // If user is verified, respect backend auth requirement
          setAuthMethod(auth_method || authMethod || "whatsapp");
          setNeedsAuth(true);
          setShowInlineAuth(true);
          try {
            localStorage.setItem(AUTH_GATE_KEY(sessionId, chatbotId), "1");
          } catch {}
        } else if (requiresAuthNext) {
        }
      } catch (err) {
        // 👉 handle hard gate from backend
        if (
          err?.response?.status === 403 &&
          (err?.response?.data?.error === "NEED_AUTH" ||
            err?.response?.data?.error === "AUTH_REQUIRED")
        ) {
          setAuthMethod(
            err.response.data.auth_method || authMethod || "whatsapp"
          );
          setNeedsAuth(true);
          setShowInlineAuth(true);
          try {
            localStorage.setItem(AUTH_GATE_KEY(sessionId, chatbotId), "1");
          } catch {}
          toast.info(err.response.data.message || "Please verify to continue.");
        } else if (err?.response?.status === 403) {
          // Check if it's a subscription error
          const errorMessage = err?.response?.data?.message || "";
          if (
            errorMessage.toLowerCase().includes("subscription") &&
            (errorMessage.toLowerCase().includes("expired") ||
              errorMessage.toLowerCase().includes("inactive"))
          ) {
            toast.error(errorMessage);
            // Don't show auth screen for subscription errors
          } else {
            // Handle other 403 errors as auth required
            setNeedsAuth(true);
            setShowInlineAuth(true);
            try {
              localStorage.setItem(AUTH_GATE_KEY(sessionId, chatbotId), "1");
            } catch {}
            toast.error("Authentication required to continue.");
          }
        } else {
          console.error("Chat error:", err);
          toast.error("Failed to get a response.");
          setChatHistory((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "Something went wrong. Please try again later.",
            },
          ]);
        }
      } finally {
        setIsTyping(false);
      }
    },
    [
      apiBase,
      chatbotId,
      phone,
      verified,
      message,
      playAudio,
      audioObject,
      sessionId,
    ]
  );

  // Controlled scroll function - only scrolls the messages container
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  // Auto-scroll when new messages are added
  useEffect(() => {
    if (chatHistory.length > 0 || isTyping) {
      const timeoutId = setTimeout(() => {
        if (messagesContainerRef.current) {
          const container = messagesContainerRef.current;
          container.scrollTop = container.scrollHeight;
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [chatHistory.length, isTyping]);

  // Handle inline auth input delay after animation completes
  useEffect(() => {
    if (
      showInlineAuth &&
      !verified &&
      !isTyping &&
      !otpSent &&
      animatedMessageIdx === chatHistory.length - 1
    ) {
      // Add a 2 second delay after animation completes
      const delayTimer = setTimeout(() => {
        setShowInlineAuthInput(true);
      }, 2000);

      return () => clearTimeout(delayTimer);
    } else {
      setShowInlineAuthInput(false);
    }
  }, [
    showInlineAuth,
    verified,
    isTyping,
    otpSent,
    animatedMessageIdx,
    chatHistory.length,
  ]);

  // Handle OTP input display after animation completes (no delay)
  useEffect(() => {
    if (
      otpSent &&
      !verified &&
      !isTyping &&
      animatedMessageIdx === chatHistory.length - 1
    ) {
      // Remove delay - show OTP input immediately
      setShowOtpInput(true);
    } else {
      setShowOtpInput(false);
    }
  }, [otpSent, verified, isTyping, animatedMessageIdx, chatHistory.length]);

  useEffect(() => {
    if (!sessionId || verified || !authMethod) return;
    try {
      const shouldGate =
        localStorage.getItem(AUTH_GATE_KEY(sessionId, chatbotId)) === "1";
      if (shouldGate) {
        setNeedsAuth(true);
        setShowInlineAuth(true);
      }
    } catch {}
  }, [sessionId, verified, chatbotId, authMethod]);

  useEffect(() => {
    const timer = setTimeout(() => {
      hasMounted.current = true;
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("resend_otp_start");
    if (saved) {
      const elapsed = Math.floor((Date.now() - parseInt(saved, 10)) / 1000);
      const remaining = 60 - elapsed;
      if (remaining > 0) {
        setResendTimeout(remaining);
        let countdown = remaining;
        const timer = setInterval(() => {
          countdown--;
          setResendTimeout(countdown);
          if (countdown <= 0) {
            clearInterval(timer);
            localStorage.removeItem("resend_otp_start");
          }
        }, 1000);
        setResendIntervalId(timer);
      }
    }
    return () => {
      if (resendIntervalId) clearInterval(resendIntervalId);
    };
  }, []);

  useEffect(() => {
    setOtpSent(false);
    setOtp("");
    setResendTimeout(0);
    localStorage.removeItem("resend_otp_start");
  }, [phone]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Add these functions before your return statement
  // Add these improved functions
  const startRecording = async () => {
    if (needsAuth && !verified) {
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      setAudioStream(stream);

      // Try different formats in order of preference
      let mimeType = "audio/webm;codecs=opus";
      let fileExtension = ".webm";

      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm";
        fileExtension = ".webm";

        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "audio/mp4";
          fileExtension = ".mp4";

          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = "audio/wav";
            fileExtension = ".wav";

            if (!MediaRecorder.isTypeSupported(mimeType)) {
              mimeType = "";
              fileExtension = ".webm";
            }
          }
        }
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});

      const audioChunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: mimeType });

        try {
          // Pass the fileExtension that's available in this scope
          const transcription = await convertSpeechToText(
            audioBlob,
            fileExtension
          );
          const text = (transcription || "").trim();

          if (text.length > 0) {
            await handleSendMessage(text);
          } else {
            toast.error("No speech detected");
          }
        } catch (err) {
          console.error("Speech-to-text error:", err);
          toast.error("Failed to convert speech to text");
        } finally {
          stream.getTracks().forEach((track) => track.stop());
          setAudioStream(null);
          setIsRecording(false);
        }
      };

      recorder.onerror = (event) => {
        console.error("Recording error:", event.error);
        toast.error("Recording failed");
        // Cleanup on error
        stream.getTracks().forEach((track) => track.stop());
        setAudioStream(null);
        setIsRecording(false);
      };

      recorder.start(1000); // Collect data every 1 second
      setMediaRecorder(recorder);
      setIsRecording(true);

      // Set maximum recording time (30 seconds)
      recordingTimeout.current = setTimeout(() => {
        stopRecording();
      }, 30000);
    } catch (error) {
      console.error("Microphone access denied:", error);
      toast.error("Microphone access is required for voice input");

      // Reset states on error
      setIsRecording(false);
      setAudioStream(null);
      setMediaRecorder(null);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }

    if (recordingTimeout.current) {
      clearTimeout(recordingTimeout.current);
      recordingTimeout.current = null;
    }

    setIsRecording(false);
    setMediaRecorder(null);
  };

  useEffect(() => {
    return () => {
      if (recordingTimeout.current) {
        clearTimeout(recordingTimeout.current);
      }
    };
  }, []);

  const convertSpeechToText = async (audioBlob, fileExtension = ".webm") => {
    const formData = new FormData();
    formData.append("audio", audioBlob, `voice${fileExtension}`);

    try {
      const res = await axios.post(`${apiBase}/speech-to-text`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
        timeout: 30000,
      });
      return res.data.text;
    } catch (err) {
      console.error("Speech-to-text failed:", err);

      // Better error handling
      if (err.code === "ECONNABORTED") {
        throw new Error("Request timeout - audio processing took too long");
      } else if (err.response?.status === 413) {
        throw new Error("Audio file too large");
      } else if (err.response?.status === 429) {
        throw new Error("Too many requests. Please wait and try again.");
      } else if (err.response?.status >= 500) {
        throw new Error("Server error - please try again");
      } else {
        throw new Error("Transcription failed");
      }
    }
  };

  useEffect(() => {
    setVerified(false);
    setNeedsAuth(false);
    setShowAuthScreen(false); // Always start with auth screen hidden
    setOtpSent(false);
    setOtp("");
    setResendTimeout(0);
    setFreeMessagesUsed(0); // Reset free message count when chatbot changes
    setFreeMessagesExhausted(false);
    setShowInlineAuth(false);
    setShowInlineAuthInput(false);
    setShowOtpInput(false);
    setFinalGreetingReady(false); // Reset final greeting ready state
    lastGeneratedGreeting.current = null; // Reset TTS generation tracking
    localStorage.removeItem("resend_otp_start");

    // Reset chat history - will be populated when final greeting is ready
    setChatHistory([]);

    // Reset auto-play flag for new chatbot
    greetingAutoPlayed.current = false;

    // Reset final greeting ready state
    setFinalGreetingReady(false);

    // Check if there's an existing auth gate for this chatbot
    if (sessionId) {
      try {
        const shouldGate =
          localStorage.getItem(AUTH_GATE_KEY(sessionId, chatbotId)) === "1";
        if (shouldGate) {
          setNeedsAuth(true);
          setShowInlineAuth(true);
        }
      } catch {}
    }
  }, [chatbotId, sessionId, apiBase]);

  // Fixed desktop click handler
  const handleMicClick = () => {
    if (!isMobile) {
      if (isRecording) {
        stopRecording(); // Stop if currently recording
      } else {
        startRecording(); // Start if not recording
      }
    }
  };

  useEffect(() => {
    return () => {
      if (mediaRecorder?.state === "recording") mediaRecorder.stop();
      audioStream?.getTracks().forEach((t) => t.stop());
      clearTimeout(recordingTimeout.current);
    };
  }, [mediaRecorder, audioStream]);

  // Mobile handlers remain the same
  const handleMicTouchStart = useCallback(
    (e) => {
      if (isMobile && !isTyping) {
        e.preventDefault();
        e.stopPropagation();
        startRecording();
      }
    },
    [isMobile, isTyping] // ✅ Dependencies added
  );

  const handleMicTouchEnd = useCallback(
    (e) => {
      if (isMobile) {
        e.preventDefault();
        e.stopPropagation();
        stopRecording();
      }
    },
    [isMobile]
  );

  const handleMicMouseDown = (e) => {
    if (isMobile) {
      e.preventDefault();
      startRecording();
    }
  };

  const handleMicMouseUp = (e) => {
    if (isMobile) {
      e.preventDefault();
      stopRecording();
    }
  };

  // ✅ FIXED VERSION - Single cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup recording
      if (mediaRecorder?.state === "recording") {
        mediaRecorder.stop();
      }

      // Cleanup audio stream
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }

      // NEW: Cleanup TTS audio to stop it from playing when the chat is closed
      if (true && audioObject) {
        audioObject.pause();
      }

      // Cleanup timeout
      if (recordingTimeout.current) {
        clearTimeout(recordingTimeout.current);
        recordingTimeout.current = null;
      }

      // Cleanup TTS generation timeout
      if (ttsGenerationTimeout.current) {
        clearTimeout(ttsGenerationTimeout.current);
        ttsGenerationTimeout.current = null;
      }
    };
  }, [true]); // Add true dependency

  const handleKeyPress = (event) => {
    // Check if the key pressed is 'Enter' and the Shift key is not held down
    if (event.key === "Enter") {
      // Prevent the default action of the Enter key (like adding a new line)
      event.preventDefault();

      // Don't send message if bot is typing
      if (!isTyping) {
        handleSendMessage();
      }
    }
  };

  return (
    <Wrapper>
      <GlobalStyle />
      {!showChat && (
        <FloatingUnit>
          <ChatButton onClick={() => setShowChat(true)}>
            <img
              src={chatbotLogo}
              alt="Chat"
              onError={(e) => {
                e.target.src =
                  "https://raw.githubusercontent.com/troika-tech/Asset/refs/heads/main/Supa%20Agent%20new.png";
              }}
            />
          </ChatButton>
          <Label>Supa Agent</Label>
        </FloatingUnit>
      )}

      {showChat && (
        <Overlay ref={overlayRef}>
          <Chatbox ref={chatboxRef}>
            <Header>
              <HeaderLeft>
                <Avatar
                  src={chatbotLogo}
                  alt="avatar"
                  onError={(e) => {
                    e.target.src =
                      "https://raw.githubusercontent.com/troika-tech/Asset/refs/heads/main/Supa%20Agent%20new.png";
                  }}
                />
                <StatusBlock>
                  <BotName>Supa Agent</BotName>
                  <Status>AI Assistant</Status>
                </StatusBlock>
              </HeaderLeft>
              <CloseBtn
                onClick={() => {
                  if (true && audioObject) {
                    audioObject.pause(); // optional: stop audio on close
                  }
                  // Reset auto-play flag when chat is closed
                  greetingAutoPlayed.current = false;
                  if (chatboxRef.current) {
                    chatboxRef.current.classList.add("closing");
                    setTimeout(() => setShowChat(false), 500);
                  } else {
                    setShowChat(false);
                  }
                }}
              >
                ×
              </CloseBtn>
            </Header>

            <ChatContainer>
              <>
                <MessagesContainer ref={messagesContainerRef}>
                  {chatHistory.map((msg, idx) => (
                    <MessageWrapper key={idx} $isUser={msg.sender === "user"}>
                      {/* {msg.sender === "bot" && (
              <BotAvatar src="https://raw.githubusercontent.com/troika-tech/Asset/refs/heads/main/Supa%20Agent%20new.png" />
             )} */}
                      <div>
                        <MessageBubble $isUser={msg.sender === "user"}>
                          {/* 👇 MODIFICATION START: Conditional rendering for typewriter effect */}
                          {msg.sender === "bot" &&
                          idx === chatHistory.length - 1 &&
                          !isTyping &&
                          animatedMessageIdx !== idx ? (
                            <TypeAnimation
                              key={idx}
                              sequence={[
                                stripMarkdown(msg.text),
                                () => setAnimatedMessageIdx(idx),
                              ]}
                              wrapper="span"
                              cursor={false}
                              speed={80}
                              style={{ display: "inline-block" }}
                              repeat={0}
                            />
                          ) : (
                            <ReactMarkdown
                              components={{
                                a: ({ node, ...props }) => (
                                  <a
                                    {...props}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      padding: "0", // ❌ Remove default padding
                                      color: "#1e90ff",
                                      textDecoration: "none",
                                      transition: "all 0.2s ease-in-out",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.textDecoration =
                                        "underline";
                                      e.target.style.color = "#0f62fe"; // 💡 Optional hover color
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.textDecoration = "none";
                                      e.target.style.color = "#1e90ff";
                                    }}
                                  />
                                ),
                                p: ({ node, ...props }) => (
                                  <p
                                    style={{ margin: "0", padding: "0" }}
                                    {...props}
                                  />
                                ),
                              }}
                            >
                              {msg.text}
                            </ReactMarkdown>
                          )}
                          {/* 👆 MODIFICATION END */}
                        </MessageBubble>

                        {/* Product Cards */}
                        {msg.sender === "bot" && msg.product_cards && (
                          <ProductCardsComponent
                            productCards={msg.product_cards}
                          />
                        )}

                        <MessageActions $isUser={msg.sender === "user"}>
                          {msg.sender === "bot" && msg.audio && (
                            <PlayButton
                              onClick={() => playAudio(msg.audio, idx)}
                              disabled={isTyping}
                            >
                              {currentlyPlaying === idx ? (
                                <FaStopCircle />
                              ) : (
                                <FaVolumeUp />
                              )}
                            </PlayButton>
                          )}
                          <Timestamp>
                            {new Date().toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Timestamp>
                        </MessageActions>
                      </div>
                    </MessageWrapper>
                  ))}

                  {isTyping && (
                    <MessageWrapper $isUser={false}>
                      {/* <BotAvatar src="https://raw.githubusercontent.com/troika-tech/Asset/53e29e1748a7b203eaf3895581cfa4aac341f016/Supa%20Agent.svg" /> */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <TypingContainer>
                          <Loader />
                          <CreativeLoadingText />
                        </TypingContainer>
                      </div>
                    </MessageWrapper>
                  )}

                  {/* Inline Auth Request */}
                  {showInlineAuthInput && (
                    <MessageWrapper $isUser={false}>
                      <div>
                        <MessageBubble $isUser={false}>
                          <div style={{ marginBottom: "12px" }}>
                            Please enter your{" "}
                            {authMethod === "email"
                              ? "email address"
                              : "WhatsApp number"}{" "}
                            to continue chatting with us
                          </div>

                          {authMethod === "email" ? (
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                alignItems: "center",
                              }}
                            >
                              <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                  setEmail(e.target.value.trim())
                                }
                                style={{
                                  flex: 1,
                                  padding: "10px 12px",
                                  border: "1px solid #ddd",
                                  borderRadius: "8px",
                                  fontSize: "14px",
                                  outline: "none",
                                }}
                              />
                              <button
                                onClick={handleSendOtp}
                                disabled={
                                  loadingOtp || !email || resendTimeout > 0
                                }
                                style={{
                                  padding: "10px 16px",
                                  background:
                                    loadingOtp || !email || resendTimeout > 0
                                      ? "#ccc"
                                      : "#bc3d19",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "8px",
                                  fontSize: "14px",
                                  fontWeight: "600",
                                  cursor:
                                    loadingOtp || !email || resendTimeout > 0
                                      ? "not-allowed"
                                      : "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                }}
                              >
                                {loadingOtp ? (
                                  <>
                                    <ClipLoader size={12} color="#fff" />
                                    Sending...
                                  </>
                                ) : resendTimeout > 0 ? (
                                  `Resend in ${resendTimeout}s`
                                ) : (
                                  <IoSend size={16} />
                                )}
                              </button>
                            </div>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                alignItems: "center",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <span
                                  style={{ fontSize: "14px", color: "#666" }}
                                >
                                  +91
                                </span>
                                <input
                                  type="tel"
                                  placeholder="Enter WhatsApp number"
                                  value={phone}
                                  onChange={(e) => {
                                    const inputPhone = e.target.value.replace(
                                      /\D/g,
                                      ""
                                    );
                                    setPhone(inputPhone);
                                    setIsPhoneValid(
                                      /^[6-9]\d{9}$/.test(inputPhone)
                                    );
                                  }}
                                  style={{
                                    width: "140px",
                                    padding: "10px 12px",
                                    border: "1px solid #ddd",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    outline: "none",
                                  }}
                                />
                              </div>
                              <button
                                onClick={handleSendOtp}
                                disabled={
                                  loadingOtp ||
                                  !isPhoneValid ||
                                  resendTimeout > 0
                                }
                                style={{
                                  padding: "10px 16px",
                                  background:
                                    loadingOtp ||
                                    !isPhoneValid ||
                                    resendTimeout > 0
                                      ? "#ccc"
                                      : "#bc3d19",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "8px",
                                  fontSize: "14px",
                                  fontWeight: "600",
                                  cursor:
                                    loadingOtp ||
                                    !isPhoneValid ||
                                    resendTimeout > 0
                                      ? "not-allowed"
                                      : "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                }}
                              >
                                {loadingOtp ? (
                                  <>
                                    <ClipLoader size={12} color="#fff" />
                                  </>
                                ) : resendTimeout > 0 ? (
                                  `Resend in ${resendTimeout}s`
                                ) : (
                                  <IoSend size={16} />
                                )}
                              </button>
                            </div>
                          )}
                        </MessageBubble>
                      </div>
                    </MessageWrapper>
                  )}

                  {/* OTP Verification */}
                  {showOtpInput && (
                    <MessageWrapper $isUser={false}>
                      <div>
                        <MessageBubble $isUser={false}>
                          <div style={{ marginBottom: "12px" }}>
                            We've sent a 6-digit code to{" "}
                            {authMethod === "email"
                              ? email
                              : phone + " on WhatsApp"}
                            . Please enter it below:
                          </div>

                          <OtpInputComponent otp={otp} setOtp={setOtp} />

                          <button
                            onClick={handleVerifyOtp}
                            disabled={loadingVerify || otp.length !== 6}
                            style={{
                              width: "100%",
                              marginTop: "12px",
                              padding: "12px",
                              background:
                                loadingVerify || otp.length !== 6
                                  ? "#ccc"
                                  : "#bc3d19",
                              color: "white",
                              border: "none",
                              borderRadius: "8px",
                              fontSize: "14px",
                              fontWeight: "600",
                              cursor:
                                loadingVerify || otp.length !== 6
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            {loadingVerify ? "Verifying..." : "Verify Code"}
                          </button>

                          <div
                            style={{
                              marginTop: "8px",
                              fontSize: "12px",
                              color: "#666",
                              textAlign: "center",
                            }}
                          >
                            {resendTimeout > 0 ? (
                              <>
                                Resend available in{" "}
                                <strong>{resendTimeout}s</strong>
                              </>
                            ) : (
                              <>
                                Didn't receive the code?{" "}
                                <span
                                  onClick={handleSendOtp}
                                  style={{
                                    color: "#bc3d19",
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                  }}
                                >
                                  Resend Code
                                </span>
                              </>
                            )}
                          </div>
                        </MessageBubble>
                      </div>
                    </MessageWrapper>
                  )}

                  <div ref={endOfMessagesRef} />
                </MessagesContainer>

                {/* Recording indicator above input */}
                {isRecording && (
                  <VoiceInputIndicator>
                    <RecordingBars isVisible={isRecording} />
                    <ListeningText>Listening...</ListeningText>
                  </VoiceInputIndicator>
                )}

                <InputContainer>
                  <InputWrapper>
                    <ChatInput
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={
                        isTyping
                          ? "Thinking..."
                          : freeMessagesExhausted && !verified
                          ? "Please authenticate to continue..."
                          : "Message..."
                      }
                      disabled={
                        isTyping || (freeMessagesExhausted && !verified)
                      }
                      style={{
                        opacity:
                          isTyping || (freeMessagesExhausted && !verified)
                            ? 0.6
                            : 1,
                        cursor:
                          isTyping || (freeMessagesExhausted && !verified)
                            ? "not-allowed"
                            : "text",
                      }}
                    />
                    <InputButtons>
                      <VoiceButton
                        $isRecording={isRecording}
                        onClick={handleMicClick}
                        onTouchStart={handleMicTouchStart}
                        onTouchEnd={handleMicTouchEnd}
                        onMouseDown={handleMicMouseDown}
                        onMouseUp={handleMicMouseUp}
                        disabled={
                          isTyping || (freeMessagesExhausted && !verified)
                        }
                      >
                        {isRecording && !isMobile ? <FiSquare /> : <FiMic />}
                      </VoiceButton>
                      <MuteButton
                        $isMuted={isMuted}
                        onClick={toggleMute}
                        disabled={
                          isTyping || (freeMessagesExhausted && !verified)
                        }
                      >
                        {isMuted ? <FiVolumeX /> : <FiVolume2 />}
                      </MuteButton>
                      <SendButton
                        onClick={() => !isTyping && handleSendMessage()}
                        disabled={
                          isTyping || (freeMessagesExhausted && !verified)
                        }
                      >
                        <IoSend />
                      </SendButton>
                    </InputButtons>
                  </InputWrapper>

                  {/* Instructions (hide when gated) */}

                  <p
                    style={{
                      textAlign: "center",
                      color: "#888",
                      fontSize: "0.75rem",
                      margin: "0.5rem 0 0 0",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        flexWrap: "wrap",
                        lineHeight: "1.2",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <strong>Powered by</strong>
                      </span>
                      <a
                        href="https://troikatech.in/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "inherit",
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        <img
                          src="https://raw.githubusercontent.com/troikatechindia/Asset/refs/heads/main/logo.png"
                          alt="Troika Tech Logo"
                          style={{ height: "14px", verticalAlign: "middle" }}
                        />
                        <strong>Troika</strong>
                      </a>
                      <span
                        style={{
                          color: "#888",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <strong>&</strong>
                      </span>
                      <a
                        href="https://openai.com/chatgpt"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "inherit",
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        <img
                          src="https://img.icons8.com/?size=100&id=FBO05Dys9QCg&format=png&color=000000"
                          alt="ChatGPT Logo"
                          style={{ height: "14px", verticalAlign: "middle" }}
                        />
                        <strong>ChatGPT</strong>
                      </a>
                    </span>
                  </p>
                </InputContainer>
              </>
            </ChatContainer>
          </Chatbox>

          <ToastContainer position="top-center" />
        </Overlay>
      )}
    </Wrapper>
  );
};

export default SupaChatbot;
