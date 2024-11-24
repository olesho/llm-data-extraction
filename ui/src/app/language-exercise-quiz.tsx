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

interface LanguageExerciseQuizProps {
  questions: Question[]
  language: string
}

const QUESTION_TIME_LIMIT = 30 // Time limit for each question in seconds

export function LanguageExerciseQuiz({ questions, language }: LanguageExerciseQuizProps) {
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
          handleSubmit(selectedAnswer) //Added selectedAnswer here
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentQuestionIndex, selectedAnswer]) //Added selectedAnswer to dependency array

  const handleSubmit = (answer: string) => {
    if (showFeedback) return // Prevent multiple submissions
    setShowFeedback(true)
    if (answer === currentQuestion.answer) {
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

  const translations = {
    es: {
      quizCompleted: "¡Quiz Completado!",
      yourScore: "Tu Puntuación",
      restartQuiz: "Reiniciar Quiz",
      exercise: "Ejercicio de",
      question: "Pregunta",
      of: "de",
      pronoun: "Pronombre",
      tense: "Tiempo",
      submit: "Enviar Respuesta",
      correct: "¡Correcto! ¡Bien hecho!",
      incorrect: "Incorrecto. La respuesta correcta es",
      finishQuiz: "Finalizar Quiz",
      nextQuestion: "Siguiente Pregunta"
    },
    fr: {
      quizCompleted: "Quiz Terminé !",
      yourScore: "Votre Score",
      restartQuiz: "Recommencer le Quiz",
      exercise: "Exercice de",
      question: "Question",
      of: "sur",
      pronoun: "Pronom",
      tense: "Temps",
      submit: "Soumettre la Réponse",
      correct: "Correct ! Bien joué !",
      incorrect: "Incorrect. La bonne réponse est",
      finishQuiz: "Terminer le Quiz",
      nextQuestion: "Question Suivante"
    },
    de: {
      quizCompleted: "Quiz Abgeschlossen!",
      yourScore: "Ihr Ergebnis",
      restartQuiz: "Quiz Neustarten",
      exercise: "Übung in",
      question: "Frage",
      of: "von",
      pronoun: "Pronomen",
      tense: "Zeitform",
      submit: "Antwort Einreichen",
      correct: "Richtig! Gut gemacht!",
      incorrect: "Falsch. Die richtige Antwort ist",
      finishQuiz: "Quiz Beenden",
      nextQuestion: "Nächste Frage"
    },
    en: {
      quizCompleted: "Quiz Completed!",
      yourScore: "Your Score",
      restartQuiz: "Restart Quiz",
      exercise: "Exercise in",
      question: "Question",
      of: "of",
      pronoun: "Pronoun",
      tense: "Tense",
      submit: "Submit Answer",
      correct: "Correct! Well done!",
      incorrect: "Incorrect. The correct answer is",
      finishQuiz: "Finish Quiz",
      nextQuestion: "Next Question"
    }
  }

  //const t = translations[language as keyof typeof translations]
  const t = translations["en"]

  if (quizCompleted) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>{t.quizCompleted}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-center mb-4">
            {t.yourScore}: {score} / {questions.length}
          </p>
          <Progress value={(score / questions.length) * 100} className="w-full" />
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()} className="w-full">
            {t.restartQuiz}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{t.exercise} {language}: {currentQuestion.case}</CardTitle>
        <CardDescription>
          {t.question} {currentQuestionIndex + 1} {t.of} {questions.length} | 
          {t.pronoun}: {currentQuestion.pronoun} | {t.tense}: {currentQuestion.tense}
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
          <div className="text-lg font-medium text-center" aria-label="Complete the sentence">
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
            onValueChange={(value) => {
              setSelectedAnswer(value)
              handleSubmit(value)
            }}
            className="flex flex-col space-y-2"
          >
            {currentQuestion.answer_suggestions.map((suggestion) => (
              <div key={suggestion} className="flex items-center space-x-2">
                <RadioGroupItem value={suggestion} id={suggestion} />
                <Label htmlFor={suggestion}>{suggestion}</Label>
              </div>
            ))}
          </RadioGroup>
          {showFeedback && (
            <div className={`flex items-center justify-center p-4 rounded-md ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
              {isCorrect ? (
                <>
                  <CheckCircle className="text-green-600 mr-2" />
                  <span className="text-green-600">{t.correct}</span>
                </>
              ) : (
                <>
                  <XCircle className="text-red-600 mr-2" />
                  <span className="text-red-600">{t.incorrect} &quot;{currentQuestion.answer}&quot;.</span>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {showFeedback && (
          <Button onClick={handleNextQuestion} className="w-full">
            {isLastQuestion ? t.finishQuiz : t.nextQuestion}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}