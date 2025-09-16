import React from "react";
import styled from "styled-components";
import { ClipLoader } from "react-spinners";
import { IoSend } from "react-icons/io5";

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

const InlineAuth = ({
  showInlineAuthInput,
  authMethod,
  email,
  setEmail,
  phone,
  setPhone,
  isPhoneValid,
  setIsPhoneValid,
  handleSendOtp,
  loadingOtp,
  resendTimeout
}) => {
  if (!showInlineAuthInput) return null;

  return (
    <MessageWrapper $isUser={false}>
      <div>
        <MessageBubble $isUser={false}>
          <div style={{ marginBottom: "12px" }}>
            Share your WhatsApp number so we can keep the conversation going if we get disconnected.
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
                  background: "white",
                  color: "#000",
                }}
                className="auth-input"
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
                    background: "white",
                    color: "#000",
                  }}
                  className="auth-input"
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
  );
};

export default InlineAuth;
