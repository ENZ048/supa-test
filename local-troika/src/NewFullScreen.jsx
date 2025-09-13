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
import { FiMail, FiArrowUp } from "react-icons/fi";
import { FaVolumeUp, FaStopCircle } from "react-icons/fa";
import { TypeAnimation } from "react-type-animation";
import { IoSend } from "react-icons/io5";
import { FiMic, FiSquare, FiVolume2, FiVolumeX } from "react-icons/fi";
import ReactMarkdown from "react-markdown";

// Custom Typewriter Component for Markdown
const TypewriterMarkdown = ({ text, onComplete, speed = 20 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  // Function to parse markdown and create segments with their types
  const parseMarkdown = (text) => {
    const segments = [];
    const lines = text.split("\n");
    let charPosition = 0;

    lines.forEach((line, lineIndex) => {
      // Add newline character for all lines except the first
      if (lineIndex > 0) {
        segments.push({
          type: "newline",
          content: "\n",
          start: charPosition,
          end: charPosition + 1,
        });
        charPosition += 1;
      }

      const trimmedLine = line.trim();

      // Check for bullet points (*, -, +)
      const bulletMatch = trimmedLine.match(/^[\*\-\+]\s+(.+)$/);
      if (bulletMatch) {
        segments.push({
          type: "list-item",
          content: bulletMatch[1],
          bullet: trimmedLine[0],
          start: charPosition,
          end: charPosition + bulletMatch[1].length,
        });
        charPosition += bulletMatch[1].length;
        return;
      }

      // Check for numbered lists
      const numberedMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
      if (numberedMatch) {
        segments.push({
          type: "numbered-item",
          content: numberedMatch[1],
          number: numberedMatch[0].match(/^(\d+)\./)[1],
          start: charPosition,
          end: charPosition + numberedMatch[1].length,
        });
        charPosition += numberedMatch[1].length;
        return;
      }

      // Process regular text with inline markdown
      if (line.length > 0) {
        const inlineSegments = parseInlineMarkdown(line, charPosition);
        segments.push(...inlineSegments);
        // Update charPosition based on the actual content length (excluding markdown syntax)
        const contentLength = line
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*(.*?)\*/g, "$1")
          .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
          .replace(/`(.*?)`/g, "$1").length;
        charPosition += contentLength;
      }
    });

    return segments;
  };

  // Function to parse inline markdown (bold, italic, links, code)
  const parseInlineMarkdown = (text, startOffset = 0) => {
    const segments = [];
    let currentPos = 0;

    // Regex patterns for different markdown elements - ordered by priority
    const patterns = [
      { type: "bold", regex: /\*\*(.*?)\*\*/g },
      { type: "italic", regex: /(?<!\*)\*(?!\*)([^*]+?)\*(?!\*)/g }, // Negative lookbehind/lookahead to avoid bold conflicts
      { type: "link", regex: /\[(.*?)\]\((.*?)\)/g },
      { type: "code", regex: /`(.*?)`/g },
    ];

    const matches = [];

    // Find all markdown patterns
    patterns.forEach((pattern) => {
      let match;
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          type: pattern.type,
          start: match.index,
          end: match.index + match[0].length,
          full: match[0],
          content: match[1],
          url: match[2], // for links
        });
      }
    });

    // Remove overlapping matches (keep the first one found)
    const filteredMatches = [];
    matches.forEach((match) => {
      const hasOverlap = filteredMatches.some(
        (existing) => match.start < existing.end && match.end > existing.start
      );
      if (!hasOverlap) {
        filteredMatches.push(match);
      }
    });

    // Sort matches by position
    filteredMatches.sort((a, b) => a.start - b.start);

    // Create segments
    filteredMatches.forEach((match) => {
      // Add text before this match
      if (match.start > currentPos) {
        segments.push({
          type: "text",
          content: text.slice(currentPos, match.start),
          start: startOffset + currentPos,
          end: startOffset + match.start,
        });
      }

      // Add the markdown element
      segments.push({
        type: match.type,
        content: match.content,
        full: match.full,
        url: match.url,
        start: startOffset + match.start,
        end: startOffset + match.end,
      });

      currentPos = match.end;
    });

    // Add remaining text
    if (currentPos < text.length) {
      segments.push({
        type: "text",
        content: text.slice(currentPos),
        start: startOffset + currentPos,
        end: startOffset + text.length,
      });
    }

    // If no matches found, return the entire text as a single segment
    if (filteredMatches.length === 0) {
      return [
        {
          type: "text",
          content: text,
          start: startOffset,
          end: startOffset + text.length,
        },
      ];
    }

    return segments;
  };

  // Get the visible content based on current typing position
  const getVisibleContent = (segments, targetLength) => {
    let currentLength = 0;
    const visibleSegments = [];

    for (const segment of segments) {
      if (segment.type === "newline") {
        if (currentLength < targetLength) {
          visibleSegments.push(segment);
          currentLength += 1;
        }
        continue;
      }

      const segmentContentLength = segment.content.length;
      const segmentStart = currentLength;
      const segmentEnd = currentLength + segmentContentLength;

      if (targetLength <= segmentStart) {
        break; // We haven't reached this segment yet
      }

      if (targetLength >= segmentEnd) {
        // Entire segment is visible
        visibleSegments.push(segment);
        currentLength = segmentEnd;
      } else {
        // Partial segment is visible
        const partialLength = targetLength - segmentStart;
        visibleSegments.push({
          ...segment,
          content: segment.content.substring(0, partialLength),
          partial: true,
        });
        break;
      }
    }

    return visibleSegments;
  };

  // Render the segments as JSX
  const renderSegments = (segments) => {
    return segments.map((segment, index) => {
      switch (segment.type) {
        case "bold":
          return <strong key={index}>{segment.content}</strong>;
        case "italic":
          return <em key={index}>{segment.content}</em>;
        case "link":
          return (
            <a
              key={index}
              href={segment.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#1e90ff",
                textDecoration: "none",
                transition: "all 0.2s ease-in-out",
              }}
            >
              {segment.content}
            </a>
          );
        case "code":
          return (
            <code
              key={index}
              style={{
                backgroundColor: "#f0f0f0",
                padding: "2px 4px",
                borderRadius: "3px",
                fontSize: "0.9em",
              }}
            >
              {segment.content}
            </code>
          );
        case "list-item":
          // Parse inline markdown within list items
          const listInlineSegments = parseInlineMarkdown(segment.content, 0);
          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "flex-start",
                marginBottom: "4px",
              }}
            >
              <span
                style={{ marginRight: "8px", minWidth: "16px", color: "#666" }}
              >
                •
              </span>
              <span>{renderSegments(listInlineSegments)}</span>
            </div>
          );
        case "numbered-item":
          // Parse inline markdown within numbered list items
          const numberedInlineSegments = parseInlineMarkdown(
            segment.content,
            0
          );
          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "flex-start",
                marginBottom: "4px",
              }}
            >
              <span
                style={{ marginRight: "8px", minWidth: "20px", color: "#666" }}
              >
                {segment.number}.
              </span>
              <span>{renderSegments(numberedInlineSegments)}</span>
            </div>
          );
        case "newline":
          return <br key={index} />;
        default:
          return <span key={index}>{segment.content}</span>;
      }
    });
  };

  // Calculate total visible text length (excluding markdown syntax)
  const getTotalTextLength = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold syntax
      .replace(/\*(.*?)\*/g, "$1") // Remove italic syntax
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1") // Remove link syntax
      .replace(/`(.*?)`/g, "$1") // Remove code syntax
      .replace(/^[\*\-\+]\s+/gm, "") // Remove bullet points
      .replace(/^\d+\.\s+/gm, "").length; // Remove numbered list syntax
  };

  const segments = parseMarkdown(text);
  const totalLength = getTotalTextLength(text);

  useEffect(() => {
    if (currentIndex < totalLength) {
      intervalRef.current = setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, speed);
    } else if (currentIndex >= totalLength && onComplete) {
      setTimeout(() => onComplete(), 100);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [currentIndex, totalLength, speed, onComplete]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [text]);

  const visibleSegments = getVisibleContent(segments, currentIndex);

  return (
    <div style={{ minHeight: "1.5em" }}>
      <div style={{ margin: "0", padding: "0" }}>
        {renderSegments(visibleSegments)}
      </div>
    </div>
  );
};

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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0rem; /* Added for spacing on smaller screens */
  overscroll-behavior: contain; /* prevents scroll chaining to host page */
  touch-action: pan-y; /* keeps vertical scrolling smooth inside */
  z-index: 2147481000; /* sits above WP sticky headers/admin bar */
  overflow: visible; /* Ensure buttons are not clipped */
