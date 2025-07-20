import React from "react";
import { FlagIcon, SpeakerWaveIcon } from "@heroicons/react/24/outline";
import SpeechFeature from "../SpeechFeature.js";

const Question = ({ questionData, selectedAnswer, onAnswerSelect }) => {
  const [speaking, setSpeaking] = React.useState(false);
  const speechRef = React.useRef(null);

  const toggleSpeak = () => {
    if (speechRef.current) {
      setSpeaking(!speaking);
      if (!speaking) {
        speechRef.current.speak(questionData.question);
      } else {
        speechRef.current.cancel();
      }
    }
  };

  const reportQuestion = () => {
    fetch(process.env.REACT_APP_API_URL + "/report_question", {
      method: "PUT",
      body: JSON.stringify({
        question_id: questionData.question_id,
        question_title: questionData.question
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    })
    .then(res => res.json())
    .then((res) => {
      console.log(res);
      alert("Thank you for reporting this question. Our team will review it.");
    })
    .catch(err => {
      console.error("Error reporting question:", err);
    });
  };

  // For MCQ questions
  if (questionData.question_type === "mcq") {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-semibold text-gray-800">{questionData.question}</h3>
            <button 
              onClick={toggleSpeak}
              className={`p-2 rounded-full ${speaking ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} hover:bg-blue-100 hover:text-blue-600 transition-colors`}
              aria-label="Listen to question"
              title="Listen to question"
            >
              <SpeakerWaveIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="h-1 w-20 bg-blue-500 mt-2"></div>
        </div>

        <div className="space-y-3">
          {questionData.options.map((option, index) => {
            const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
            const letter = optionLetters[index];
            
            return (
              <button
                key={index}
                onClick={() => onAnswerSelect(option)}
                className={`w-full p-4 border-2 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all duration-200 
                  ${selectedAnswer === option 
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
              >
                <div className="flex items-center">
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 font-medium mr-3">{letter}</span>
                  <span className="text-gray-800">{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={reportQuestion}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 py-2 px-3 rounded-md hover:bg-gray-100 transition-colors"
          >
            <FlagIcon className="h-4 w-4 mr-1.5" />
            Report an issue with this question
          </button>
        </div>
        
        <SpeechFeature 
          text={questionData.question} 
          key={questionData.question_id} 
          ref={speechRef} 
        />
      </div>
    );
  }
  
  // Handle other question types here (can be expanded in the future)
  return (
    <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
      <p className="text-yellow-700">
        This question type ({questionData.question_type}) is not supported yet.
      </p>
    </div>
  );
};

export default Question;