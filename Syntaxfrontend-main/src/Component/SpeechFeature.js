import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import "../css/speechFeature.css";
import { HiMiniSpeakerWave } from "react-icons/hi2";
import { FaRegCircleStop } from "react-icons/fa6";

const SpeechFeature = forwardRef((props, ref) => {
  const [rate, setRate] = useState(1);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  const msgRef = useRef(new SpeechSynthesisUtterance());

  // Make speak(text) & stop() available to parent via ref
  useImperativeHandle(ref, () => ({
    speak,
    stop: cancel,
  }));

  useEffect(() => {
    const fetchVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      setSelectedVoice(availableVoices[0] || null);
    };

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = fetchVoices;
    }

    fetchVoices();
    msgRef.current.rate = rate;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    msgRef.current.rate = rate;
  }, [rate]);

  useEffect(() => {
    msgRef.current.voice = selectedVoice;
  }, [selectedVoice]);

  // 👇 Accept text from parent
  const speak = (textToSpeak) => {
    const cleanedText = (textToSpeak || "").replace(/_+/g, "space");

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    msgRef.current.text = cleanedText;
    msgRef.current.voice = selectedVoice;
    window.speechSynthesis.speak(msgRef.current);
  };

  const cancel = () => {
    window.speechSynthesis.cancel();
  };

  const handleRateChange = (newRate) => {
    setRate(Math.max(0.1, Math.min(newRate, 10)));
  };

  const handleVoiceChange = (voiceName) => {
    const voice = voices.find((v) => v.name === voiceName);
    setSelectedVoice(voice);
  };

  return (
    <div className="flex flex-wrap items-center justify-between w-full gap-4 p-2 bg-gray-50 rounded-lg shadow">
      {/* Speak & Stop Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => speak(props.text)} // default speak
          className="px-2 text-sm py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          <HiMiniSpeakerWave />
        </button>
        <button
          onClick={cancel}
          className="px-2 text-sm py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          <FaRegCircleStop />
        </button>
      </div>

      {/* Rate Control */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleRateChange(rate - 0.25)}
          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          -
        </button>
        <span className="text-sm font-medium">Rate: {rate.toFixed(2)}</span>
        <button
          onClick={() => handleRateChange(rate + 0.25)}
          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          +
        </button>
      </div>

      {/* Voice Selector */}
      <div className="w-full">
        <label htmlFor="voices" className="text-sm font-medium mb-1">
          Select Voice:
        </label>
        <select
          id="voices"
          onChange={(e) => handleVoiceChange(e.target.value)}
          value={selectedVoice?.name || ""}
          className="px-2 py-1 border rounded-md w-full"
        >
          {voices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
});

export default SpeechFeature;