`;

const Chatbox = styled.div`
  &.closing {
    animation: slideOut 0.5s ease forwards;
  }
  transform: translateY(40px);
  opacity: 0;
  animation: slideUp 0.5s ease-out forwards;
  width: 100%; /* Changed from 90% */
  max-width: 380px; /* Decreased from 420px */
  height: 95vh; /* Adjusted for better viewport fit */
  max-height: 700px;

  @media (max-width: 768px) and (max-height: 642px) {
    max-width: 320px; /* Reduced width for 768x642 dimension */
  }

  @media (max-width: 768px) {
    max-width: 350px; /* Reduced width for tablet devices */
  }

  @media (max-width: 480px) {
    max-width: 332px; /* Reduced width for mobile devices (340 - 8px bezel) */
  }
  background: linear-gradient(
    135deg,
    rgb(235, 224, 255) 0%,
    rgb(215, 255, 252) 100%
  );

  /* Make sure the background stays fixed while content scrolls */
  background-attachment: fixed;
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
    height: 97vh;
    max-height: 100vh;
    /* Increased rounding for mobile while keeping inside bezel */
    border-radius: 24px;
  }
`;

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

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3rem 1rem 1rem 1rem; /* Increased top padding to avoid notch */
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
  gap: 0.6rem;
  padding-top: 0.25rem;
`;

