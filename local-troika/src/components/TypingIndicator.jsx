import React from "react";
import styled from "styled-components";
import Loader from "./Loader";
import CreativeLoadingText from "./CreativeLoadingText";

const TypingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  padding: 12px 20px;
  min-height: 40px;
`;

const MessageWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  position: relative;
  margin: 0.625rem 0;
  justify-content: flex-start;
  padding: 0 0 0 12px;
  overflow: visible;
`;

const TypingIndicator = ({ isTyping }) => {
  if (!isTyping) return null;

  return (
    <MessageWrapper $isUser={false}>
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
  );
};

export default TypingIndicator;
