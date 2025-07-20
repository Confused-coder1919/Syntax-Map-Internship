import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  PlusIcon,
  SpeakerWaveIcon,
} from "@heroicons/react/24/outline";

const VocabularyPopup = ({
  word,
  onClose,
  onSave,
  position,
  wordExists = false,
}) => {
  const [wordData, setWordData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchWordDefinition = async () => {
      try {
        setLoading(true);

        // First try the free dictionary API
        try {
          const response = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
              word
            )}`
          );

          if (response.ok) {
            const data = await response.json();
            setWordData(data[0]);
            setLoading(false);
            return;
          }
        } catch (freeApiError) {
          console.error("Free dictionary API error:", freeApiError);
          // Continue to fallback
        }

        // Fallback to our backend dictionary API
        try {
          const backendUrl =
            process.env.REACT_APP_API_URL || "http://localhost:3001";
          const response = await fetch(
            `${backendUrl}/dictionnary/definition/${encodeURIComponent(word)}`,
            {
              headers: {
                Authorization: localStorage.getItem("jstoken") || "",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            // Transform backend API response to match the free API format
            const transformedData = {
              word: data.word,
              phonetic: data.pronunciation || "",
              phonetics: data.pronunciation
                ? [{ audio: data.pronunciation }]
                : [],
              meanings: [
                {
                  partOfSpeech: data.part_of_speech || "unknown",
                  definitions: [
                    {
                      definition: data.definition || "No definition available",
                      example: data.example || "",
                    },
                  ],
                  synonyms: data.synonyms || [],
                },
              ],
            };
            setWordData(transformedData);
            setLoading(false);
            return;
          }
        } catch (backendError) {
          console.error("Backend dictionary API error:", backendError);
          // Continue to error state
        }

        throw new Error("Word not found in any dictionary source");
      } catch (err) {
        console.error("Error fetching word definition:", err);
        setError(err.message || "Failed to fetch definition");
        setLoading(false);
      }
    };

    if (word) {
      fetchWordDefinition();
    }
  }, [word]);

  const handlePlayAudio = () => {
    if (!wordData || !wordData.phonetics) return;

    // Find the first available audio
    const phoneticWithAudio = wordData.phonetics.find((p) => p.audio);
    if (phoneticWithAudio && phoneticWithAudio.audio) {
      const audio = new Audio(phoneticWithAudio.audio);
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
  };

  const handleSaveWord = () => {
    if (!wordData) return;

    const wordToSave = {
      word: wordData.word,
      definition:
        wordData.meanings && wordData.meanings[0]
          ? wordData.meanings[0].definitions[0].definition
          : "No definition available",
      part_of_speech:
        wordData.meanings && wordData.meanings[0]
          ? wordData.meanings[0].partOfSpeech
          : null,
      pronunciation:
        wordData.phonetics && wordData.phonetics.find((p) => p.audio)
          ? wordData.phonetics.find((p) => p.audio).audio
          : null,
      learned: false,
      date: new Date().toISOString(),
    };

    onSave(wordToSave);
  };
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      ></div>{" "}
      <div
        className="bg-white rounded-lg shadow-xl absolute"
        style={{
          top: position ? `${position.y}px` : "50%",
          left: position ? `${position.x}px` : "50%",
          transform: position ? "none" : "translate(-50%, -50%)",
          maxWidth: "450px",
          width: "95%",
          maxHeight: "80vh",
          overflowY: "auto", // allow scrolling if content exceeds height
        }}
      >
        <div className="flex justify-between items-center bg-gray-50 px-4 py-3 border-b sticky top-0">
          <h3 className="text-lg font-medium text-gray-900">
            Vocabulary Lookup
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <p className="text-red-500 mb-2">Word not found</p>
              <p className="text-gray-500 text-sm">
                Try a different word or check your spelling
              </p>
            </div>
          ) : wordData ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">
                    {wordData.word}
                  </h4>
                  {wordData.phonetic && (
                    <p className="text-gray-600 text-sm">{wordData.phonetic}</p>
                  )}
                </div>

                {wordData.phonetics &&
                  wordData.phonetics.some((p) => p.audio) && (
                    <button
                      onClick={handlePlayAudio}
                      className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                      title="Listen to pronunciation"
                    >
                      <SpeakerWaveIcon className="h-5 w-5" />
                    </button>
                  )}
              </div>

              <div className="space-y-4">
                {wordData.meanings &&
                  wordData.meanings.map((meaning, index) => (
                    <div key={index} className="border-t pt-3">
                      <div className="mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {meaning.partOfSpeech}
                        </span>
                      </div>

                      <ul className="space-y-2">
                        {meaning.definitions.slice(0, 2).map((def, idx) => (
                          <li key={idx} className="text-sm">
                            <p className="text-gray-800">{def.definition}</p>
                            {def.example && (
                              <p className="text-gray-500 text-xs mt-1 italic">
                                "{def.example}"
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>

                      {meaning.synonyms && meaning.synonyms.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            Synonyms: {meaning.synonyms.slice(0, 5).join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ) : null}
        </div>{" "}
        <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
          {wordExists && (
            <span className="text-sm text-green-600 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Already in your vocabulary
            </span>
          )}

          <button
            onClick={handleSaveWord}
            disabled={loading || error || !wordData || wordExists}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              wordExists
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
            } disabled:bg-gray-300 disabled:cursor-not-allowed`}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            {wordExists ? "Already Added" : "Add to My Vocabulary"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VocabularyPopup;