/* Generic circle wrapper so avatar, bot name and status can each sit in a circle */
const Circle = styled.div`
  width: ${(props) => props.$size || 80}px;
  height: ${(props) => props.$size || 80}px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.6);
  padding: 0; /* removed extra padding so avatar fills circle */
  text-align: center;
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover; /* fill circle exactly */
  border-radius: 50%;
  display: block;
`;

const StatusBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const BotName = styled.div`
  font-weight: 800;
  background: rgb(0, 0, 0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 1.25rem;
  text-align: center;
  line-height: 1.1;
  margin-bottom: 0.5rem;

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const Status = styled.div`
  font-size: 0.7rem;
  color: rgb(0, 0, 0);
  text-align: center;
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
  border: 1px solid #dee2e6;
  border-radius: 25px;
  font-size: 0.875rem;
  width: 100%;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.3s;
  background: white;
  &:focus {
    border-color: #8a2be2;
    box-shadow: 0 0 0 2px rgba(138, 43, 226, 0.2);
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

  /* ensure buttons don't unexpectedly cover text on small screens */
  @media (max-width: 480px) {
    gap: 6px;
  }
`;

// MessageWrapper (if you need it)
const MessageWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  position: relative;
  margin: 0.625rem 0;
  justify-content: ${(props) => (props.$isUser ? "flex-end" : "flex-start")};
  padding: ${(props) => (props.$isUser ? "0 12px 0 0" : "0 0 0 12px")};
  overflow: visible; /* important so tail can render outside */
`;

const MessageBubble = styled.div`
  padding: 0.75rem 1rem;
  border-radius: 18px;
  font-size: 1rem;
  line-height: 1.4;
  word-wrap: break-word;
  max-width: 75%;
  position: relative;
  margin: 0.5rem 0;
  width: fit-content;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  ${({ $isUser }) =>
    $isUser
      ? `
    background: #000;
    color: #fff;
    align-self: flex-end;
  `
      : `
    background: #fff;
    color: #000;
    align-self: flex-start;
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
  color: rgb(0, 0, 0);
  margin-top: 0.375rem;
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
  background: linear-gradient(135deg, #8a2be2, #14b8a6);
  border-radius: 50%;
  margin: 0 auto 24px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${glow} 2s infinite;
`;

const OtpTitle = styled.h2`
  background: linear-gradient(135deg, #8a2be2, #14b8a6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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
  color: #8a2be2;
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
  border: 2px solid #dee2e6;
  background: #f9fafb;
  color: #111827;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: #8a2be2;
    background: white;
    box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.1);
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
  background: linear-gradient(135deg, #8a2be2, #14b8a6);
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
    box-shadow: 0 4px 12px rgba(138, 43, 226, 0.3);
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
    color: #8a2be2;
    cursor: pointer;
    font-weight: 600;
    text-decoration: underline;

    &:hover {
      color: #14b8a6;
    }
  }
`;

const SendButton = styled.button`
  background: linear-gradient(135deg, #7c3aed 0%, #0d9488 100%);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  max-width: 36px;
  max-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
  flex-shrink: 0;
  padding: 0;
  box-shadow: 0 2px 8px rgba(138, 43, 226, 0.3);
  aspect-ratio: 1;

  svg {
    color: inherit;
    flex-shrink: 0;
    font-size: 18px;
    width: 18px;
    height: 18px;
    font-weight: 900;
    stroke-width: 3;
  }

  &:hover:not(:disabled) {
    transform: scale(1.1);
    background: linear-gradient(135deg, #7c3aed 0%, #0d9488 100%);
    box-shadow: 0 4px 12px rgba(138, 43, 226, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    background: #9ca3af;
    box-shadow: none;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.2);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.2);
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
  color: #8a2be2;
  transition: all 0.3s ease;
  flex-shrink: 0;
  position: relative;
  z-index: 9999; /* Higher than overlay */
  transform: scale(1);

  svg {
    color: inherit;
    flex-shrink: 0;
    font-size: 25px;
  }

  &:hover:not(:disabled) {
    transform: scale(1.1);
    color: #14b8a6;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }

  &:focus {
    outline: none;
    box-shadow: none;
  }

  &:focus-visible {
    outline: none;
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
  color: ${(props) => (props.$isRecording ? "#ef4444" : "#8a2be2")};
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
    color: ${(props) => (props.$isRecording ? "#dc2626" : "#14b8a6")};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }

  &:focus {
    outline: none;
    box-shadow: none;
  }

  &:focus-visible {
    outline: none;
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
  cursor: pointer;
  color: #8a2be2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  transition: all 0.2s ease;
  width: 28px;
  height: 28px;
  font-size: 12px;
  outline: none;
  background: transparent;

  &:focus {
    outline: none;
    box-shadow: none;
  }

  &:focus-visible {
    outline: none;
  }

  &:hover {
    transform: scale(1.1);
    color: #14b8a6;
  }

  &:disabled {
    cursor: default;
    transform: none;
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
    "Matching the perfect accessories...",
    "Perfecting the silhouette...",
    "Curating designer vibes...",
    "Generating insights...",
    "Processing brilliance...",
    "Thinking deeply...",
    "Weaving elegance into words...",
    "Adding a touch of luxury...",
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
    background: #000000;
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
    background-color: rgba(138, 43, 226, 0.2);
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

// Function to get time-based greeting messages
function getTimeBasedGreeting() {
  const now = new Date();
  const hour = now.getHours();

  const morningGreetings = [
    "☀️ Good morning! Ready to kickstart your business today?",
    "Morning! A fresh day = fresh ideas. What can I solve for you?",
    "Rise & shine—let’s make your business smarter today.",
  ];

  const afternoonGreetings = [
    "Hey 👋 Hope your day’s going well! Need a quick business boost?",
    "Welcome! Perfect time for a smart solution—shall we start?",
    "Good afternoon! Tell me what’s bugging you, I’ll fix it fast.",
  ];

  const eveningGreetings = [
    "Evenings are for smart moves ✨ What’s on your mind?",
    "Hey! Don’t worry if it’s late—business doesn’t sleep, and neither do I.",
    "Good evening! Ready to make your next big business move?",
  ];

  const lateNightGreetings = [
    "🌙 Burning the midnight oil? I’m here to help.",
    "You’re up late, and so am I. Let’s get things done.",
    "Insomniac or hustler? Either way—I’ve got your back.",
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

const Clock = styled.div`
  position: absolute;
  top: 16px; /* Reverted to original position */
  left: 12px;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #1f2937;
  z-index: 20;
  pointer-events: none;
  user-select: none;
`;

const BatteryContainer = styled.div`
  position: absolute;
  top: 16px;
  right: 60px; /* Moved left to avoid close button overlap */
  display: flex;
  align-items: center;
  gap: 4px; /* Restored gap between percentage and battery */
  font-size: 0.85rem; /* iPhone-style smaller font */
  font-weight: 600;
  color: #495057; /* Dark gray like iPhone */
  z-index: 20;
  pointer-events: none;
  user-select: none;

  @media (max-width: 480px) {
    right: 50px; /* Adjust for mobile */
    font-size: 0.8rem;
  }
`;

const BatteryIcon = styled.div`
  width: 25px; /* Back to standard iPhone proportions */
  height: 13px;
  border: 1px solid #adb5bd;
  border-radius: 3px;
  position: relative;
  background: transparent;

  &::before {
    content: "";
    position: absolute;
    right: -4px;
    top: 4px;
    width: 3px;
    height: 5px;
    background: #6c757d;
    border-radius: 0 2px 2px 0;
  }

  &::after {
    content: "";
    position: absolute;
    left: 1.5px;
    top: 1.5px;
    bottom: 1.5px;
    width: ${(props) => Math.max(0, (props.$level / 100) * 21)}px;
    background: ${(props) => {
      if (props.$isCharging) return "#34c759"; /* Always green when charging */
      if (props.$level >= 50) return "#34c759"; /* iPhone green */
      if (props.$level >= 20) return "#ff9500"; /* iPhone orange */
      return "#ff3b30"; /* iPhone red */
    }};
    border-radius: 1.5px;
    transition: width 0.3s ease;

    ${(props) =>
      props.$isCharging &&
      `
        animation: chargingPulse 2s ease-in-out infinite;
        
        @keyframes chargingPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}
  }

  @media (max-width: 480px) {
    width: 22px;
    height: 11px;

    &::before {
      right: -3px;
      top: 3px;
      width: 2px;
      height: 5px;
    }

    &::after {
      width: ${(props) => Math.max(0, (props.$level / 100) * 18)}px;
    }
  }
`;

const ChargingIcon = styled.div`
  position: absolute;
  right: 64px; /* Next to battery percentage */
  top: 16px;
  font-size: 0.8rem;
  color: #34c759; /* iPhone green */
  z-index: 21;
  pointer-events: none;
  user-select: none;
  animation: chargingBolt 1.5s ease-in-out infinite;

  @keyframes chargingBolt {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.1);
    }
  }

  @media (max-width: 480px) {
    right: 54px;
    font-size: 0.75rem;
  }
`;

const BatteryPercentage = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: #495057; /* Dark gray like iPhone */

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const SupaChatbot = ({ chatbotId, apiBase }) => {
  const [showChat, setShowChat] = useState(true);
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
    "https://raw.githubusercontent.com/troika-tech/Asset/refs/heads/main/Supa%20Agent%20new.png"
  );

  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(false);

  const [finalGreetingReady, setFinalGreetingReady] = useState(false);
  const [ttsGenerationInProgress, setTtsGenerationInProgress] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("Search here for products, brand and more");
  const ttsGenerationTimeout = useRef(null);
  const lastGeneratedGreeting = useRef(null);

  const recordingTimeout = useRef();
  const overlayRef = useRef(null);
  const chatboxRef = useRef(null);
  const endOfMessagesRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const hasMounted = useRef(false);
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

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Get battery information
  useEffect(() => {
    const getBatteryInfo = async () => {
      try {
        if ("getBattery" in navigator) {
          const battery = await navigator.getBattery();
          setBatteryLevel(Math.round(battery.level * 100));
          setIsCharging(battery.charging);

          // Listen for battery changes
          battery.addEventListener("levelchange", () => {
            setBatteryLevel(Math.round(battery.level * 100));
          });

          battery.addEventListener("chargingchange", () => {
            setIsCharging(battery.charging);
          });
        } else {
          // Fallback: simulate battery level for browsers that don't support Battery API
          const simulateBattery = () => {
            const randomLevel = Math.floor(Math.random() * 40) + 60; // 60-100%
            setBatteryLevel(randomLevel);
            setIsCharging(Math.random() > 0.7); // 30% chance of charging
          };
          simulateBattery();

          // Update simulation occasionally
          const interval = setInterval(simulateBattery, 30000); // Every 30 seconds
          return () => clearInterval(interval);
        }
      } catch (error) {
        console.log("Battery API not supported, using fallback");
        // Fallback for unsupported browsers
        setBatteryLevel(Math.floor(Math.random() * 40) + 60);
        setIsCharging(Math.random() > 0.7);
      }
    };

    getBatteryInfo();
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

        const { answer, audio, requiresAuthNext, auth_method } = response.data;

        console.log("Answer length:", answer?.length);
        console.log("Full answer:", answer);
        console.log("Answer ends with:", answer?.slice(-50)); // Last 50 characters

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

      {showChat && (
        <Overlay ref={overlayRef}>
          <DeviceFrame>
            {/* iPhone-style Hardware Buttons (Mock/Decorative) */}
            <PowerButton />
            <SilentSwitch />
            <VolumeUpButton />
            <VolumeDownButton />

            <Chatbox ref={chatboxRef}>
              <Header>
                <Clock>
                  {(() => {
                    const hours = currentTime.getHours();
                    const minutes = currentTime.getMinutes();
                    const displayHours = ((hours + 11) % 12) + 1; // 12-hour without leading zero
                    const period = hours >= 12 ? "PM" : "AM";
                    return `${displayHours}:${minutes
                      .toString()
                      .padStart(2, "0")} ${period}`;
                  })()}
                </Clock>
                {isCharging && <ChargingIcon>⚡</ChargingIcon>}
                <BatteryContainer>
                  <BatteryPercentage>{batteryLevel}%</BatteryPercentage>
                  <BatteryIcon $level={batteryLevel} $isCharging={isCharging} />
                </BatteryContainer>
                <HeaderLeft>
                  <Circle $size={70}>
                    <Avatar
                      src={chatbotLogo}
                      alt="avatar"
                      onError={(e) => {
                        e.target.src =
                          "https://raw.githubusercontent.com/troika-tech/Asset/refs/heads/main/Supa%20Agent%20new.png";
                      }}
                    />
                  </Circle>
                  <StatusBlock>
                    <BotName>Supa Agent</BotName>
                    <Status>AI Assistant</Status>
                  </StatusBlock>
                </HeaderLeft>
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
                            {/* Conditional rendering for typewriter effect with markdown support - ONLY for bot messages */}
                            {msg.sender === "bot" &&
                            idx === chatHistory.length - 1 &&
                            !isTyping &&
                            animatedMessageIdx !== idx ? (
                              <TypewriterMarkdown
                                text={msg.text}
                                onComplete={() => setAnimatedMessageIdx(idx)}
                                speed={15}
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
                          </MessageBubble>

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
                                    border: "1px solid #dee2e6",
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
                                        : "linear-gradient(135deg, #8a2be2, #14b8a6)",
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
                                      border: "1px solid #dee2e6",
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
                                        : "linear-gradient(135deg, #8a2be2, #14b8a6)",
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
                                    : "linear-gradient(135deg, #8a2be2, #14b8a6)",
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
                                      color: "#8a2be2",
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
                          <FiArrowUp />
                        </SendButton>
                      </InputButtons>
                    </InputWrapper>

                    {/* Instructions (hide when gated) */}

                    <p
                      style={{
                        textAlign: "center",
                        color: "#000000",
                        fontSize: "0.75rem",
                        margin: "0.8rem 0 0 0",
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
              <div className="gesture-bar" />
            </Chatbox>
          </DeviceFrame>

          <ToastContainer position="top-center" />
        </Overlay>
      )}
    </Wrapper>
  );
};

export default SupaChatbot;
