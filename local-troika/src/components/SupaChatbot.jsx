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
import SuggestionButtons from "./SuggestionButtons";

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
  const [message, setMessage] = useState("I'm Interested");
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
  const [userMessageCount, setUserMessageCount] = useState(0);
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
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [hasShownInterestResponse, setHasShownInterestResponse] = useState(false);
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
  const languageMessageShown = useRef(false);

  // Custom hooks
  const { batteryLevel, isCharging } = useBattery();
  const currentTime = useClock();
  const { playAudio, stopAudio, currentlyPlaying, audioObject, toggleMuteForCurrentAudio } = useAudio(isMuted, hasUserInteracted);
  const { isRecording, startRecording, stopRecording } = useVoiceRecording(apiBase);

  // Constants
  const AUTH_GATE_KEY = (sid, bot) => `supa_auth_gate:${bot}:${sid}`;
  const SESSION_STORE_KEY = (method) =>
    method === "email" ? "chatbot_user_email" : "chatbot_user_phone";
  const USER_MESSAGE_COUNT_KEY = (sid, bot) => `supa_user_message_count:${bot}:${sid}`;

  // Function to check if user has sent 2 messages and needs auth
  const checkUserMessageCount = useCallback(() => {
    return userMessageCount >= 2;
  }, [userMessageCount]);

  // Function to load user message count from localStorage
  const loadUserMessageCount = useCallback(() => {
    if (!sessionId || !chatbotId) {
      console.log("loadUserMessageCount: sessionId or chatbotId not available", { sessionId, chatbotId });
      return 0;
    }
    
    try {
      const key = USER_MESSAGE_COUNT_KEY(sessionId, chatbotId);
      const stored = localStorage.getItem(key);
      const count = stored ? parseInt(stored, 10) : 0;
      console.log("loadUserMessageCount: loaded count", { key, stored, count });
      return count;
    } catch (error) {
      console.error("Error loading user message count:", error);
      return 0;
    }
  }, [sessionId, chatbotId]);

  // Function to increment user message count
  const incrementUserMessageCount = useCallback(() => {
    setUserMessageCount(prev => {
      const newCount = prev + 1;
      // Persist to localStorage
      if (sessionId && chatbotId) {
        try {
          const key = `supa_user_message_count:${chatbotId}:${sessionId}`;
          localStorage.setItem(key, newCount.toString());
          console.log("incrementUserMessageCount: saved count", { key, newCount });
        } catch (error) {
          console.error("Error saving user message count:", error);
        }
      } else {
        console.log("incrementUserMessageCount: sessionId or chatbotId not available", { sessionId, chatbotId });
      }
      return newCount;
    });
  }, [sessionId, chatbotId]);

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
                  timestamp: new Date(),
                },
              ];
            } else {
              return prev.map((msg, index) => {
                if (index === 0 && msg.sender === "bot") {
                  return { ...msg, text: greetingText, audio: greetingAudio, timestamp: new Date() };
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
        setAuthMethod(newAuthMethod);
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
              console.log("Valid session found, setting verified to true");
              if (newAuthMethod === "email") setEmail(saved);
              else setPhone(saved);
              setVerified(true);
              setNeedsAuth(false);
              setShowAuthScreen(false);
              setShowInlineAuth(false);
              // Don't reset userMessageCount here - let it be handled by the auth flow
              setHasShownInterestResponse(false);
              
              // Only set chat history if it's empty (to avoid overriding existing greeting)
              setChatHistory(prev => {
                if (prev.length === 0) {
                  return [
                    {
                      sender: "bot",
                      text: welcomeMessage,
                      timestamp: new Date(),
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
        } else {
          // No saved session, check if user needs auth based on message count
          // This will be handled by the useEffect that loads user message count
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

  // Load user message count when sessionId and chatbotId are available
  useEffect(() => {
    if (sessionId && chatbotId) {
      console.log("Loading user message count on mount/reload", { sessionId, chatbotId, verified });
      const key = `supa_user_message_count:${chatbotId}:${sessionId}`;
      const stored = localStorage.getItem(key);
      const savedCount = stored ? parseInt(stored, 10) : 0;
      console.log("Setting userMessageCount to", savedCount, "from key", key);
      setUserMessageCount(savedCount);
      
      // Only trigger auth if user has sent 2+ messages and is not verified
      // This will be handled by the other useEffect that watches userMessageCount and verified
    }
  }, [sessionId, chatbotId]);

  // Check if user needs auth based on message count when component mounts or verified state changes
  useEffect(() => {
    if (userMessageCount >= 2 && !verified) {
      setNeedsAuth(true);
      setShowInlineAuth(true);
    } else if (verified) {
      setNeedsAuth(false);
      setShowInlineAuth(false);
    }
  }, [userMessageCount, verified]);

  // Set initial greeting
  useEffect(() => {
    if (!finalGreetingReady && chatbotId) {
      setChatHistory([
        {
          sender: "bot",
          text: welcomeMessage,
          timestamp: new Date(),
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
          timestamp: new Date(),
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




  // Debug effect to track authentication state (removed to prevent infinite loop)
  // useEffect(() => {
  //   console.log("Auth state changed:", {
  //     verified,
  //     needsAuth,
  //     showInlineAuth,
  //     showInlineAuthInput,
  //     userMessageCount
  //   });
  // }, [verified, needsAuth, showInlineAuth, showInlineAuthInput, userMessageCount]);

  // Note: Removed autoplay functionality - greeting TTS now only plays on manual user interaction

  // Auto-scroll when new messages are added
  useEffect(() => {
    if (chatHistory.length > 0 || isTyping) {
      const timeoutId = setTimeout(() => {
        if (messagesContainerRef.current) {
          const container = messagesContainerRef.current;
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isTyping]);


  // Handle inline auth input display
  useEffect(() => {
    if (
      showInlineAuth &&
      !verified &&
      !isTyping &&
      !otpSent
    ) {
      // Show auth input immediately if user has sent 2+ messages (page refresh scenario)
      if (userMessageCount >= 2) {
        setShowInlineAuthInput(true);
      } else {
        // For new messages, wait for animation to complete
        if (animatedMessageIdx === chatHistory.length - 1) {
          const delayTimer = setTimeout(() => {
            setShowInlineAuthInput(true);
          }, 2000);
          return () => clearTimeout(delayTimer);
        }
      }
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
    userMessageCount,
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
      setUserMessageCount(0);
      setShowInlineAuth(false);
      setShowInlineAuthInput(false);
      setShowOtpInput(false);
      lastGeneratedGreeting.current = null;
      localStorage.removeItem("resend_otp_start");
      greetingAutoPlayed.current = false;
      setChatHistory([]);
      setFinalGreetingReady(false);
      setHasShownInterestResponse(false);
      languageMessageShown.current = false;
      
      // Clear user message count from localStorage
      if (sessionId) {
        try {
          const key = `supa_user_message_count:${chatbotId}:${sessionId}`;
          localStorage.removeItem(key);
          console.log("Cleared user message count with key", key);
        } catch (error) {
          console.error("Error clearing user message count:", error);
        }
      }
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
            const key = `supa_user_message_count:${chatbotId}:${sid}`;
            localStorage.removeItem(key);
            console.log("Cleared user message count after auth with key", key);
            setUserMessageCount(0);
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
    console.log("toggleMute called, current isMuted:", isMuted, "currentlyPlaying:", currentlyPlaying);
    const newMutedState = !isMuted;
    console.log(`Mute state toggled to: ${newMutedState}`);
    
    // Apply mute state to currently playing audio first
    toggleMuteForCurrentAudio(newMutedState);
    
    // Then update the state
    setIsMuted(newMutedState);
  };

  const handleSuggestionClick = (suggestionText) => {
    setMessage(suggestionText);
    handleSendMessage(suggestionText);
  };


  const handleSendMessage = useCallback(
    async (inputText) => {

      if (needsAuth && !verified) {
        return;
      }

      if (!sessionId) return;

      const textToSend = inputText || message;
      if (!textToSend.trim()) return;

      // Properly stop any currently playing audio
      console.log("Stopping any currently playing audio before sending new message");
      stopAudio();
      
      // Small delay to ensure audio is fully stopped
      await new Promise(resolve => setTimeout(resolve, 50));
      const userMessage = { sender: "user", text: textToSend, timestamp: new Date() };
      setChatHistory((prev) => [...prev, userMessage]);
      setMessage("");
      setIsTyping(true);

      // Check if user sent "I'm interested" message
      const isInterestedMessage = textToSend.toLowerCase().trim() === "i'm interested";

      // Increment user message count
      incrementUserMessageCount();

      try {
        let botMessage;
        
        if (isInterestedMessage && !hasShownInterestResponse) {
          // Handle "I'm interested" message with specific response
          const thankYouText = "Thank you for showing interest in our WhatsApp marketing solutions.";
          
          // Generate TTS for the thank you message
          let thankYouAudio = null;
          if (apiBase) {
            try {
              const ttsResponse = await axios.post(`${apiBase}/text-to-speech`, {
                text: thankYouText,
              });
              
              if (ttsResponse.data.audio) {
                const base64Data = ttsResponse.data.audio.replace(
                  "data:audio/mpeg;base64,",
                  ""
                );
                const byteArray = Array.from(atob(base64Data), (c) =>
                  c.charCodeAt(0)
                );
                thankYouAudio = {
                  data: byteArray,
                  contentType: "audio/mpeg",
                };
              }
            } catch (error) {
              console.error("Failed to generate TTS for thank you message:", error);
            }
          }
          
          botMessage = {
            sender: "bot",
            text: thankYouText,
            audio: thankYouAudio,
            timestamp: new Date(),
          };
          
          setChatHistory((prev) => {
            const nh = [...prev, botMessage];
            const botMessageIndex = nh.length - 1;
            
            // Auto-play audio after state update with correct index
            if (thankYouAudio) {
              console.log(`Triggering audio for thank you message ${botMessageIndex}`);
              playAudio(thankYouAudio, botMessageIndex);
            }
            
            return nh;
          });
          setHasShownInterestResponse(true);
          
          // Add second message about Indian languages after a delay
          setTimeout(async () => {
            const languageText = "You can chat with me in all the Indian languages";
            
            // Enhanced protection against duplicate language messages
            if (languageMessageShown.current) {
              console.log("Language message already shown, skipping duplicate");
              return;
            }
            
            // Check if language message already exists in chat history
            const hasLanguageMessage = chatHistory.some(msg => 
              msg.sender === "bot" && msg.text === languageText
            );
            
            if (hasLanguageMessage) {
              console.log("Language message already exists in chat history, skipping");
              return;
            }
            
            languageMessageShown.current = true;
            
            // Language message will be text-only (no TTS)
            const languageMessage = {
              sender: "bot",
              text: languageText,
              timestamp: new Date(),
              // No audio property - text-only message
            };
            
            setChatHistory((prev) => {
              const nh = [...prev, languageMessage];
              // No auto-play for language message
              return nh;
            });
            
            // Add additional scrolling when language message arrives
            setTimeout(() => {
              if (messagesContainerRef.current) {
                const container = messagesContainerRef.current;
                container.scrollTo({
                  top: container.scrollHeight,
                  behavior: 'smooth'
                });
              }
            }, 500); // Small delay to ensure the message is rendered
          }, 4000); // Add second message after 2 seconds
          
          // First scroll to bottom, then show suggestions
          setTimeout(() => {
            if (messagesContainerRef.current) {
              const container = messagesContainerRef.current;
              container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
              });
              
              // Show suggestions after scroll animation completes (typically 300-500ms)
              setTimeout(() => {
                setShowSuggestions(true);
              }, 1200); // Wait for scroll animation to complete
            }
          }, 1000); // Start scroll after 1 second delay
        } else if (isInterestedMessage && hasShownInterestResponse) {
          // Handle subsequent "I'm interested" messages with a different response
          const alreadyInterestedText = "I already know you're interested! Feel free to ask me any questions about our services.";
          
          botMessage = {
            sender: "bot",
            text: alreadyInterestedText,
            timestamp: new Date(),
          };
          
          setChatHistory((prev) => [...prev, botMessage]);
        } else {
          // Regular message handling
          console.log("Sending query to backend:", textToSend);
          const response = await axios.post(`${apiBase}/chat/query`, {
            chatbotId,
            query: textToSend,
            sessionId,
            ...(verified ? (authMethod === "email" ? { email } : { phone }) : { email: null, phone: null }),
          });
          console.log("Backend response:", response.data);

          const { answer, audio, requiresAuthNext, auth_method } = response.data;

          botMessage = {
            sender: "bot",
            text: answer || "Sorry, I couldn't get that.",
            audio,
            timestamp: new Date(),
          };
          
          setChatHistory((prev) => {
            const nh = [...prev, botMessage];
            const botMessageIndex = nh.length - 1;
            
            // Auto-play audio after state update with correct index
            if (audio) {
              console.log(`Triggering audio for bot message ${botMessageIndex}`);
              playAudio(audio, botMessageIndex);
            }
            
            return nh;
          });

          // Hide suggestions for regular messages
          setShowSuggestions(false);

          // Handle authentication requirements from backend
          if (requiresAuthNext) {
            setAuthMethod(auth_method || authMethod || "whatsapp");
            setNeedsAuth(true);
            setShowInlineAuth(true);
            try {
              localStorage.setItem(AUTH_GATE_KEY(sessionId, chatbotId), "1");
            } catch {}
          }
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
              timestamp: new Date(),
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
      stopAudio,
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
                <MessagesContainer 
                  ref={messagesContainerRef}
                  style={{
                    paddingBottom: showSuggestions && hasShownInterestResponse ? '100px' : '0px'
                  }}
                >
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

                <SuggestionButtons 
                  onSuggestionClick={handleSuggestionClick}
                  isVisible={showSuggestions && !isTyping && hasShownInterestResponse}
                />

                <InputArea
                  message={message}
                  setMessage={setMessage}
                  handleKeyPress={handleKeyPress}
                  isTyping={isTyping}
                  userMessageCount={userMessageCount}
                  verified={verified}
                  needsAuth={needsAuth}
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
                  currentlyPlaying={currentlyPlaying}
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
