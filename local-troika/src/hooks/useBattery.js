import { useState, useEffect } from "react";

export const useBattery = () => {
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(false);

  useEffect(() => {
    const getBatteryInfo = async () => {
      try {
        if ("getBattery" in navigator) {
          const battery = await navigator.getBattery();
          setBatteryLevel(Math.round(battery.level * 100));
          setIsCharging(battery.charging);

          // Listen for battery changes
          battery.addEventListener("levelchange", () => {
            setBatteryLevel(Math.round(battery.level * 100));
          });

          battery.addEventListener("chargingchange", () => {
            setIsCharging(battery.charging);
          });
        } else {
          // Fallback: simulate battery level for browsers that don't support Battery API
          const simulateBattery = () => {
            const randomLevel = Math.floor(Math.random() * 40) + 60; // 60-100%
            setBatteryLevel(randomLevel);
            setIsCharging(Math.random() > 0.7); // 30% chance of charging
          };
          simulateBattery();

          // Update simulation occasionally
          const interval = setInterval(simulateBattery, 30000); // Every 30 seconds
          return () => clearInterval(interval);
        }
      } catch (error) {
        console.log("Battery API not supported, using fallback");
        // Fallback for unsupported browsers
        setBatteryLevel(Math.floor(Math.random() * 40) + 60);
        setIsCharging(Math.random() > 0.7);
      }
    };

    getBatteryInfo();
  }, []);

  return { batteryLevel, isCharging };
};
