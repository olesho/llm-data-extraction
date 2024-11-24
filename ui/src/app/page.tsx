"use client"

import { useState } from "react"
import { LanguageSelector } from "./language-selector"
import { LanguageExerciseQuiz } from "./language-exercise-quiz"
import { getQuestionsByLanguage } from "./questions"

export default function Page() {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language)
  }

  return (
    <main className="container mx-auto p-4">
<h1 className="text-3xl font-bold mb-6 text-center">Language Learning Quiz</h1>
      {!selectedLanguage ? (
        <LanguageSelector onSelectLanguage={handleLanguageSelect} />
      ) : (
        <LanguageExerciseQuiz 
          questions={getQuestionsByLanguage(selectedLanguage)} 
          language={selectedLanguage} 
        />
      )}
    </main>
  )
}

