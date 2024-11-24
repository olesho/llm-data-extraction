"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from 'lucide-react'

const exerciseData = {
  case: "giving orders or instructions",
  language: "Spanish",
  pronoun: "yo",
  sentence: "No toques el botón rojo, por favor.",
  masked_sentence: "No _ el botón rojo, por favor.",
  answer: "toques",
  answer_suggestions: ["toques", "miras", "bebes"],
  tense: "presente"
}

export default function SpanishExercise() {
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)

  const handleSubmit = () => {
    setShowFeedback(true)
  }

  const isCorrect = selectedAnswer === exerciseData.answer

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Spanish Exercise: {exerciseData.case}</CardTitle>
        <CardDescription>
          Pronoun: {exerciseData.pronoun} | Tense: {exerciseData.tense}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-lg font-medium text-center" aria-label="Fill in the blank sentence">
            {exerciseData.masked_sentence.split('_').map((part, index, array) => (
              <span key={index}>
                {part}
                {index < array.length - 1 && (
                  <span className="underline underline-offset-4 mx-1" aria-hidden="true">
                    {selectedAnswer || '____'}
                  </span>
                )}
              </span>
            ))}
          </div>
          <RadioGroup
            value={selectedAnswer}
            onValueChange={setSelectedAnswer}
            className="flex flex-col space-y-2"
          >
            {exerciseData.answer_suggestions.map((suggestion) => (
              <div key={suggestion} className="flex items-center space-x-2">
                <RadioGroupItem value={suggestion} id={suggestion} />
                <Label htmlFor={suggestion}>{suggestion}</Label>
              </div>
            ))}
          </RadioGroup>
          <Button onClick={handleSubmit} className="w-full" disabled={!selectedAnswer || showFeedback}>
            {showFeedback ? "Submitted" : "Submit Answer"}
          </Button>
          {showFeedback && (
            <div className={`flex items-center justify-center p-4 rounded-md ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
              {isCorrect ? (
                <>
                  <CheckCircle className="text-green-600 mr-2" />
                  <span className="text-green-600">Correct! Well done!</span>
                </>
              ) : (
                <>
                  <XCircle className="text-red-600 mr-2" />
                  <span className="text-red-600">Incorrect. The correct answer is {exerciseData.answer}.</span>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

