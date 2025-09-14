import React from "react";
import styled from "styled-components";
import OtpInputComponent from "./OtpInput";

const MessageWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  position: relative;
  margin: 0.625rem 0;
  justify-content: flex-start;
  padding: 0 0 0 12px;
  overflow: visible;
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
  background: #fff;
  color: #000;
  align-self: flex-start;
`;

const OtpVerification = ({
  showOtpInput,
  authMethod,
  email,
  phone,
  otp,
  setOtp,
  handleVerifyOtp,
  loadingVerify,
  resendTimeout,
  handleSendOtp
}) => {
  if (!showOtpInput) return null;

  return (
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
  );
};

export default OtpVerification;
