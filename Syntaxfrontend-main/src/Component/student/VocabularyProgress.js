import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { API_BASE_URL } from "../../config";

const VocabularyProgress = ({ data }) => {
  const [vocabs, setVocabs] = useState({
    part_of_speech: 0,
    words: [],
  });
  const vocabPercentage =
    data?.vocabLearned && data?.totalVocab
      ? Math.round((data.vocabLearned / data.totalVocab) * 100)
      : 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/dictionnary/user`, {
          headers: {
            Authorization: localStorage.getItem("jstoken"),
          },
        });
        const data = res.data.dictionnary;
        const words = data.map((word) => word.word);
        const partOfSpeechCount = data.reduce((acc, item) => {
          const pos = item.part_of_speech;
          acc[pos] = (acc[pos] || 0) + 1;
          return acc;
        }, {});
        setVocabs({
          part_of_speech: partOfSpeechCount,
          words: words,
        });
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Vocab Stats */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-3xl font-bold text-gray-800">
            {data?.vocabLearned || 0} / {data?.totalVocab || 0}
          </div>
          <div className="text-sm text-gray-600">
            {data?.vocabLearned || 0} out of {data?.totalVocab || 0} words
            learned
          </div>
        </div>

        <div className="text-right">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-800 font-bold">
            {vocabPercentage}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div
          className="bg-indigo-600 h-2.5 rounded-full"
          style={{
            width: `${(data?.vocabLearned / data?.totalVocab) * 100 || 0}%`,
          }}
        ></div>
      </div>

      {/* Recently Added Words */}
      <div>
        <h4 className="text-xs uppercase font-semibold text-gray-500 mb-2">
          Recently Added Words
        </h4>
        <div className="space-y-1">
          {vocabs?.words.map((word, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-1 px-2 rounded hover:bg-gray-50"
            >
              <span className="text-sm text-gray-800">{word}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Links */}
      <div className="mt-4 flex justify-between">
        <Link
          to="/student/notepad/vocabulary"
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          View All Words
        </Link>

        <Link
          to="/student/notepad/vocabulary/add"
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
        >
          <PlusCircleIcon className="h-4 w-4 mr-1" />
          Add New
        </Link>
      </div>
    </div>
  );
};

export default VocabularyProgress;
