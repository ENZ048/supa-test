import React, { useRef, useEffect } from "react";
import styled from "styled-components";

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

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    background: #2d2d2d;
    color: #ffffff;
    border-color: #4a4a4a;
  }

  &:focus {
    border-color: #8a2be2;
    background: white;
    box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.1);
    
    @media (prefers-color-scheme: dark) {
      background: #3d3d3d;
    }
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

export default OtpInputComponent;
