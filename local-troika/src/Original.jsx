import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import ClipLoader from "react-spinners/ClipLoader";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiMail, FiArrowRight } from "react-icons/fi";
import { MdArrowBack } from "react-icons/md";
import {
  FaShieldAlt,
  FaHandSparkles,
  FaBuilding,
  FaPhoneAlt,
  FaVolumeUp, // <-- Add this
  FaStopCircle,
  FaVolumeMute,
} from "react-icons/fa";
import { TypeAnimation } from "react-type-animation";
import { IoSend } from "react-icons/io5";
import { FiMic, FiSquare } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import * as FaIcons from "react-icons/fa";

const GlobalStyle = createGlobalStyle`
  * {
    font-family: ${props => props.fontFamily || '"Amaranth", "Poppins", sans-serif'};
  }

  .dot-flashing {
    position: relative;
    width: 8px;
    height: 8px;
    background-color: #888;
    border-radius: 50%;
    animation: dotFlashing 1s infinite linear alternate;
    animation-delay: 0s;
  }

  .dot-flashing::before,
  .dot-flashing::after {
    content: "";
    display: inline-block;
    position: absolute;
    top: 0;
    width: 8px;
    height: 8px;
    background-color: #888;
    border-radius: 50%;
  }

  .dot-flashing::before {
    left: -12px;
    animation: dotFlashing 1s infinite linear alternate;
    animation-delay: 0.2s;
  }

  .dot-flashing::after {
    left: 12px;
    animation: dotFlashing 1s infinite linear alternate;
    animation-delay: 0.4s;
  }

  @keyframes dotFlashing {
    0% {
      background-color: #ccc;
    }
    50%,
    100% {
      background-color: #888;
    }
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

  font-family: ${props => props.fontFamily || '"Amaranth", "Poppins", sans-serif'};
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
  padding: 1rem; /* Added for spacing on smaller screens */
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
  background: #ffffff;
  border-radius: 15px;
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
  border-bottom: 1px solid #eee;
  background: linear-gradient(
    90deg,
    hsla(344, 97%, 63%, 1),
    hsla(232, 90%, 59%, 1)
  );
  flex-shrink: 0;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

const Avatar = styled.img`
  width: auto !important;
  height: 50px !important; /* Adjusted size */
`;

const StatusBlock = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 0.5rem;
`;

const BotName = styled.div`
  font-weight: 600;
  color: white;
  font-size: 1.5rem;
  padding-left: 6px;

  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const Status = styled.div`
  font-size: 0.75rem;
  color: #e0e0e0ff;
  position: relative;
  padding-left: 6px;
`;

const CloseBtn = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  cursor: pointer;
  color: white;
  transition: transform 0.3s ease-in-out, color 0.2s ease;

  &:hover {
    transform: rotate(90deg);
    color: #f1f1f1;
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
  background: linear-gradient(
    90deg,
    hsla(344, 97%, 63%, 1) 0%,
    hsla(232, 90%, 59%, 1) 100%
  );
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
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const InputContainer = styled.div`
  flex-shrink: 0;
  padding: 1.25rem;
  border-top: 1px solid #eee;
  background: white;
  position: relative;
`;

const ChatInput = styled.input`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 0.875rem;
  width: 100%;
  outline: none;
  transition: border-color 0.3s;
  &:focus {
    border-color: #a97fff;
  }
`;

const MessageWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  margin: 0.625rem 0;
  justify-content: ${(props) => (props.$isUser ? "flex-end" : "flex-start")};

  & > div {
    display: flex;
    flex-direction: column;
    align-items: ${(props) => (props.$isUser ? "flex-end" : "flex-start")};
    max-width: 80%; /* Prevent messages from being too wide */
  }
`;

const MessageBubble = styled.div`
  background: ${(props) => (props.$isUser ? "#ede7f6" : "#f2f2f2")};
  border-radius: 20px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  line-height: 1.4;
  word-wrap: break-word;
  box-shadow: none;
`;

const Timestamp = styled.span`
  font-size: 0.625rem;
  color: #888;
  margin-top: 0.375rem;
`;

// ... (keep the rest of the styled components like BotAvatar, keyframes, TickWrapper, OtpContainer, etc. as they are mostly fine)
const drawCircle = keyframes`
 from {
  stroke-dashoffset: 157;
 }
 to {
  stroke-dashoffset: 0;
 }
`;

const drawCheck = keyframes`
 from {
  stroke-dashoffset: 36;
 }
 to {
  stroke-dashoffset: 0;
 }
`;

const fadeIn = keyframes`
 from {
  opacity: 0;
 }
 to {
  opacity: 1;
 }
`;

const fadeOut = keyframes`
 from {
  opacity: 1;
 }
 to {
  opacity: 0;
 }
`;

const TickWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding-top: 40px;
  animation: ${fadeOut} 0.6s ease-in 3.5s forwards;
`;

const Svg = styled.svg`
  width: 80px;
  height: 80px;
`;

const AnimatedCircle = styled.circle`
  stroke: #4caf50;
  stroke-width: 4;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 158;
  stroke-dashoffset: 158;
  animation: ${drawCircle} 1s ease-out forwards;
`;

const AnimatedPath = styled.path`
  stroke: #4caf50;
  stroke-width: 5;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 36;
  stroke-dashoffset: 36;
  animation: ${drawCheck} 0.5s ease-in-out 1s forwards;
`;

const WelcomeMsg = styled.div`
  text-align: center;
  font-size: 22px;
  font-weight: 600;
  margin-top: 16px;
  padding: 0 1rem;
  color: #333;
  opacity: 0;
  animation: ${fadeIn} 0.6s ease-out 1.5s forwards;
