import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
    * {
      font-family: "Hanken Grotesk", "Amaranth", "Poppins", sans-serif;
    }
  
    /* Cosmic Circle Pulse Animation */
  .cosmic-circle {
    position: relative;
    width: 200px;
    height: 200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .cosmic-core {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: radial-gradient(circle, #ffffff 0%, #60a5fa 30%, #a855f7 70%, transparent 100%);
    box-shadow: 
      0 0 20px #60a5fa,
      0 0 40px #a855f7,
      0 0 60px #ffffff,
      inset 0 0 20px rgba(255, 255, 255, 0.3);
    animation: core-glow 2s ease-in-out infinite alternate;
    z-index: 3;
  }
  
  .pulse-ring {
    position: absolute;
    border: 2px solid transparent;
    border-radius: 50%;
    animation: pulse-expand 3s ease-out infinite;
  }
  
  .pulse-ring-1 {
    width: 80px;
    height: 80px;
    border-color: rgba(96, 165, 250, 0.6);
    animation-delay: 0s;
  }
  
  .pulse-ring-2 {
    width: 120px;
    height: 120px;
    border-color: rgba(168, 85, 247, 0.4);
    animation-delay: 1s;
  }
  
  .pulse-ring-3 {
    width: 160px;
    height: 160px;
    border-color: rgba(255, 255, 255, 0.3);
    animation-delay: 2s;
  }
  
  @keyframes core-glow {
    0% {
      transform: scale(0.9);
      opacity: 0.8;
      box-shadow: 
        0 0 15px #60a5fa,
        0 0 30px #a855f7,
        0 0 45px #ffffff,
        inset 0 0 15px rgba(255, 255, 255, 0.2);
    }
    100% {
      transform: scale(1.1);
      opacity: 1;
      box-shadow: 
        0 0 25px #60a5fa,
        0 0 50px #a855f7,
        0 0 75px #ffffff,
        inset 0 0 25px rgba(255, 255, 255, 0.4);
    }
  }
  
  @keyframes pulse-expand {
    0% {
      transform: scale(0.5);
      opacity: 0.8;
    }
    50% {
      opacity: 0.4;
    }
    100% {
      transform: scale(1.2);
      opacity: 0;
    }
  }
  
  /* Mobile responsive adjustments */
  @media (max-width: 768px) {
    .cosmic-circle {
      width: 150px;
      height: 150px;
    }
    
    .cosmic-core {
      width: 30px;
      height: 30px;
    }
    
    .pulse-ring-1 {
      width: 60px;
      height: 60px;
    }
    
    .pulse-ring-2 {
      width: 90px;
      height: 90px;
    }
    
    .pulse-ring-3 {
      width: 120px;
      height: 120px;
    }
  }
  
  .cosmic-circle {
    will-change: transform;
  }
  
  .cosmic-core, .pulse-ring {
    will-change: transform, opacity;
  }
  
  `;

export default GlobalStyle;
