import { useState, useCallback, useRef, useEffect } from "react";

export const useAudio = (isMuted) => {
  const [audioObject, setAudioObject] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  const playAudio = useCallback(
    (audioData, messageIndex) => {
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

        // Respect mute state
        newAudio.muted = isMuted;

        setAudioObject(newAudio);
        setCurrentlyPlaying(messageIndex);

        // Try to play audio (will work when user clicks play button)
        const playPromise = newAudio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio playback started successfully");
            })
            .catch((err) => {
              if (err.name === 'NotAllowedError') {
                console.log("Audio playback blocked by autoplay policy. User interaction required.");
                // Don't show error to user, just log it
              } else {
                console.error("Audio play failed", err);
              }
            });
        }

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

  return { playAudio, currentlyPlaying, audioObject };
};
