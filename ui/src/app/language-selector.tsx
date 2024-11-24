"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { questions } from "./questions"

interface LanguageSelectorProps {
  onSelectLanguage: (language: string) => void
}

// const languages = [
//   { code: "es", name: "Español" },
//   { code: "fr", name: "Français" },
//   { code: "de", name: "Deutsch" },
// ]

// const languages = [
//   { code: "es", name: "Spanish" },
//   { code: "fr", name: "French" },
//   { code: "de", name: "Germany" }
// ]

export function LanguageSelector({ onSelectLanguage }: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("")

  const handleSubmit = () => {
    if (selectedLanguage) {
      onSelectLanguage(selectedLanguage)
    }
  }

  const getLanguages = () => {
    const langs = [...new Set(questions.exercises.map(x => x.language))];
    console.log("langs = ", langs);
    return langs;
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

