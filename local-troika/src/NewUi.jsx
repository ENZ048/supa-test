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
import {
  FiMail,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiArrowLeft,
  FiArrowRight as FiArrowRightIcon,
  FiArrowUp,
} from "react-icons/fi";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { MdArrowBack, MdChevronLeft, MdChevronRight } from "react-icons/md";
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
import { FiMic, FiSquare, FiVolume2, FiVolumeX } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import * as FaIcons from "react-icons/fa";

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
  @keyframes slideOutUp {
    0% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    50% {
      transform: translateY(-20px) scale(0.95);
    }
    100% {
      opacity: 0;
      transform: translateY(-100px) scale(0.9);
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

// Wrapper to vertically center the initial greeting inside the chat area
const GreetingWrapper = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px 24px 32px 24px;
  pointer-events: none;
  z-index: 5;
`;

// Simple iPhone-style time display (e.g., 9:41)
const Clock = styled.div`
  position: absolute;
  top: 16px;
  left: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #1f2937;
  z-index: 20;
  pointer-events: none;
  user-select: none;
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
  /* CSS Variables for easier maintenance */
  --chat-radius: 24px;
  --anim-duration: 0.5s;

  width: 100%;
  max-width: 420px;
  height: 95dvh; /* Using dynamic viewport height */
  max-height: 750px;
  margin-block: auto; /* Vertically centers the box in its container */

  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  
  border-radius: var(--chat-radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 10px 40px rgba(0, 0, 0, 0.06);

  /* --- Animations --- */
  opacity: 0; /* Start hidden */
  animation: slideUp var(--anim-duration) ease-out forwards;
  &.closing {
    animation: slideOut var(--anim-duration) ease forwards;
  }

  /* --- Background: Just a Touch of Gradient --- */
  /* Using a very light off-white base color */
  background-color: #FCFAFF;
  
  background-image:
    /* Color blobs are now extremely faint */
    /* Top-right Purple Blob */
    radial-gradient(circle 500px at 90% 0%, rgba(188, 163, 248, 0.06), transparent 80%),
    /* Middle-left Reddish Blob */
    radial-gradient(circle 350px at 10% 35%, rgba(229, 147, 138, 0.06), transparent 80%),
    /* Bottom-left Blue Blob */
    radial-gradient(circle 450px at 5% 100%, rgba(184, 226, 255, 0.08), transparent 80%),
    
    /* The base gradient is now a very subtle transition between two off-whites */
    linear-gradient(135deg, #FCFAFF 0%, #F7F4FD 100%);

  background-size: cover;
  background-repeat: no-repeat;
  background-attachment: local;

  /* --- Responsive Adjustments --- */
  @media (max-width: 480px) {
    height: 100dvh; /* Take full dynamic height on mobile */
    max-height: 100dvh;
    border-radius: 0; /* Edge-to-edge on small screens */
    margin: 0;
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
  // gap: 0.5rem;
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
  color: #bc3d19;
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
  top: 6px; /* tighter to top */
  right: 8px; /* tighter to right */
  font-size: 2.2rem;
  font-weight: 700;
  cursor: pointer;
  color: #333;
  transition: transform 0.25s ease, color 0.2s ease;
  z-index: 50; /* above clock */
  line-height: 1;
  padding: 2px 6px;
  border-radius: 10px;
  backdrop-filter: blur(6px);
  background: rgba(255,255,255,0.4);

  &:hover {
    transform: scale(1.08);
    color: #111;
    background: rgba(255,255,255,0.6);
  }

  &:hover {
    /* override previous rotate hover */
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
  padding: 0.75rem 1rem; /* Adjusted padding */
  background: transparent;
  position: relative;
`;

const ChatInput = styled.input`
  padding: 1rem 120px 1rem 1.5rem;
  border: none;
  border-radius: 28px;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
  outline: none;
  background: transparent;
  color: #333;
  font-weight: 400;
  line-height: 1.5;

  &::placeholder {
    color: rgba(0, 0, 0, 0.4);
    font-weight: 400;
    font-size: 1rem;
    text-align: left;
  }

  &:focus {
    box-shadow: none;
    color: #1a1a1a;
  }

  &:focus::placeholder {
    color: rgba(0, 0, 0, 0.25);
  }
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-radius: 28px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 56px;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.03);
    border-color: rgba(255, 255, 255, 0.15);
  }

  &:focus-within {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.25);
    box-shadow: 0 8px 36px rgba(0, 0, 0, 0.12), 0 3px 12px rgba(0, 0, 0, 0.08),
      0 0 0 2px rgba(255, 255, 255, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.25),
      inset 0 -1px 0 rgba(0, 0, 0, 0.04);
  }
`;

const DynamicIcon = ({ $hasMessage }) => (
  <IconWrapper $hasMessage={$hasMessage}>
    <FiMic
      size={28}
      style={{ opacity: $hasMessage ? 0 : 1, position: "absolute" }}
    />
    <FiArrowUp
      size={26}
      style={{
        opacity: $hasMessage ? 1 : 0,
        position: "absolute",
        transform: $hasMessage ? "translateY(-1px)" : "none",
      }}
    />
  </IconWrapper>
);

const IconWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  svg {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: scale(${({ $hasMessage }) => ($hasMessage ? 1 : 0.9)});
  }
`;

const DynamicActionButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
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
  color: ${(props) =>
    props.$hasMessage ? "#BC3D19" : props.$isRecording ? "#ef4444" : "#BC3D19"};
  transition: all 0.3s ease;
  flex-shrink: 0;
  outline: none;
  z-index: 10;

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

  &:hover:not(:disabled) {
    transform: translateY(-50%) scale(1.1);
    color: ${(props) =>
      props.$hasMessage
        ? "#9333ea"
        : props.$isRecording
        ? "#dc2626"
        : "#9333ea"};
  }

  &:active:not(:disabled) {
    transform: translateY(-50%) scale(0.95);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: translateY(-50%);
    color: #9ca3af;
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

// A simple flex container is needed to make alignment work
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

const MessageActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$isUser ? "flex-end" : "flex-start")};
  gap: 8px;
  margin-top: 4px;
  opacity: 0.8;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

const PlayButton = styled.button`
  background: transparent;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    color: #333;
    background: rgba(0, 0, 0, 0.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    font-size: 14px;
  }
`;

const ProductCardsComponent = ({ productCards }) => {
  if (!productCards || productCards.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        marginTop: "8px",
        maxWidth: "300px",
      }}
    >
      {productCards.map((card, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            padding: "12px",
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
          }}
        >
          {card.title && (
            <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
              {card.title}
            </div>
          )}
          {card.description && (
            <div style={{ fontSize: "0.9rem", color: "#666" }}>
              {card.description}
            </div>
          )}
          {card.price && (
            <div
              style={{ color: "#BC3D19", fontWeight: "bold", marginTop: "4px" }}
            >
              {card.price}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const Loader = () => (
  <LoaderContainer>
    <LoaderDot style={{ animationDelay: "0s" }} />
    <LoaderDot style={{ animationDelay: "0.2s" }} />
    <LoaderDot style={{ animationDelay: "0.4s" }} />
  </LoaderContainer>
);

const LoaderContainer = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const LoaderDot = styled.div`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #666;
  animation: typing-dots 1.4s infinite ease-in-out;

  @keyframes typing-dots {
    0%,
    60%,
    100% {
      transform: translateY(0);
      opacity: 0.4;
    }
    30% {
      transform: translateY(-10px);
      opacity: 1;
    }
  }
`;

const CreativeLoadingText = () => {
  const [textIndex, setTextIndex] = useState(0);
  const texts = [
    "Crafting magic...",
    "Weaving thoughts...",
    "Sparking ideas...",
    "Brewing brilliance...",
    "Unleashing creativity...",
    "Channeling wisdom...",
    "Generating insights...",
    "Processing brilliance...",
    "Thinking deeply...",
    "Formulating response..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % texts.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return <LoadingTextContainer>{texts[textIndex]}</LoadingTextContainer>;
};

const LoadingTextContainer = styled.div`
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  line-height: 1;
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
  background: #bc3d19;
  // background: hsla(205, 46%, 30%, 1);
  // background: linear-gradient(
  //   90deg,
  //   hsla(205, 46%, 30%, 1) 0%,
  //   hsla(260, 29%, 36%, 1) 100%
  // );
  // background: -moz-linear-gradient(
  //   90deg,
  //   hsla(205, 46%, 30%, 1) 0%,
  //   hsla(260, 29%, 36%, 1) 100%
  // );
  // background: -webkit-linear-gradient(
  //   90deg,
  //   hsla(205, 46%, 30%, 1) 0%,
  //   hsla(260, 29%, 36%, 1) 100%
  // );
  // filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#295270", endColorstr="#524175", GradientType=1);
  color: #fff;
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

const SupaChatbot = ({ chatbotId, apiBase }) => {
  const [showChat, setShowChat] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
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
  // const [isEmailValid, setIsEmailValid] = useState(false);
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
    "https://raw.githubusercontent.com/troikatechindia/Asset/refs/heads/main/Aza%20AI.png"
  );

  const [greetingSlidingOut, setGreetingSlidingOut] = useState(false);
  const [greetingHidden, setGreetingHidden] = useState(false);
  const [ttsGenerationInProgress, setTtsGenerationInProgress] = useState(false);
  const [finalGreetingReady, setFinalGreetingReady] = useState(false);
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

  // Define welcome message using time-based greeting
  const welcomeMessage = useMemo(() => getTimeBasedGreeting(), []);

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

  // Auto-play greeting TTS when chat opens
  useEffect(() => {
    if (
      showChat &&
      !userHasInteracted && // Only play before the user does anything
      chatHistory.length > 0 &&
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
  }, [showChat, userHasInteracted, chatHistory, playAudio]);

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

  // iPhone-like clock updater (updates every 30s)
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      let h = d.getHours();
      const m = d.getMinutes().toString().padStart(2, "0");
      const h12 = h % 12 || 12; // 12-hour format without leading zero
      setCurrentTime(`${h12}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000); // refresh twice a minute
    return () => clearInterval(interval);
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

  // Handle greeting slide-out completion
  useEffect(() => {
    if (greetingSlidingOut) {
      const timer = setTimeout(() => {
        setGreetingHidden(true);
      }, 800); // Animation duration is 0.8s
      return () => clearTimeout(timer);
    }
  }, [greetingSlidingOut]);

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

      // Mark interaction and trigger slide-out only for the very first user message
      if (!userHasInteracted && chatHistory.length === 1) {
        setGreetingSlidingOut(true);
      }
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

    setGreetingSlidingOut(false); // Reset greeting slide-out state
    setGreetingHidden(false); // Reset greeting hidden state

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
                  "https://raw.githubusercontent.com/troikatechindia/Asset/refs/heads/main/Aza%20AI.png";
              }}
            />
          </ChatButton>
          <Label>aza AI</Label>
        </FloatingUnit>
      )}

      {showChat && (
        <Overlay ref={overlayRef}>
          <Chatbox ref={chatboxRef}>
            {currentTime && <Clock>{currentTime}</Clock>}
            <Header>
              <HeaderLeft>
                <StatusBlock>
                  <BotName>aza AI</BotName>
                  <Status>AI Fashion Assistant</Status>
                </StatusBlock>
              </HeaderLeft>
              <CloseBtn
                onClick={() => {
                  if (true && audioObject) {
                    audioObject.pause(); // optional: stop audio on close
                  }
                  // Reset auto-play flag when chat is closed
                  greetingAutoPlayed.current = false;
                  setGreetingSlidingOut(false);
                  setGreetingHidden(false);
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
                {/* Centered Greeting */}
                {!greetingHidden && (!userHasInteracted || greetingSlidingOut) && (
                  <GreetingWrapper>
                    <div
                      style={{
                        maxWidth: "100%",
                        textAlign: "left",
                        marginTop: "-130px",
                        animation: greetingSlidingOut
                          ? "slideOutUp 0.8s ease forwards"
                          : "fadeIn 0.5s ease-out",
                      }}
                    >
                      <h1
                        style={{
                          fontSize: "2.2rem",
                          fontWeight: 700,
                          margin: 0,
                          lineHeight: 1.2,
                        }}
                      >
                        <span style={{ color: "#1F2937" }}>Hi, I'm </span>
                        <span style={{ color: "#BC3D19" }}>aza AI</span>
                      </h1>
                      <h2
                        style={{
                          fontSize: "1.8rem",
                          fontWeight: 500,
                          margin: "4px 0 20px 0",
                          color: "#1F2937",
                        }}
                      >
                        How can I help you today
                      </h2>
                      <p
                        style={{
                          fontSize: "1rem",
                          color: "#4A5568",
                          margin: 0,
                          lineHeight: 1.4,
                        }}
                      >
                        {welcomeMessage}
                      </p>
                    </div>
                  </GreetingWrapper>
                )}

                <MessagesContainer ref={messagesContainerRef}>
                  {chatHistory.map((msg, idx) => {
                    // Skip rendering the first bot message because it's part of the welcome screen
                    if (idx === 0 && msg.sender === "bot") return null;

                    return (
                      <MessageWrapper key={idx} $isUser={msg.sender === "user"}>
                        <div>
                          <MessageBubble $isUser={msg.sender === "user"}>
                            {/* 👇 Conditional rendering for typewriter effect */}
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
                                        padding: "0",
                                        color: "#1e90ff",
                                        textDecoration: "none",
                                        transition: "all 0.2s ease-in-out",
                                      }}
                                      onMouseEnter={(e) => {
                                        e.target.style.textDecoration =
                                          "underline";
                                        e.target.style.color = "#0f62fe";
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
                            {/* 👆 Modification end */}
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
                    );
                  })}

                  {isTyping && (
                    <MessageWrapper $isUser={false}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          flexWrap: "nowrap",
                          flexDirection: "row", // ensure horizontal layout for loader + text
                          gap: "12px",
                          padding: "16px 20px",
                          minWidth: 0,
                        }}
                      >
                        <Loader />
                        <CreativeLoadingText />
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
                          : "Ask me anything..."
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
                    <MuteButton
                      onClick={toggleMute}
                      $isMuted={isMuted}
                      style={{
                        position: "absolute",
                        right: "56px",
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      {isMuted ? <FiVolumeX /> : <FiVolume2 />}
                    </MuteButton>
                    <DynamicActionButton
                      onClick={() => {
                        if (message.trim()) {
                          !isTyping && handleSendMessage();
                        } else {
                          handleMicClick();
                        }
                      }}
                      onTouchStart={(e) => {
                        if (!message.trim()) {
                          handleMicTouchStart(e);
                        }
                      }}
                      onTouchEnd={(e) => {
                        if (!message.trim()) {
                          handleMicTouchEnd(e);
                        }
                      }}
                      onMouseDown={(e) => {
                        if (!message.trim()) {
                          handleMicMouseDown(e);
                        }
                      }}
                      onMouseUp={(e) => {
                        if (!message.trim()) {
                          handleMicMouseUp(e);
                        }
                      }}
                      disabled={
                        isTyping || (freeMessagesExhausted && !verified)
                      }
                      $isRecording={isRecording}
                      $hasMessage={message.trim().length > 0}
                    >
                      <DynamicIcon $hasMessage={message.trim().length > 0} />
                    </DynamicActionButton>
                  </InputWrapper>

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
