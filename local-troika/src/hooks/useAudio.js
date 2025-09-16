import { useState, useCallback, useRef, useEffect } from "react";

export const useAudio = (isMuted, hasUserInteracted = true) => {
  const [audioObject, setAudioObject] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const currentAudioRef = useRef(null);

  const playAudio = useCallback(
    (audioData, messageIndex) => {
      console.log(`=== playAudio called ===`);
      console.log(`messageIndex: ${messageIndex}, currentlyPlaying: ${currentlyPlaying}`);
      console.log(`hasUserInteracted: ${hasUserInteracted}, isMuted: ${isMuted}`);
      console.log("Audio data received:", audioData);
      console.log("Call stack:", new Error().stack);
      
      // If clicking the same message that's currently playing, stop it
      if (currentlyPlaying === messageIndex) {
        console.log("Stopping currently playing audio");
        if (audioObject) {
          audioObject.pause();
          URL.revokeObjectURL(audioObject.src);
        }
        setCurrentlyPlaying(null);
        setAudioObject(null);
        currentAudioRef.current = null;
        return;
      }

      // Stop any currently playing audio
      if (audioObject) {
        console.log("Stopping previous audio before playing new one");
        audioObject.pause();
        URL.revokeObjectURL(audioObject.src);
      }

      let byteArray = null;
      
      if (audioData?.data) {
        // Local TTS format: { data: byteArray, contentType: "audio/mpeg" }
        console.log("Processing local TTS format audio");
        byteArray = Array.isArray(audioData.data)
          ? audioData.data
          : audioData.data.data;
      } else if (typeof audioData === 'string') {
        // Backend might send base64 string directly
        console.log("Processing string format audio");
        try {
          const base64Data = audioData.replace("data:audio/mpeg;base64,", "");
          byteArray = Array.from(atob(base64Data), (c) => c.charCodeAt(0));
        } catch (error) {
          console.error("Failed to process base64 audio:", error);
          return;
        }
      } else if (audioData?.audio) {
        // Backend might send { audio: "base64string" }
        console.log("Processing backend audio format");
        try {
          const base64Data = audioData.audio.replace("data:audio/mpeg;base64,", "");
          byteArray = Array.from(atob(base64Data), (c) => c.charCodeAt(0));
        } catch (error) {
          console.error("Failed to process backend audio:", error);
          return;
        }
      } else {
        console.log("Unknown audio format:", typeof audioData, audioData);
        // Try to handle it as a direct base64 string if it's a string
        if (typeof audioData === 'string' && audioData.includes('data:audio')) {
          console.log("Attempting to process as direct base64 string");
          try {
            const base64Data = audioData.replace("data:audio/mpeg;base64,", "");
            byteArray = Array.from(atob(base64Data), (c) => c.charCodeAt(0));
          } catch (error) {
            console.error("Failed to process direct base64 string:", error);
          }
        }
      }

      if (!byteArray) {
        console.warn("Could not extract audio data from:", audioData);
        return;
      }

      try {
        const audioBuffer = new Uint8Array(byteArray);
        const mimeType = audioData.contentType || "audio/mpeg";
        const audioBlob = new Blob([audioBuffer], { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);

        const newAudio = new Audio(audioUrl);

        // Respect mute state
        newAudio.muted = isMuted;
        console.log(`Created new audio object, muted: ${isMuted}`);

        setAudioObject(newAudio);
        setCurrentlyPlaying(messageIndex);
        currentAudioRef.current = newAudio;

        // Play audio if user has interacted, otherwise just prepare it for manual play
        if (hasUserInteracted) {
          console.log(`Playing audio immediately - hasUserInteracted: ${hasUserInteracted}, messageIndex: ${messageIndex}`);
          console.log(`Audio object created for message ${messageIndex}, current ref:`, currentAudioRef.current);
          const playPromise = newAudio.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Audio playback started successfully");
                // Ensure mute state is applied after play starts
                newAudio.muted = isMuted;
                console.log(`Applied mute state ${isMuted} after play started`);
              })
              .catch((err) => {
                if (err.name === 'NotAllowedError') {
                  console.log("Audio playback blocked by autoplay policy. User interaction required.");
                  // Don't reset state - audio is ready for manual play
                } else {
                  console.error("Audio play failed", err);
                  // Reset state if play fails for other reasons
                  setCurrentlyPlaying(null);
                  setAudioObject(null);
                }
              });
          }
        } else {
          console.log("Audio prepared but not playing - waiting for user interaction");
        }

        newAudio.onended = () => {
          setCurrentlyPlaying(null);
          setAudioObject(null);
          currentAudioRef.current = null;
          URL.revokeObjectURL(audioUrl);
        };
      } catch (error) {
        console.error("Error processing audio:", error);
      }
    },
    [audioObject, currentlyPlaying, isMuted, hasUserInteracted]
  );

  const stopAudio = useCallback(() => {
    console.log("stopAudio called, audioObject exists:", !!audioObject, "currentlyPlaying:", currentlyPlaying);
    const audioToStop = currentAudioRef.current || audioObject;
    if (audioToStop && currentlyPlaying !== null) {
      console.log("Stopping currently playing audio");
      audioToStop.pause();
      URL.revokeObjectURL(audioToStop.src);
      setAudioObject(null);
      setCurrentlyPlaying(null);
      currentAudioRef.current = null;
      console.log("Audio stopped manually");
    } else {
      console.log("No audio currently playing to stop");
    }
  }, [audioObject, currentlyPlaying]);

  const toggleMuteForCurrentAudio = useCallback((newMutedState) => {
    console.log("toggleMuteForCurrentAudio called, audioObject exists:", !!audioObject, "currentlyPlaying:", currentlyPlaying);
    const audioToMute = currentAudioRef.current || audioObject;
    if (audioToMute && currentlyPlaying !== null) {
      // Set the audio's muted state to the provided value
      audioToMute.muted = newMutedState;
      console.log(`Currently playing audio muted state set to: ${newMutedState}`);
    } else {
      console.log("No audio currently playing to mute/unmute");
    }
  }, [audioObject, currentlyPlaying]);

  // Apply mute state to currently playing audio when mute state changes
  useEffect(() => {
    const audioToUpdate = currentAudioRef.current || audioObject;
    if (audioToUpdate && currentlyPlaying !== null) {
      console.log(`Applying mute state ${isMuted} to currently playing audio (message ${currentlyPlaying})`);
      audioToUpdate.muted = isMuted;
    } else {
      console.log(`Audio muted state is: ${isMuted}, but no audio currently playing`);
    }
  }, [isMuted, audioObject, currentlyPlaying]);

  return { playAudio, stopAudio, currentlyPlaying, audioObject, toggleMuteForCurrentAudio };
};
