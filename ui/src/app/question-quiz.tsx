"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Timer } from 'lucide-react'

interface Question {
  case: string
  language: string
  pronoun: string
  sentence: string
  masked_sentence: string
  answer: string
  answer_suggestions: string[]
  tense: string
}

interface SpanishExerciseQuizProps {
  questions: Question[]
}

const QUESTION_TIME_LIMIT = 30 // Time limit for each question in seconds

export default function SpanishExerciseQuiz({ questions }: SpanishExerciseQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT)

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentQuestionIndex])

  const handleSubmit = () => {
    setShowFeedback(true)
    if (selectedAnswer === currentQuestion.answer) {
      setScore(score + 1)
    }
  }

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      setQuizCompleted(true)
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer("")
      setShowFeedback(false)
      setTimeLeft(QUESTION_TIME_LIMIT)
    }
  }

  const isCorrect = selectedAnswer === currentQuestion.answer

  if (quizCompleted) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>¡Quiz Completado!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-center mb-4">
            Tu Puntuación: {score} / {questions.length}
          </p>
          <Progress value={(score / questions.length) * 100} className="w-full" />
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()} className="w-full">
            Reiniciar Quiz
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Ejercicio de Español: {currentQuestion.case}</CardTitle>
        <CardDescription>
          Pregunta {currentQuestionIndex + 1} de {questions.length} | 
          Pronombre: {currentQuestion.pronoun} | Tiempo: {currentQuestion.tense}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Progress value={progress} className="w-2/3" />
            <div className="flex items-center">
              <Timer className="mr-2" />
              <span>{timeLeft}s</span>
            </div>
          </div>
          <div className="text-lg font-medium text-center" aria-label="Completa la frase">
            {currentQuestion.masked_sentence.split('_').map((part, index, array) => (
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
            {currentQuestion.answer_suggestions.map((suggestion) => (
              <div key={suggestion} className="flex items-center space-x-2">
                <RadioGroupItem value={suggestion} id={suggestion} />
                <Label htmlFor={suggestion}>{suggestion}</Label>
              </div>
            ))}
          </RadioGroup>
          <Button onClick={handleSubmit} className="w-full" disabled={!selectedAnswer || showFeedback}>
            Enviar Respuesta
          </Button>
          {showFeedback && (
            <div className={`flex items-center justify-center p-4 rounded-md ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
              {isCorrect ? (
                <>
                  <CheckCircle className="text-green-600 mr-2" />
                  <span className="text-green-600">¡Correcto! ¡Bien hecho!</span>
                </>
              ) : (
                <>
                  <XCircle className="text-red-600 mr-2" />
                  <span className="text-red-600">Incorrecto. La respuesta correcta es &quot;{currentQuestion.answer}&quot;.</span>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {showFeedback && (
          <Button onClick={handleNextQuestion} className="w-full">
            {isLastQuestion ? "Finalizar Quiz" : "Siguiente Pregunta"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

