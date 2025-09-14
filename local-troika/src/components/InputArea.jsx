import React from "react";
import styled from "styled-components";
import { FiArrowUp, FiMic, FiSquare, FiVolume2, FiVolumeX } from "react-icons/fi";
import { IoSend } from "react-icons/io5";

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

const InputArea = ({
  message,
  setMessage,
  handleKeyPress,
  isTyping,
  freeMessagesExhausted,
  verified,
  isRecording,
  isMuted,
  toggleMute,
  handleMicClick,
  handleMicTouchStart,
  handleMicTouchEnd,
  handleMicMouseDown,
  handleMicMouseUp,
  isMobile,
  handleSendMessage
}) => {
  return (
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
  );
};

export default InputArea;
