"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DIFFICULTY_LEVELS } from "@/lib/constants";
import type { ReadingSession } from "@/lib/types";

type Difficulty = ReadingSession["difficulty"];

export default function HomePage() {
  const [selected, setSelected] = useState<Difficulty>("intermediate");
  const router = useRouter();

  const handleStart = () => {
    router.push(`/read?difficulty=${selected}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full tracking-wide uppercase">
            ✦ EdAccelerator
          </span>
        </div>

        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">
            Reading Companion
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            Read a short passage, answer questions in your own words, and
            receive personal feedback from an AI tutor.
          </p>
        </div>

        {/* Difficulty selector */}
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500 mb-3">
            Choose Your Level
          </p>
          <div className="space-y-2">
            {DIFFICULTY_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => setSelected(level.value)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-150 ${
                  selected === level.value
                    ? "border-blue-500 bg-blue-50 text-blue-900"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="font-semibold text-sm">{level.label}</div>
                <div className="text-xs opacity-70 mt-0.5">
                  {level.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleStart}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3.5 rounded-xl transition-colors text-base"
        >
          Start Reading
        </button>
        <p className="text-center text-xs text-gray-400 mt-4">
          Takes About 10-15 Minutes · No Account Needed
        </p>
      </div>
    </main>
  );
}
