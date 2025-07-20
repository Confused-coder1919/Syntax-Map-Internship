import React, { useState, useEffect, useContext } from "react";
import { VocabularyContext } from "../Contexts/VocabularyContext";
import VocabularyPopup from "./PageNotePad/VocabularyPopup";

const VocabularyLookupWrapper = ({ children }) => {
  const [selectedWord, setSelectedWord] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [wordExists, setWordExists] = useState(false);
  const { saveWordToNotepad, isWordInVocabulary } =
    useContext(VocabularyContext);

  useEffect(() => {
    // Only add the event listener if the user is a student (role 3) or guest (role 4)
    if (
      localStorage.getItem("user_role") == 3 ||
      localStorage.getItem("user_role") == 4
    ) {
      document.addEventListener("dblclick", handleDoubleClick);

      return () => {
        document.removeEventListener("dblclick", handleDoubleClick);
      };
    }
  }, [localStorage.getItem("user_role")]);

  const handleDoubleClick = (event) => {
    // Don't capture double-clicks in input fields, textareas, etc.
    if (
      event.target.tagName.toLowerCase() === "input" ||
      event.target.tagName.toLowerCase() === "textarea" ||
      event.target.isContentEditable ||
      event.target.closest(".vocabulary-popup") // Don't trigger inside popup itself
    ) {
      return;
    }
    // Get selected text
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    // Only proceed if there's actual text selected
    if (selectedText && selectedText.length > 0) {
      // Simple word extraction - get first word if multiple words are selected
      const word = selectedText
        .split(/\s+/)[0]
        .toLowerCase()
        .replace(/[^\w-]/g, "");
      if (word && word.length > 0) {
        setSelectedWord(word);
        setShowPopup(true);

        // Check if word already exists in vocabulary
        const exists = isWordInVocabulary(word);
        setWordExists(exists);

        // Calculate position for popup (near mouse but not directly under it)
        const x = Math.min(
          event.clientX - 50,
          window.innerWidth - 500 // Ensure popup doesn't go off screen
        );
        const y = Math.min(
          event.clientY + 10,
          window.innerHeight - 550 // Ensure popup doesn't go off screen
        );

        setPosition({ x, y });

        // Prevent default actions and stop propagation
        event.preventDefault();
        event.stopPropagation();
      }
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedWord(null);
  };

  const saveWord = async (wordData) => {
    try {
      const saved = await saveWordToNotepad(
        wordData.word,
        wordData.definition,
        wordData.part_of_speech,
        wordData.pronunciation
      );

      if (saved) {
        // Show successful save notification (optional)
        console.log(`Word "${wordData.word}" added to vocabulary`);
      }

      // Close popup after saving
      closePopup();
    } catch (error) {
      console.error("Error saving word:", error);
    }
  };

  return (
    <>
      {children}{" "}
      {showPopup && selectedWord && (
        <VocabularyPopup
          word={selectedWord}
          onClose={closePopup}
          onSave={saveWord}
          position={position}
          wordExists={wordExists}
        />
      )}
    </>
  );
};

export default VocabularyLookupWrapper;