`;

const TypingBubble = styled(MessageBubble)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px 16px;
`;

const glow = keyframes`
 0% { box-shadow: 0 0 0px #cc33ff; }
 50% { box-shadow: 0 0 12px #cc33ff; }
 100% { box-shadow: 0 0 0px #cc33ff; }
`;

// otp conatainer

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
  gap: 0.5rem; /* Adjusted gap */
  margin: 0 0 1.5rem 0;
  padding: 0;
`;

const OtpInputBox = styled.input`
  width: 40px !important; /* Made boxes smaller */
  height: 48px !important;
  font-size: 1.125rem;
  font-weight: 600;
  text-align: center;
  border-radius: 12px;
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
  background: linear-gradient(135deg, #a855f7, #ec4899);
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
    box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
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
  background: linear-gradient(135deg, #a855f7, #ec4899);
  border: none;
  border-radius: 50%;
  width: 44px; /* Adjusted size */
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
  flex-shrink: 0;

  svg {
    color: inherit;
    flex-shrink: 0;
  }

  &:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
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
  background: hsla(205, 46%, 30%, 1);
  background: linear-gradient(
    90deg,
    hsla(205, 46%, 30%, 1) 0%,
    hsla(260, 29%, 36%, 1) 100%
  );
  background: -moz-linear-gradient(
    90deg,
    hsla(205, 46%, 30%, 1) 0%,
    hsla(260, 29%, 36%, 1) 100%
  );
  background: -webkit-linear-gradient(
    90deg,
    hsla(205, 46%, 30%, 1) 0%,
    hsla(260, 29%, 36%, 1) 100%
  );
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#295270", endColorstr="#524175", GradientType=1);
  color: #fff;
  padding: 4px 25px; /* Adjusted padding */
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.8rem; /* Adjusted font size */
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
  background: ${(props) =>
    props.$isRecording
      ? "linear-gradient(135deg, #ef4444, #dc2626)"
      : "linear-gradient(135deg, #a855f7, #ec4899)"};
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
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
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
  `}

  @keyframes pulse {
    0% {
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
    }
    50% {
      box-shadow: 0 0 25px rgba(239, 68, 68, 0.8);
    }
    100% {
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
    }
  }

  svg {
    color: inherit;
    flex-shrink: 0;
  }

  &:hover:not(:disabled) {
    transform: ${(props) => (props.$isRecording ? "scale(1.2)" : "scale(1.1)")};
    box-shadow: ${(props) =>
      props.$isRecording
        ? "0 0 20px rgba(239, 68, 68, 0.6)"
        : "0 4px 12px rgba(168, 85, 247, 0.3)"};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
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

const EnquiryBox = styled.div`
  position: relative;
  padding: 1rem;
  margin: 1rem;
  background: #f0f9ff;
  border-radius: 12px;
  border: 1px solid #c7d2fe;
  animation: fadeIn 0.3s ease-in;
  max-width: calc(100% - 2rem);
  box-sizing: border-box;
  
  @media (max-width: 480px) {
    margin: 0.5rem;
    padding: 0.75rem;
    max-width: calc(100% - 1rem);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 12px;
  background: transparent;
  border: none;
  font-size: 20px;
  font-weight: bold;
  color: #555;
  cursor: pointer;
`;

const EnquiryHeading = styled.h4`
  margin-bottom: 0.75rem;
  color: #1e40af;
`;

const EnquiryInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  max-width: 100%;
  
  @media (max-width: 480px) {
    padding: 8px;
    font-size: 14px;
  }
`;

const EnquiryTextarea = styled.textarea`
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  max-width: 100%;
  resize: vertical;
`;

const EmailInput = styled(EnquiryInput)`
  background-color: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
`;

const SubmitButton = styled.button`
  margin-top: 12px;
  padding: 10px 16px;
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
`;

const MessageActions = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.375rem;
  gap: 0.5rem;
  justify-content: ${(props) => (props.$isUser ? "flex-end" : "flex-start")};
`;

const PlayButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #888;
  display: flex;
  align-items: center;
  padding: 2px;
  transition: color 0.2s ease;

  &:hover {
    color: #a855f7;
  }

  &:disabled {
    color: #a855f7;
    cursor: default;
  }
`;

// --- Your React components (OtpInputComponent, SupaChatbot) remain here ---
// ... No changes needed for the component logic, only for the styled-components ...
const OtpInputComponent = ({ otp, setOtp }) => {
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  const handleChange = (index, value) => {
    // Only allow single digits
    if (value.length > 1) {
      value = value.slice(-1);
    }

    // Only allow numbers
    if (value && !/^[0-9]$/.test(value)) {
      return;
    }

    const newOtp = otp.split("");
    newOtp[index] = value;
    setOtp(newOtp.join(""));

    // Auto-focus next input
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

const VoiceOverlay = ({ isVisible }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9998, // Lower than buttons
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(8px)",
        opacity: isVisible ? 1 : 0,
        pointerEvents: "none", // Allow clicks to pass through
        transition: "opacity 0.3s ease",
        borderRadius: "15px", // Match chat window border radius
      }}
    >
      <div
        style={{
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div className="cosmic-circle">
          <div className="pulse-ring pulse-ring-1"></div>
          <div className="pulse-ring pulse-ring-2"></div>
          <div className="pulse-ring pulse-ring-3"></div>
          <div className="cosmic-core"></div>
        </div>
        <div style={{ marginTop: "2rem", color: "white" }}>
          <p style={{ fontSize: "1.125rem", fontWeight: "500", margin: 0 }}>
            Recording...
          </p>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#93c5fd",
              marginTop: "0.5rem",
              margin: 0,
            }}
          >
            Use the stop button below to finish
          </p>
        </div>
      </div>
    </div>
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
  const [chatHistory, setChatHistory] = useState([
    {
      sender: "bot",
      text: "👋 Hello! I'm Supa Agent. How can I assist you today?",
    },
  ]);
  const [welcomeComplete, setWelcomeComplete] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [animatedMessageIdx, setAnimatedMessageIdx] = useState(null);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [resendTimeout, setResendTimeout] = useState(0);
  const [resendIntervalId, setResendIntervalId] = useState(null);
  // const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [enquiryData, setEnquiryData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [suggestions, setSuggestions] = useState([]);
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

  // Add new state for customization
  const [customization, setCustomization] = useState({
    fontFamily: "Inter",
    headerBackground: "linear-gradient(90deg, hsla(344, 97%, 63%, 1), hsla(232, 90%, 59%, 1))",
    headerSubtitle: "AI Assistant",
    buttonColor: "linear-gradient(135deg, #a855f7, #ec4899)",
    welcomeMessage: "👋 Hello! I'm Supa Agent. How can I assist you today?",
    startingSuggestions: [
      {
        title: "Hi! I need some assistance",
        icon: "FaHandSparkles",
        iconBg: "#F59E0B",
        bgType: "solid"
      },
      {
        title: "Tell me more about the company",
        icon: "FaBuilding", 
        iconBg: "#6366F1",
        bgType: "solid"
      },
      {
        title: "Give me contact details",
        icon: "FaPhoneAlt",
        iconBg: "#10B981",
        bgType: "solid"
      }
    ],
    chatWindowBg: "#ffffff",
    chatWindowBgType: "solid",
    includeAudio: true,
    includeSuggestionButton: true
  });

  // Add state for customization loading
  const [customizationLoading, setCustomizationLoading] = useState(true);
  const [customizationError, setCustomizationError] = useState(null);

  const recordingTimeout = useRef();
  const overlayRef = useRef(null);
  const chatboxRef = useRef(null);
  const endOfMessagesRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const hasMounted = useRef(false);
  const renderCountRef = useRef(0);

  const AUTH_GATE_KEY = (sid, bot) => `supa_auth_gate:${bot}:${sid}`;
  const SESSION_STORE_KEY = (method) =>
    method === "email" ? "chatbot_user_email" : "chatbot_user_phone";

  // Function to fetch customization data
  const fetchCustomization = useCallback(async () => {
    try {
      setCustomizationLoading(true);
      setCustomizationError(null);
      
      const response = await axios.get(`${apiBase}/customizations/${chatbotId}`);
      
      if (response.data.success) {
        const data = response.data.data;
        
        // Transform the data to match our component structure
        const transformed = {
          fontFamily: data.fontFamily || "Inter",
          headerBackground: data.headerBackground || "linear-gradient(90deg, hsla(344, 97%, 63%, 1), hsla(232, 90%, 59%, 1))",
          headerSubtitle: data.headerSubtitle || "AI Assistant",
          buttonColor: data.buttonColor || "linear-gradient(135deg, #a855f7, #ec4899)",
          welcomeMessage: data.welcomeMessage || "👋 Hello! I'm Supa Agent. How can I assist you today?",
          startingSuggestions: data.startingSuggestions || [],
          chatWindowBg: data.chatWindowBg || "#ffffff",
          chatWindowBgType: data.chatWindowBgType || "solid",
          includeAudio: data.includeAudio !== false, // Default to true
          includeSuggestionButton: data.includeSuggestionButton !== false // Default to true
        };

        // Update chat history with new welcome message if it's the first message
        if (chatHistory.length === 1 && chatHistory[0].sender === "bot") {
          setChatHistory([{
            sender: "bot",
            text: transformed.welcomeMessage
          }]);
        }

        console.log(`🎨 Customization loaded:`, transformed);
        console.log(`🔤 Font family: ${transformed.fontFamily}`);
        setCustomization(transformed);
      }
    } catch (error) {
      console.error("Failed to fetch customization:", error);
      setCustomizationError("Failed to load chatbot styling");
      // Keep default customization on error
    } finally {
      setCustomizationLoading(false);
    }
  }, [apiBase, chatbotId, chatHistory.length]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get(
          `${apiBase}/chatbot/${chatbotId}/config`
        );
        if (cancelled) return;
        const cfg = data?.config || {};
        const newAuthMethod = cfg.auth_method || "whatsapp";
        console.log("🔧 Config loaded:", { newAuthMethod, cfg });
        setAuthMethod(newAuthMethod);
        setRequireAuthText(
          cfg.require_auth_text || "Verify yourself to continue chat"
        );
        
        // Check if auth is required from the start
        if (cfg.require_auth_from_start) {
          console.log("🔒 Auth required from start, setting initial state");
          setNeedsAuth(true);
          setShowAuthScreen(true);
        }
        
        // Also check if there's a specific config that requires immediate auth
        if (cfg.immediate_auth_required || cfg.require_auth) {
          console.log("🔒 Immediate auth required by config");
          setNeedsAuth(true);
          setShowAuthScreen(true);
        }
        
        // Check for existing session immediately after setting auth method
        const storeKey = SESSION_STORE_KEY(newAuthMethod);
        const saved = localStorage.getItem(storeKey);
        console.log("🔍 Checking session for:", { newAuthMethod, storeKey, saved });
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
              console.log("✅ Session valid, setting verified state");
              if (newAuthMethod === "email") setEmail(saved);
              else setPhone(saved);
              setVerified(true);
              setNeedsAuth(false);
              setShowAuthScreen(false);
              setWelcomeComplete(true);
              setChatHistory([
                {
                  sender: "bot",
                  text: "👋 Hello! I'm Supa Agent. How can I assist you today?",
                },
              ]);
            } else {
              console.log("❌ Session invalid, showing auth screen");
              localStorage.removeItem(storeKey);
              toast.info("Your session has expired. Please sign in again.");
              // Force auth screen to show when session is invalid
              setVerified(false);
              setNeedsAuth(true);
              setShowAuthScreen(true);
            }
          } catch (err) {
            console.log("❌ Session validation error:", err);
            localStorage.removeItem(storeKey);
            toast.error("Unable to restore your session. Please sign in again.");
            // Force auth screen to show when session validation fails
            setVerified(false);
            setNeedsAuth(true);
            setShowAuthScreen(true);
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

  // Fetch customization on mount and when chatbotId changes
  useEffect(() => {
    if (chatbotId && apiBase) {
      fetchCustomization();
    }
  }, [chatbotId, apiBase, fetchCustomization]);

  // Load Google Font when customization changes
  useEffect(() => {
    if (customization.fontFamily && customization.fontFamily !== "Inter") {
      console.log(`🔤 Loading custom font: ${customization.fontFamily}`);
      loadGoogleFont(customization.fontFamily);
    }
  }, [customization.fontFamily]);



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

        // 🔓 clear persisted gate so input re-enables
        try {
          const sid = sessionId || localStorage.getItem("sessionId");
          if (sid) localStorage.removeItem(AUTH_GATE_KEY(sid, chatbotId));
        } catch {}

        setWelcomeComplete(false);
        setTimeout(() => setWelcomeComplete(true), 4000);
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch {
      toast.error("An error occurred during verification.");
    } finally {
      setLoadingVerify(false);
    }
  };

  const enquiryTriggers = [
    "enquiry",
    "enquiry form",
    "need help",
    "i want to enquire",
    "contact you",
    "get in touch",
    "contact us",
    "help me",
    "support",
    "assistance",
    "talk to someone",
    "speak to someone",
    "human",
    "representative",
    "agent",
  ];

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
      // Don't play audio if it's disabled in customization
      if (!customization.includeAudio) return;
      
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
    [audioObject, currentlyPlaying, isMuted, customization.includeAudio] // ✅ add customization.includeAudio here
  );

  useEffect(() => {
    if (audioObject) {
      audioObject.muted = isMuted;
    }
  }, [isMuted, audioObject]);

  useEffect(() => {
    let id = localStorage.getItem("sessionId");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("sessionId", id);
    }
    setSessionId(id);
  }, []);

  const handleSendMessage = useCallback(
    async (inputText) => {
      console.log("📤 Sending message:", { needsAuth, verified, showAuthScreen });
      if (needsAuth && !verified) {
        console.log("🚫 Auth required, showing auth screen");
        setShowAuthScreen(true);
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

      try {
        const response = await axios.post(`${apiBase}/chat/query`, {
          chatbotId,
          query: textToSend,
          sessionId,
          ...(verified ? (authMethod === "email" ? { email } : { phone }) : {}),
        });

        const { answer, audio, requiresAuthNext, auth_method } = response.data;

        const botMessage = {
          sender: "bot",
          text: answer || "Sorry, I couldn't get that.",
          audio,
        };
        let botMessageIndex;
        setChatHistory((prev) => {
          const nh = [...prev, botMessage];
          botMessageIndex = nh.length - 1;
          return nh;
        });

        // Check if user message contains enquiry triggers
        const userMessageLower = textToSend.toLowerCase();
        const hasEnquiryTrigger = enquiryTriggers.some(trigger => 
          userMessageLower.includes(trigger.toLowerCase())
        );
        
        // Also check if bot response contains enquiry-related keywords
        const botResponseLower = (answer || "").toLowerCase();
        const botHasEnquiryKeywords = [
          "get in touch",
          "reach out",
          "support team",
          "customer service",
          "help desk",
          "assistance",
          "enquiry",
          "contact form"
        ].some(keyword => botResponseLower.includes(keyword));
        
        if ((hasEnquiryTrigger || botHasEnquiryKeywords) && !showEnquiryForm) {
          setShowEnquiryForm(true);
          // Scroll to bottom after a short delay to show the form
          setTimeout(() => {
            scrollToBottom();
          }, 500);
        }

        // auto play TTS if present and audio is enabled
        if (audio && customization.includeAudio) playAudio(audio, botMessageIndex);

        // 👉 key bit: after first answer, require auth for next turn
        if (requiresAuthNext) {
          setAuthMethod(auth_method || authMethod || "whatsapp");
          setNeedsAuth(true);
          try {
            localStorage.setItem(AUTH_GATE_KEY(sessionId, chatbotId), "1");
          } catch {}
        }
      } catch (err) {
        console.log("❌ Chat error details:", {
          status: err?.response?.status,
          error: err?.response?.data?.error,
          message: err?.response?.data?.message,
          data: err?.response?.data
        });
        
        // 👉 handle hard gate from backend
        if (
          err?.response?.status === 403 &&
          (err?.response?.data?.error === "NEED_AUTH" || err?.response?.data?.error === "AUTH_REQUIRED")
        ) {
          console.log("🚫 Backend requires auth:", err.response.data);
          setAuthMethod(
            err.response.data.auth_method || authMethod || "whatsapp"
          );
          setNeedsAuth(true);
          setShowAuthScreen(true);
          try {
            localStorage.setItem(AUTH_GATE_KEY(sessionId, chatbotId), "1");
          } catch {}
          toast.info(err.response.data.message || "Please verify to continue.");
        } else if (err?.response?.status === 403) {
          // Check if it's a subscription error
          const errorMessage = err?.response?.data?.message || "";
          if (errorMessage.toLowerCase().includes("subscription") && 
              (errorMessage.toLowerCase().includes("expired") || errorMessage.toLowerCase().includes("inactive"))) {
            console.log("🚫 Subscription error:", err.response.data);
            toast.error(errorMessage);
            // Don't show auth screen for subscription errors
          } else {
            // Handle other 403 errors as auth required
            console.log("🚫 Generic 403 error, treating as auth required");
            setNeedsAuth(true);
            setShowAuthScreen(true);
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
    if (welcomeComplete && (chatHistory.length > 0 || isTyping)) {
      const timeoutId = setTimeout(() => {
        if (messagesContainerRef.current) {
          const container = messagesContainerRef.current;
          container.scrollTop = container.scrollHeight;
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [chatHistory.length, isTyping, welcomeComplete]);

  useEffect(() => {
    if (!sessionId || verified || !authMethod) return;
    try {
      const shouldGate =
        localStorage.getItem(AUTH_GATE_KEY(sessionId, chatbotId)) === "1";
      console.log("🔒 Auth gate check:", { sessionId, verified, authMethod, shouldGate });
      if (shouldGate) {
        console.log("🚫 Auth gate found, setting auth states");
        setNeedsAuth(true);
        setShowAuthScreen(true);
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
    // Transform customization suggestions to match the expected format
    if (customization.startingSuggestions && customization.includeSuggestionButton) {
      const formatted = customization.startingSuggestions.map((item) => {
        const IconComponent = FaIcons[item.icon] || null;
        return {
          label: item.title,
          icon: IconComponent ? (
            <IconComponent size={16} color="#fff" />
          ) : null,
          bg: item.iconBg,
          bgType: item.bgType || "solid"
        };
      });
      setSuggestions(formatted);
    } else {
      setSuggestions([]);
    }
  }, [customization.startingSuggestions, customization.includeSuggestionButton]);

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
      setShowAuthScreen(true);
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

      console.log("Using MIME type:", mimeType, "Extension:", fileExtension);

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

      console.log("🎤 Recording started");

      // Set maximum recording time (30 seconds)
      recordingTimeout.current = setTimeout(() => {
        console.log("⏰ Recording timeout reached");
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
    setShowAuthScreen(false);
    setOtpSent(false);
    setOtp("");
    setResendTimeout(0);
    localStorage.removeItem("resend_otp_start");
    
    // Check if there's an existing auth gate for this chatbot
    if (sessionId) {
      try {
        const shouldGate = localStorage.getItem(AUTH_GATE_KEY(sessionId, chatbotId)) === "1";
        console.log("🔒 Checking auth gate:", { sessionId, chatbotId, shouldGate });
        if (shouldGate) {
          console.log("🚫 Auth gate found, showing auth screen");
          setNeedsAuth(true);
          setShowAuthScreen(true);
        }
      } catch {}
    }
  }, [chatbotId, sessionId]);

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
      if (customization.includeAudio && audioObject) {
        audioObject.pause();
      }

      // Cleanup timeout
      if (recordingTimeout.current) {
        clearTimeout(recordingTimeout.current);
        recordingTimeout.current = null;
      }
    };
  }, [customization.includeAudio]); // Add customization.includeAudio dependency

  const showEnquiryFormHandler = () => {
    setShowEnquiryForm(true);
    setTimeout(() => {
      scrollToBottom();
    }, 150);
  };

  const handleSubmitEnquiry = async () => {
    const { name, email, phone, message } = enquiryData;

    // Validate required fields based on auth method
    const requiredFields = {
      name: true,
      message: true,
      phone: authMethod === "whatsapp" ? false : true, // Phone required if not WhatsApp auth
      email: authMethod === "email" ? false : true,    // Email required if not email auth
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([field, required]) => required && !enquiryData[field])
      .map(([field]) => field);

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(field => 
        field === 'name' ? 'Name' : 
        field === 'phone' ? 'Phone Number' : 
        field === 'email' ? 'Email' : 'Message'
      ).join(', ');
      
      toast.error(`Please fill in: ${fieldNames}`);
      return;
    }

          try {
        // Prepare data based on auth method
        const submitData = {
          chatbotId,
          name,
          message,
        };

        // Add phone/email based on what's available
        if (enquiryData.phone) submitData.phone = enquiryData.phone;
        if (enquiryData.email) submitData.email = enquiryData.email;

        await axios.post(`${apiBase}/enquiry/submit`, submitData);

      toast.success("Enquiry submitted successfully!");

      // ✅ Reset all fields (auth method specific fields stay synced via useEffect)
      setEnquiryData((prev) => ({
        ...prev,
        name: "",
        message: "",
        // Don't reset phone/email as they're synced from auth
      }));

      setShowEnquiryForm(false);

      setChatHistory((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "✅ Your enquiry has been submitted successfully! We’ll get back to you soon.",
        },
      ]);
    } catch (err) {
      console.error("Enquiry error:", err);
      toast.error("Failed to submit enquiry");
    }
  };

  useEffect(() => {
    // Sync phone number if using WhatsApp auth
    if (authMethod === "whatsapp" && phone) {
      setEnquiryData((prev) => ({ ...prev, phone }));
    }
    // Sync email if using email auth
    if (authMethod === "email" && email) {
      setEnquiryData((prev) => ({ ...prev, email }));
    }
  }, [phone, email, authMethod]);

  const handleKeyPress = (event) => {
    // Check if the key pressed is 'Enter' and the Shift key is not held down
    if (event.key === "Enter") {
      // Prevent the default action of the Enter key (like adding a new line)
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Function to dynamically load Google Fonts
  const loadGoogleFont = (fontName) => {
    if (!fontName) return;
    
    try {
      // Check if font is already loaded
      if (document.querySelector(`link[href*="${fontName.replace(/\s+/g, '+')}"]`)) {
        console.log(`✅ Font already loaded: ${fontName}`);
        return;
      }

      // Create link element for Google Fonts
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
      
      // Add error handling
      link.onerror = () => {
        console.warn(`⚠️ Failed to load font: ${fontName}`);
      };
      
      link.onload = () => {
        console.log(`✅ Successfully loaded custom font: ${fontName}`);
      };
      
      // Add to head
      document.head.appendChild(link);
      
    } catch (error) {
      console.error(`❌ Error loading custom font: ${fontName}`, error);
    }
  };

  // Function to check if message contains enquiry triggers
  const checkEnquiryTriggers = (text) => {
    if (!text || !text.trim()) return false;
    const textLower = text.toLowerCase();
    return enquiryTriggers.some(trigger => 
      textLower.includes(trigger.toLowerCase())
    );
  };



  return (
    <Wrapper fontFamily={customization.fontFamily}>
      <GlobalStyle fontFamily={customization.fontFamily} />
      {!showChat && (
        <FloatingUnit>
          <ChatButton onClick={() => setShowChat(true)}>
            <img
              src="https://raw.githubusercontent.com/troika-tech/Asset/refs/heads/main/Supa%20Agent%20new.png"
              alt="Chat"
            />
          </ChatButton>
          <Label>Supa Agent</Label>
        </FloatingUnit>
      )}

      {/* Customization Error Toast */}
      {customizationError && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#ef4444',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          zIndex: 10000,
          fontSize: '14px'
        }}>
          {customizationError}
        </div>
      )}

             {showChat && (
         <Overlay ref={overlayRef}>
           <Chatbox ref={chatboxRef}>
             <VoiceOverlay isVisible={isRecording} />
            <Header style={{ background: customization.headerBackground }}>
              <HeaderLeft>
                <Avatar
                  // src="https://raw.githubusercontent.com/troika-tech/Asset/refs/heads/main/Troika%203d%20logo.png"
                  src="https://raw.githubusercontent.com/troika-tech/Asset/refs/heads/main/Supa%20Agent%20new.png"
                  // src="https://raw.githubusercontent.com/troika-tech/Asset/refs/heads/main/Supa%20Agent%20Troika%20with%20bg.png"
                  alt="avatar"
                />
                <StatusBlock>
                  <BotName>Supa Agent</BotName>
                  <Status>{customization.headerSubtitle}</Status>
                </StatusBlock>
              </HeaderLeft>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                {customization.includeAudio && (
                  <button
                    onClick={toggleMute}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "white",
                      fontSize: "1.5rem",
                      display: "grid",
                      placeItems: "center",
                      lineHeight: 0,
                      outline: "none",
                    }}
                    title={isMuted ? "Unmute" : "Mute"}
                    aria-label={isMuted ? "Unmute voice" : "Mute voice"}
                  >
                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                  </button>
                )}

                <CloseBtn
                  onClick={() => {
                    if (customization.includeAudio && audioObject) {
                      audioObject.pause(); // optional: stop audio on close
                    }
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
              </div>
            </Header>

            {showAuthScreen && needsAuth && !verified ? (
              <AuthContainer>
                {!otpSent ? (
                  <>
                    {/* --- WELCOME / EMAIL SCREEN --- */}
                    <IconCircle>
                      {authMethod === "email" ? (
                        <FiMail color="#fff" size={36} />
                      ) : (
                        <FaPhoneAlt color="#fff" size={28} />
                      )}
                    </IconCircle>
                    <Title>Welcome!</Title>
                    <SubTitle>
                      Your smart AI partner for seamless support, efficient
                      workflows, and innovative solutions.
                    </SubTitle>

                    {authMethod === "email" ? (
                      <Input
                        type="email"
                        placeholder="Enter Your Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value.trim())}
                      />
                    ) : (
                      <Input
                        type="tel"
                        placeholder="Enter Your WhatsApp Number"
                        value={phone}
                        onChange={(e) => {
                          const inputPhone = e.target.value.replace(/\D/g, "");
                          setPhone(inputPhone);
                          setIsPhoneValid(/^[6-9]\d{9}$/.test(inputPhone));
                        }}
                      />
                    )}

                    <Button
                      onClick={handleSendOtp}
                      disabled={
                        loadingOtp ||
                        resendTimeout > 0 ||
                        (authMethod === "email" ? !email : !isPhoneValid)
                      }
                    >
                      {loadingOtp ? (
                        <>
                          {" "}
                          <ClipLoader size={16} color="#fff" /> Sending...{" "}
                        </>
                      ) : resendTimeout > 0 ? (
                        `Resend in ${resendTimeout}s`
                      ) : (
                        <>
                          Continue with{" "}
                          {authMethod === "email" ? "Email" : "WhatsApp"}{" "}
                          <FiArrowRight className="infinite-arrow" />
                        </>
                      )}
                    </Button>

                    <SubTitle style={{ fontSize: "12px", marginTop: "12px" }}>
                      We'll send you a verification code to get started securely
                    </SubTitle>
                  </>
                ) : (
                  <>
                    {/* --- OTP VERIFICATION SCREEN --- */}
                    <OtpContainer>
                      <Back onClick={() => setShowAuthScreen(false)}>
                        <MdArrowBack />
                      </Back>

                      <Shield>
                        <FaShieldAlt color="white" size={24} />
                      </Shield>

                      <OtpTitle>Verify Your Number</OtpTitle>
                      <SubText>
                        We've sent a 6-digit code on WhatsApp to
                      </SubText>
                      <EmailText>
                        {authMethod === "email" ? email : phone}
                      </EmailText>

                      <OtpInputComponent otp={otp} setOtp={setOtp} />

                      <VerifyButton
                        onClick={handleVerifyOtp}
                        disabled={loadingVerify || otp.length !== 6}
                      >
                        {loadingVerify ? "Verifying..." : "✔ Verify Code"}
                      </VerifyButton>

                      <ResendLink>
                        {resendTimeout > 0 ? (
                          <>
                            Resend available in{" "}
                            <strong>{resendTimeout}s</strong>
                          </>
                        ) : (
                          <>
                            Didn't receive the code?{" "}
                            <span onClick={handleSendOtp}>Resend Code</span>
                          </>
                        )}
                      </ResendLink>
                    </OtpContainer>
                  </>
                )}
              </AuthContainer>
            ) : (
              <ChatContainer 
                style={{
                  background: customization.chatWindowBgType === "image" 
                    ? `url(${customization.chatWindowBg})` 
                    : customization.chatWindowBg,
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}
              >
                {!welcomeComplete ? (
                  <TickWrapper>
                    <Svg viewBox="0 0 54 54">
                      <AnimatedCircle cx="27" cy="27" r="25" />
                      <AnimatedPath d="M16 27l9 9 16-16" />
                    </Svg>
                    <WelcomeMsg>
                      Verified successfully! You're now connected with Supa
                      Agent.
                    </WelcomeMsg>
                  </TickWrapper>
                ) : (
                  <>
                    <MessagesContainer ref={messagesContainerRef}>
                      {chatHistory.map((msg, idx) => (
                        <MessageWrapper
                          key={idx}
                          $isUser={msg.sender === "user"}
                        >
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
                                          e.target.style.textDecoration =
                                            "none";
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
                            <MessageActions $isUser={msg.sender === "user"}>
                              {customization.includeAudio && msg.sender === "bot" && msg.audio && (
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
                          <TypingBubble>
                            <span className="dot-flashing"></span>
                          </TypingBubble>
                        </MessageWrapper>
                      )}
                      <div ref={endOfMessagesRef} />
                    </MessagesContainer>

                    {!userHasInteracted && !isTyping && customization.includeSuggestionButton && suggestions.length > 0 && (
                      <div
                        style={{ padding: "0 20px 20px", marginTop: "16px" }}
                      >
                        <p
                          style={{
                            fontSize: "13px",
                            color: "#666",
                            marginBottom: "10px",
                          }}
                        >
                          Or try one of these:
                        </p>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                          }}
                        >
                          {suggestions.map(({ label, icon, bg }, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendMessage(label)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                background: "#f9f9f9",
                                color: "#111",
                                border: "1px solid transparent",
                                borderRadius: "14px",
                                padding: "12px 16px",
                                fontSize: "14px",
                                cursor: "pointer",
                                textAlign: "left",
                                transition: "all 0.25s ease",
                              }}
                              onMouseEnter={(e) => {
                                const textLabel =
                                  e.currentTarget.querySelector(".label-text");
                                if (textLabel) {
                                  textLabel.style.backgroundImage =
                                    "linear-gradient(90deg, hsla(344, 97%, 63%, 1), hsla(232, 90%, 59%, 1))";
                                  textLabel.style.backgroundClip = "text";
                                  textLabel.style.webkitBackgroundClip = "text";
                                  textLabel.style.webkitTextFillColor =
                                    "transparent";
                                }
                                e.currentTarget.style.border = "1px solid #ddd";
                              }}
                              onMouseLeave={(e) => {
                                const textLabel =
                                  e.currentTarget.querySelector(".label-text");
                                if (textLabel) {
                                  textLabel.style.backgroundImage = "";
                                  textLabel.style.backgroundClip = "";
                                  textLabel.style.webkitBackgroundClip = "";
                                  textLabel.style.webkitTextFillColor = "";
                                  textLabel.style.color = "#111";
                                }
                                e.currentTarget.style.border =
                                  "1px solid transparent";
                              }}
                            >
                              <div
                                style={{
                                  background: bg,
                                  borderRadius: "50%",
                                  width: "32px",
                                  height: "32px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                {icon}
                              </div>
                              <span className="label-text">{label}</span>
                            </button>
                          ))}
                        </div>
                        

                      </div>
                    )}

                    {showEnquiryForm && (
                      <EnquiryBox>
                        <CloseButton
                          onClick={() => {
                            setShowEnquiryForm(false);
                            setEnquiryData((prev) => ({
                              ...prev,
                              name: "",
                              message: "",
                              // Don't reset phone/email as they're synced from auth
                            }));
                            setTimeout(() => {
                              scrollToBottom();
                            }, 150);
                          }}
                          aria-label="Close Form"
                        >
                          ×
                        </CloseButton>

                        <EnquiryHeading>Send Us Your Enquiry</EnquiryHeading>

                        <EnquiryInput
                          type="text"
                          placeholder="Your Name"
                          value={enquiryData.name}
                          onChange={(e) =>
                            setEnquiryData({
                              ...enquiryData,
                              name: e.target.value,
                            })
                          }
                        />

                        <EnquiryInput
                          type="tel"
                          placeholder={authMethod === "whatsapp" ? "Phone Number (from WhatsApp)" : "Your Phone Number"}
                          value={enquiryData.phone || ""}
                          onChange={(e) =>
                            setEnquiryData({
                              ...enquiryData,
                              phone: e.target.value,
                            })
                          }
                          disabled={authMethod === "whatsapp"}
                          style={{
                            backgroundColor: authMethod === "whatsapp" ? "#f3f4f6" : "white",
                            color: authMethod === "whatsapp" ? "#6b7280" : "#111827",
                            cursor: authMethod === "whatsapp" ? "not-allowed" : "text",
                          }}
                        />

                        <EnquiryInput
                          type="email"
                          placeholder={authMethod === "email" ? "Email (from verification)" : "Your Email"}
                          value={enquiryData.email}
                          onChange={(e) =>
                            setEnquiryData({
                              ...enquiryData,
                              email: e.target.value,
                            })
                          }
                          disabled={authMethod === "email"}
                          style={{
                            backgroundColor: authMethod === "email" ? "#f3f4f6" : "white",
                            color: authMethod === "email" ? "#6b7280" : "#111827",
                            cursor: authMethod === "email" ? "not-allowed" : "text",
                          }}
                        />

                        <EnquiryTextarea
                          placeholder="Your Message"
                          value={enquiryData.message}
                          onChange={(e) =>
                            setEnquiryData({
                              ...enquiryData,
                              message: e.target.value,
                            })
                          }
                          rows={3}
                        />

                        <SubmitButton onClick={handleSubmitEnquiry}>
                          Submit Enquiry
                        </SubmitButton>
                        
                        {/* Info text about pre-filled fields */}
                        <p style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginTop: "12px",
                          textAlign: "center",
                          fontStyle: "italic"
                        }}>
                          {authMethod === "whatsapp" 
                            ? "📱 Phone number is pre-filled from your WhatsApp verification"
                            : authMethod === "email"
                            ? "📧 Email is pre-filled from your email verification"
                            : "Please fill in all required fields"
                          }
                        </p>
                      </EnquiryBox>
                    )}

                    <InputContainer>
                      {needsAuth && !verified ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => setShowAuthScreen(true)}
                            className="verify-cta"
                            style={{
                              width: "100%",
                              padding: "14px 16px",
                              borderRadius: 12,
                              border: "none",
                              fontWeight: 700,
                              color: "#fff",
                              background:
                                "linear-gradient(135deg, #a855f7, #ec4899)",
                            }}
                            aria-label="Verify yourself to continue chat"
                          >
                            {requireAuthText}
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 8 }}>
                          <ChatInput
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type your message..."
                          />
                          {checkEnquiryTriggers(message) && (
                            <div style={{
                              position: "absolute",
                              bottom: "100%",
                              left: "0",
                              right: "0",
                              background: "#f0f9ff",
                              border: "1px solid #c7d2fe",
                              borderRadius: "8px",
                              padding: "8px 12px",
                              fontSize: "12px",
                              color: "#1e40af",
                              marginBottom: "8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "8px",
                            }}>
                              <span>💡 Need help? We can assist you better!</span>
                              <button
                                onClick={showEnquiryFormHandler}
                                style={{
                                  background: "#a855f7",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "4px 8px",
                                  fontSize: "11px",
                                  cursor: "pointer",
                                  fontWeight: "500",
                                }}
                              >
                                Contact Us
                              </button>
                            </div>
                          )}
                          {customization.includeAudio && (
                            <VoiceButton
                              $isRecording={isRecording}
                              onClick={handleMicClick}
                              onTouchStart={handleMicTouchStart}
                              onTouchEnd={handleMicTouchEnd}
                              onMouseDown={handleMicMouseDown}
                              onMouseUp={handleMicMouseUp}
                              style={{
                                background: isRecording 
                                  ? "linear-gradient(135deg, #ef4444, #dc2626)"
                                  : customization.buttonColor
                              }}
                            >
                              {isRecording && !isMobile ? (
                                <FiSquare size={20} />
                              ) : (
                                <FiMic size={20} />
                              )}
                            </VoiceButton>
                          )}
                          <SendButton 
                            onClick={() => handleSendMessage()}
                            style={{ background: customization.buttonColor }}
                          >
                            <IoSend />
                          </SendButton>
                        </div>
                      )}
                      
                      

                      {/* Instructions (hide when gated) */}

                      <p
                        style={{
                          textAlign: "center",
                          color: "#888",
                          fontSize: "0.75rem",
                          margin: "0.5rem 0 0 0",
                        }}
                      >
                        <a
                          href="https://troikatech.in/"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "inherit",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.25rem",
                          }}
                        >
                          Powered by
                          <img
                            src="https://raw.githubusercontent.com/troikatechindia/Asset/refs/heads/main/logo.png"
                            alt="Troika Tech Logo"
                            style={{ height: "14px" }}
                          />
                          <strong>Troika Tech</strong>
                        </a>
                      </p>
                    </InputContainer>
                  </>
                )}
              </ChatContainer>
            )}
          </Chatbox>
          
          <ToastContainer position="top-center" />
        </Overlay>
      )}
    </Wrapper>
  );
};

export default SupaChatbot;
