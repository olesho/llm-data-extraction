"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import questions from "./language_exercises.json"

interface LanguageSelectorProps {
  onSelectLanguage: (language: string) => void
}

export function LanguageSelector({ onSelectLanguage }: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("")

  const handleSubmit = () => {
    if (selectedLanguage) {
      onSelectLanguage(selectedLanguage)
    }
  }

  const getLanguages = () => {
    return [...new Set(questions.exercises.map(x => x.language))];
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Select a Language</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedLanguage}
          onValueChange={setSelectedLanguage}
          className="flex flex-col space-y-2"
        >
          {getLanguages().map((lang) => (
            <div key={lang} className="flex items-center space-x-2">
              <RadioGroupItem value={lang} id={lang} />
              <Label htmlFor={lang}>{lang}</Label>
            </div>
          ))}
        </RadioGroup>
        <Button onClick={handleSubmit} className="w-full mt-4" disabled={!selectedLanguage}>
          Start Quiz
        </Button>
      </CardContent>
    </Card>
  )
}

