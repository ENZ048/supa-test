// Function to get time-based greeting messages
export function getTimeBasedGreeting() {
  const now = new Date();
  const hour = now.getHours();

  const morningGreetings = [
    "☀️ Good morning! Ready to kickstart your business today?",
    "Morning! A fresh day = fresh ideas. What can I solve for you?",
    "Rise & shine—let's make your business smarter today.",
  ];

  const afternoonGreetings = [
    "Hey 👋 Hope your day's going well! Need a quick business boost?",
    "Welcome! Perfect time for a smart solution—shall we start?",
    "Good afternoon! Tell me what's bugging you, I'll fix it fast.",
  ];

  const eveningGreetings = [
    "Evenings are for smart moves ✨ What's on your mind?",
    "Hey! Don't worry if it's late—business doesn't sleep, and neither do I.",
    "Good evening! Ready to make your next big business move?",
  ];

  const lateNightGreetings = [
    "🌙 Burning the midnight oil? I'm here to help.",
    "You're up late, and so am I. Let's get things done.",
    "Insomniac or hustler? Either way—I've got your back.",
  ];

  let selectedGreetings;

  if (hour >= 6 && hour < 12) {
    // Morning (6 AM – 11 AM)
    selectedGreetings = morningGreetings;
  } else if (hour >= 12 && hour < 18) {
    // Afternoon (12 PM – 5 PM)
    selectedGreetings = afternoonGreetings;
  } else if (hour >= 18 && hour < 24) {
    // Evening/Night (6 PM – 11 PM)
    selectedGreetings = eveningGreetings;
  } else {
    // Late Night (12 AM – 5 AM)
    selectedGreetings = lateNightGreetings;
  }

  // Return a random greeting from the selected time period
  return selectedGreetings[
    Math.floor(Math.random() * selectedGreetings.length)
  ];
}
