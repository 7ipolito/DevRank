export const loginStyles = `
  @keyframes glitch {
    0% { transform: translateX(0); }
    10% { transform: translateX(-2px) skew(-5deg); }
    20% { transform: translateX(2px) skew(5deg); }
    30% { transform: translateX(-1px) skew(-2deg); }
    40% { transform: translateX(1px) skew(2deg); }
    50% { transform: translateX(0) skew(0deg); }
    100% { transform: translateX(0); }
  }
  
  @keyframes fadeInUp {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .bot-text {
    animation: glitch 1.5s ease-in-out 1;
    display: inline-block;
    color: #EF4444;
    text-decoration: line-through;
  }
  
  .text-animate {
    opacity: 0;
    animation: fadeInUp 0.4s ease-out forwards;
    display: inline-block;
  }
  
  .text-animate-1 { animation-delay: 0.1s; }
  .text-animate-2 { animation-delay: 0.2s; }
  .text-animate-3 { animation-delay: 0.3s; }
  .text-animate-4 { animation-delay: 0.4s; }
  .text-animate-5 { animation-delay: 0.5s; }
  .text-animate-6 { animation-delay: 0.6s; }
  .text-animate-7 { animation-delay: 0.7s; }
`;
