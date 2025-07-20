import React, { useEffect, useState } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";

const Timer = ({ initialTime, onTimeUpdate, onTimeExpired }) => {
  const [timeLeft, setTimeLeft] = useState(100);
  const [isRunning, setIsRunning] = useState(true);
  const [blinkingActive, setBlinkingActive] = useState(false);
  console.log("time left ", timeLeft);
  
  useEffect(() => {
    if (!isRunning) return;

    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;
        
        // Update parent component with remaining time
        if (onTimeUpdate) {
          onTimeUpdate(newTime);
        }
        
        // Check if timer expired
        if (newTime <= 0) {
          clearInterval(timerInterval);
          if (onTimeExpired) {
            onTimeExpired();
          }
          return 0;
        }
        
        // Start blinking when less than 30 seconds is left
        if (newTime < 30 && !blinkingActive) {
          setBlinkingActive(true);
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isRunning, onTimeUpdate, onTimeExpired, blinkingActive]);

  // Set time to initial value if it changes
  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Pause/resume timer
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  // Determine styling based on time remaining
  const getTimerStyles = () => {
    if (timeLeft < 10) {
      return {
        textColor: 'text-red-600',
        bgColor: 'bg-red-500',
        ringColor: 'ring-red-100',
        statusText: 'Time almost up!',
        statusBg: 'bg-red-100 text-red-800'
      };
    } else if (timeLeft < 30) {
      return {
        textColor: 'text-amber-600',
        bgColor: 'bg-amber-500',
        ringColor: 'ring-amber-100',
        statusText: 'Hurry up!',
        statusBg: 'bg-amber-100 text-amber-800'
      };
    } else {
      return {
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-500',
        ringColor: 'ring-blue-100',
        statusText: '',
        statusBg: ''
      };
    }
  };

  const styles = getTimerStyles();
  const pulseClass = blinkingActive ? 'animate-pulse' : '';
  
  return (
    <div className={`inline-flex items-center px-4 py-2 rounded-full ${styles.ringColor} ring-1 shadow-sm`}>
      <div className={`flex items-center ${styles.textColor} ${pulseClass} font-mono text-xl font-bold`}>
        <ClockIcon className="h-5 w-5 mr-1.5" />
        <span>{formatTime(timeLeft)}</span>
      </div>
      
      {styles.statusText && (
        <div className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${styles.statusBg}`}>
          {styles.statusText}
        </div>
      )}
      
      {!isRunning && (
        <div className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          Paused
        </div>
      )}
      
      <button
        onClick={toggleTimer}
        className="ml-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
        title={isRunning ? "Pause timer" : "Resume timer"}
      >
        {isRunning ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default Timer;