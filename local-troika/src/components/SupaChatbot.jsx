import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import ReactMarkdown from "react-markdown";

// Import components
import DeviceFrameComponent from "./DeviceFrame";
import ChatHeader from "./ChatHeader";
import MessageBubbleComponent from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import VoiceInputIndicatorComponent from "./VoiceInputIndicator";
import InlineAuth from "./InlineAuth";
import OtpVerification from "./OtpVerification";
import InputArea from "./InputArea";

// Import styles
import { Wrapper, Overlay, Chatbox, ChatContainer, MessagesContainer } from "../styles/MainStyles";
import GlobalStyle from "../styles/GlobalStyles";

// Import hooks
import { useBattery } from "../hooks/useBattery";
import { useClock } from "../hooks/useClock";
import { useAudio } from "../hooks/useAudio";
import { useVoiceRecording } from "../hooks/useVoiceRecording";

// Import utils
import { getTimeBasedGreeting } from "../utils/timeUtils";

const SupaChatbot = ({ chatbotId, apiBase }) => {
  // State management
  const [showChat, setShowChat] = useState(true);
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
  const [isMobile, setIsMobile] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [authMethod, setAuthMethod] = useState(null);
  const [email, setEmail] = useState("");
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
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
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  // Removed greetingAudioReady state - no longer needed without autoplay

  // Refs
  const ttsGenerationTimeout = useRef(null);
  const lastGeneratedGreeting = useRef(null);
  const overlayRef = useRef(null);
  const chatboxRef = useRef(null);
  const endOfMessagesRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const hasMounted = useRef(false);
  const greetingAutoPlayed = useRef(false);
  const pendingGreetingAudio = useRef(null);

  // Custom hooks
  const { batteryLevel, isCharging } = useBattery();
  const currentTime = useClock();
  const { playAudio, currentlyPlaying, audioObject } = useAudio(isMuted);
  const { isRecording, startRecording, stopRecording } = useVoiceRecording(apiBase);

  // Constants
  const AUTH_GATE_KEY = (sid, bot) => `supa_auth_gate:${bot}:${sid}`;
  const SESSION_STORE_KEY = (method) =>
    method === "email" ? "chatbot_user_email" : "chatbot_user_phone";
  const FREE_MESSAGES_KEY = (sid, bot) => `supa_free_messages:${bot}:${sid}`;

  // Function to check and update free message count
  const checkFreeMessageLimit = useCallback(() => {
    if (!sessionId || !chatbotId) {
      return false;
    }

    try {
      const stored = localStorage.getItem(
        FREE_MESSAGES_KEY(sessionId, chatbotId)
      );
      const used = stored ? parseInt(stored, 10) : 0;
      setFreeMessagesUsed(used);

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

      if (newCount >= freeMessageLimit) {
        setFreeMessagesExhausted(true);
      }
    } catch (error) {
      console.error("Error updating free message count:", error);
    }
  }, [sessionId, chatbotId, freeMessageLimit]);

  // Function to generate TTS for greeting message
  const generateGreetingTTS = useCallback(
    async (greetingText, retryCount = 0) => {
      if (!apiBase || ttsGenerationInProgress) return null;

      setTtsGenerationInProgress(true);

      try {
        const response = await axios.post(`${apiBase}/text-to-speech`, {
          text: greetingText,
        });

        if (response.data.audio) {
          console.log("TTS generated successfully for:", greetingText);
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
        } else {
          console.log("No audio data in TTS response for:", greetingText);
        }
      } catch (error) {
        console.error("Failed to generate greeting TTS:", error);

        if (retryCount < 2) {
          console.log(
            `Retrying greeting TTS generation (attempt ${retryCount + 1})`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (retryCount + 1))
          );
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

      if (!forceUpdate && lastGeneratedGreeting.current === greetingText) {
        return;
      }

      if (ttsGenerationTimeout.current) {
        clearTimeout(ttsGenerationTimeout.current);
      }

      ttsGenerationTimeout.current = setTimeout(async () => {
        const greetingAudio = await generateGreetingTTS(greetingText);
        if (greetingAudio) {
          lastGeneratedGreeting.current = greetingText;

          setChatHistory((prev) => {
            if (prev.length === 0) {
              return [
                {
                  sender: "bot",
                  text: greetingText,
                  audio: greetingAudio,
                },
              ];
            } else {
              return prev.map((msg, index) => {
                if (index === 0 && msg.sender === "bot") {
                  return { ...msg, text: greetingText, audio: greetingAudio };
                }
                return msg;
              });
            }
          });

          // Store the greeting audio for manual playback only
          if (showChat && !greetingAutoPlayed.current) {
            console.log("Greeting TTS ready for manual playback:", greetingText);
            pendingGreetingAudio.current = greetingAudio;
            // No autoplay - user must click play button
          }
        }
      }, 500);
    },
    [apiBase, generateGreetingTTS, showChat]
  );

  // Handle user interaction (simplified - no audio enable needed)
  const handleUserInteraction = useCallback(() => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      console.log("User interaction detected");
    }
  }, [hasUserInteracted]);

  // Load chatbot configuration
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get(
          `${apiBase}/chatbot/${chatbotId}/config`
        );
        if (cancelled) return;
        
        const cfg = data || {};
        const newAuthMethod = cfg.auth_method || "whatsapp";
        const freeLimit =
          typeof cfg.free_messages === "number" ? cfg.free_messages : 1;
        setAuthMethod(newAuthMethod);
        setFreeMessageLimit(freeLimit);
        setRequireAuthText(
          cfg.require_auth_text || "Verify yourself to continue chat"
        );

        if (cfg.require_auth_from_start) {
          setNeedsAuth(true);
          setShowInlineAuth(true);
          setShowAuthScreen(false);
        }

        if (cfg.immediate_auth_required || cfg.require_auth) {
          setNeedsAuth(true);
          setShowInlineAuth(true);
          setShowAuthScreen(false);
        }

        // Check for existing session
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
              setFreeMessagesUsed(0);
              setFreeMessagesExhausted(false);
              
              // Only set chat history if it's empty (to avoid overriding existing greeting)
              setChatHistory(prev => {
                if (prev.length === 0) {
                  return [
                    {
                      sender: "bot",
                      text: welcomeMessage,
                    },
                  ];
                }
                return prev;
              });
              setFinalGreetingReady(true);
              
              // Generate TTS for the welcome message
              if (apiBase) {
                ensureGreetingTTS(welcomeMessage);
              }
            } else {
              localStorage.removeItem(storeKey);
              toast.info("Your session has expired. Please sign in again.");
              setVerified(false);
              setNeedsAuth(true);
              setShowInlineAuth(true);
            }
          } catch (err) {
            localStorage.removeItem(storeKey);
            toast.error(
              "Unable to restore your session. Please sign in again."
            );
            setVerified(false);
            setNeedsAuth(true);
            setShowInlineAuth(true);
          }
        }
      } catch {
        setAuthMethod("whatsapp");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiBase, chatbotId]);

  // Generate TTS for initial greeting message
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
        setTimeout(() => {
          ensureGreetingTTS(greetingText);
        }, 200);
      }
    };

    generateInitialGreetingTTS();
  }, [chatbotId, apiBase, ensureGreetingTTS]);

  // Initialize session
  useEffect(() => {
    let id = localStorage.getItem("sessionId");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("sessionId", id);
    }
    setSessionId(id);
  }, []);

  // Set initial greeting
  useEffect(() => {
    if (!finalGreetingReady && chatbotId) {
      setChatHistory([
        {
          sender: "bot",
          text: welcomeMessage,
        },
      ]);
      setFinalGreetingReady(true);
      
      // Generate TTS for the welcome message
      if (apiBase) {
        ensureGreetingTTS(welcomeMessage);
      }
    }
  }, [chatbotId, finalGreetingReady, welcomeMessage, apiBase, ensureGreetingTTS]);

  // Ensure greeting shows even when auth is required from start
  useEffect(() => {
    if (showChat && chatHistory.length === 0 && chatbotId && !finalGreetingReady) {
      setChatHistory([
        {
          sender: "bot",
          text: welcomeMessage,
        },
      ]);
      setFinalGreetingReady(true);
      
      // Generate TTS for the welcome message
      if (apiBase) {
        ensureGreetingTTS(welcomeMessage);
      }
    }
  }, [showChat, chatbotId, finalGreetingReady, welcomeMessage, apiBase, ensureGreetingTTS]);

  // Update welcome message periodically
  useEffect(() => {
    const updateWelcomeMessage = () => {
      setWelcomeMessage(getTimeBasedGreeting());
    };

    updateWelcomeMessage();
    const interval = setInterval(updateWelcomeMessage, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Check free message count when sessionId or chatbotId changes
  useEffect(() => {
    if (sessionId && chatbotId && freeMessageLimit > 0) {
      checkFreeMessageLimit();
    }
  }, [sessionId, chatbotId, freeMessageLimit, checkFreeMessageLimit]);

  // Handle free message exhaustion
  useEffect(() => {
    if (freeMessagesExhausted && !verified) {
      setNeedsAuth(true);
      setShowInlineAuth(true);
    }
  }, [freeMessagesExhausted, verified]);

  // Debug effect to track authentication state (removed to prevent infinite loop)
  // useEffect(() => {
  //   console.log("Auth state changed:", {
  //     verified,
  //     needsAuth,
  //     showInlineAuth,
  //     showInlineAuthInput,
  //     freeMessagesExhausted,
  //     freeMessagesUsed,
  //     freeMessageLimit
  //   });
  // }, [verified, needsAuth, showInlineAuth, showInlineAuthInput, freeMessagesExhausted, freeMessagesUsed, freeMessageLimit]);

  // Note: Removed autoplay functionality - greeting TTS now only plays on manual user interaction

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
  }, [isTyping]);

  // Handle inline auth input delay after animation completes
  useEffect(() => {
    if (
      showInlineAuth &&
      !verified &&
      !isTyping &&
      !otpSent &&
      animatedMessageIdx === chatHistory.length - 1
    ) {
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

  // Handle OTP input display after animation completes
  useEffect(() => {
    if (
      otpSent &&
      !verified &&
      !isTyping &&
      animatedMessageIdx === chatHistory.length - 1
    ) {
      setShowOtpInput(true);
    } else {
      setShowOtpInput(false);
    }
  }, [otpSent, verified, isTyping, animatedMessageIdx]);

  // Check auth gate
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

  // Handle resend timeout
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

  // Reset OTP when phone changes
  useEffect(() => {
    setOtpSent(false);
    setOtp("");
    setResendTimeout(0);
    localStorage.removeItem("resend_otp_start");
  }, [phone]);

  // Check mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Add user interaction listeners
  useEffect(() => {
    const handleInteraction = () => {
      handleUserInteraction();
    };

    // Add multiple event listeners to catch different types of user interaction
    const events = ['click', 'touchstart', 'keydown', 'mousedown'];
    
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, [handleUserInteraction]);

  // Reset component when chatbot changes
  useEffect(() => {
    // Only reset if this is not the initial load
    if (hasMounted.current) {
      setVerified(false);
      setNeedsAuth(false);
      setShowAuthScreen(false);
      setOtpSent(false);
      setOtp("");
      setResendTimeout(0);
      setFreeMessagesUsed(0);
      setFreeMessagesExhausted(false);
      setShowInlineAuth(false);
      setShowInlineAuthInput(false);
      setShowOtpInput(false);
      lastGeneratedGreeting.current = null;
      localStorage.removeItem("resend_otp_start");
      greetingAutoPlayed.current = false;
      setChatHistory([]);
      setFinalGreetingReady(false);
    } else {
      hasMounted.current = true;
    }

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

  // OTP handling functions
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
      if (audioObject) {
        audioObject.muted = next;
      }
      return next;
    });
  };


  const handleSendMessage = useCallback(
    async (inputText) => {
      if (!verified) {
        const canSendFreeMessage = checkFreeMessageLimit();
        if (!canSendFreeMessage) {
          return;
        }
      }

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

      // Increment free message count BEFORE sending the message
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

        const botMessage = {
          sender: "bot",
          text: answer || "Sorry, I couldn't get that.",
          audio,
        };
        
        setChatHistory((prev) => {
          const nh = [...prev, botMessage];
          const botMessageIndex = nh.length - 1;
          
          // Play audio after state update with correct index
          if (audio && true) {
            setTimeout(() => {
              playAudio(audio, botMessageIndex);
            }, 0);
          }
          
          return nh;
        });

        // Handle authentication requirements from backend
        if (requiresAuthNext) {
          setAuthMethod(auth_method || authMethod || "whatsapp");
          setNeedsAuth(true);
          setShowInlineAuth(true);
          try {
            localStorage.setItem(AUTH_GATE_KEY(sessionId, chatbotId), "1");
          } catch {}
        }
      } catch (err) {
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
          const errorMessage = err?.response?.data?.message || "";
          if (
            errorMessage.toLowerCase().includes("subscription") &&
            (errorMessage.toLowerCase().includes("expired") ||
              errorMessage.toLowerCase().includes("inactive"))
          ) {
            toast.error(errorMessage);
          } else {
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

  // Voice recording handlers
  const handleMicClick = () => {
    if (!isMobile) {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording((text) => {
          handleSendMessage(text);
        }).catch((error) => {
          toast.error(error.message || "Voice recording failed");
        });
      }
    }
  };

  const handleMicTouchStart = useCallback(
    (e) => {
      if (isMobile && !isTyping) {
        e.preventDefault();
        e.stopPropagation();
        startRecording((text) => {
          handleSendMessage(text);
        }).catch((error) => {
          toast.error(error.message || "Voice recording failed");
        });
      }
    },
    [isMobile, isTyping]
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
      startRecording((text) => {
        handleSendMessage(text);
      }).catch((error) => {
        toast.error(error.message || "Voice recording failed");
      });
    }
  };

  const handleMicMouseUp = (e) => {
    if (isMobile) {
      e.preventDefault();
      stopRecording();
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
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
          <DeviceFrameComponent>
            <Chatbox ref={chatboxRef}>
              <ChatHeader
                currentTime={currentTime}
                batteryLevel={batteryLevel}
                isCharging={isCharging}
                chatbotLogo={chatbotLogo}
              />

              <ChatContainer>
                <MessagesContainer ref={messagesContainerRef}>
                  {chatHistory.map((msg, idx) => (
                    <MessageBubbleComponent
                      key={idx}
                      message={msg}
                      index={idx}
                      isUser={msg.sender === "user"}
                      isTyping={isTyping}
                      animatedMessageIdx={animatedMessageIdx}
                      chatHistoryLength={chatHistory.length}
                      currentlyPlaying={currentlyPlaying}
                      playAudio={playAudio}
                      setAnimatedMessageIdx={setAnimatedMessageIdx}
                    />
                  ))}

                  <TypingIndicator isTyping={isTyping} />

                  <InlineAuth
                    showInlineAuthInput={showInlineAuthInput}
                    authMethod={authMethod}
                    email={email}
                    setEmail={setEmail}
                    phone={phone}
                    setPhone={setPhone}
                    isPhoneValid={isPhoneValid}
                    setIsPhoneValid={setIsPhoneValid}
                    handleSendOtp={handleSendOtp}
                    loadingOtp={loadingOtp}
                    resendTimeout={resendTimeout}
                  />

                  <OtpVerification
                    showOtpInput={showOtpInput}
                    authMethod={authMethod}
                    email={email}
                    phone={phone}
                    otp={otp}
                    setOtp={setOtp}
                    handleVerifyOtp={handleVerifyOtp}
                    loadingVerify={loadingVerify}
                    resendTimeout={resendTimeout}
                    handleSendOtp={handleSendOtp}
                  />


                  <div ref={endOfMessagesRef} />
                </MessagesContainer>

                <VoiceInputIndicatorComponent isRecording={isRecording} />

                <InputArea
                  message={message}
                  setMessage={setMessage}
                  handleKeyPress={handleKeyPress}
                  isTyping={isTyping}
                  freeMessagesExhausted={freeMessagesExhausted}
                  verified={verified}
                  isRecording={isRecording}
                  isMuted={isMuted}
                  toggleMute={toggleMute}
                  handleMicClick={handleMicClick}
                  handleMicTouchStart={handleMicTouchStart}
                  handleMicTouchEnd={handleMicTouchEnd}
                  handleMicMouseDown={handleMicMouseDown}
                  handleMicMouseUp={handleMicMouseUp}
                  isMobile={isMobile}
                  handleSendMessage={handleSendMessage}
                />
              </ChatContainer>
              <div className="gesture-bar" />
            </Chatbox>
          </DeviceFrameComponent>

          <ToastContainer position="top-center" />
        </Overlay>
      )}
    </Wrapper>
  );
};

export default SupaChatbot;
