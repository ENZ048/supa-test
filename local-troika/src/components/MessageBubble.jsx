import React from "react";
import styled from "styled-components";
import TypewriterMarkdown from "./TypewriterMarkdown";
import ReactMarkdown from "react-markdown";
import { FaVolumeUp, FaStopCircle } from "react-icons/fa";

const MessageWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  position: relative;
  margin: 0.625rem 0;
  justify-content: ${(props) => (props.$isUser ? "flex-end" : "flex-start")};
  padding: ${(props) => (props.$isUser ? "0 12px 0 0" : "0 0 0 12px")};
  overflow: visible; /* important so tail can render outside */

  @media (max-width: 768px) {
    margin: 0.375rem 0; /* Reduce margin on mobile */
  }

  @media (max-width: 480px) {
    margin: 0.25rem 0; /* Further reduce margin on small mobile */
  }
`;

const MessageBubble = styled.div`
  padding: 0.75rem 1rem;
  border-radius: 18px;
  font-size: 1rem;
  line-height: 1.4;
  word-wrap: break-word;
  max-width: 76%;
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

// Removed AudioWaitingIndicator and ClickToPlayText - no longer needed

const Timestamp = styled.span`
  font-size: 0.625rem;
  color: rgb(0, 0, 0);
  margin-top: 0.375rem;
`;

const MessageBubbleComponent = ({ 
  message, 
  index, 
  isUser, 
  isTyping, 
  animatedMessageIdx, 
  chatHistoryLength,
  currentlyPlaying,
  playAudio,
  setAnimatedMessageIdx
}) => {
  return (
    <MessageWrapper $isUser={isUser}>
      <div>
        <MessageBubble $isUser={isUser}>
          {/* Conditional rendering for typewriter effect with markdown support - ONLY for bot messages */}
          {!isUser &&
          index === chatHistoryLength - 1 &&
          !isTyping &&
          animatedMessageIdx !== index ? (
            <TypewriterMarkdown
              text={message.text}
              onComplete={() => setAnimatedMessageIdx(index)}
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
              {message.text}
            </ReactMarkdown>
          )}
        </MessageBubble>

        <MessageActions $isUser={isUser}>
          {!isUser && message.audio && (
            <PlayButton
              onClick={() => {
                console.log(`Play button clicked for message ${index}, audio data:`, message.audio);
                playAudio(message.audio, index);
              }}
              disabled={isTyping}
              title={currentlyPlaying === index ? "Stop audio" : "Play audio"}
            >
              {currentlyPlaying === index ? (
                <FaStopCircle />
              ) : (
                <FaVolumeUp />
              )}
            </PlayButton>
          )}
          <Timestamp>
            {message.timestamp ? message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }) : new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Timestamp>
        </MessageActions>
      </div>
    </MessageWrapper>
  );
};

export default MessageBubbleComponent;
