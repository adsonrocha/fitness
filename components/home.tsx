'use client'

import { extractWeekOptions, getPEColor, getPEDescription } from "@/lib/utils"
import { Calendar, ChevronLeft, ChevronRight, Dumbbell, Target } from "lucide-react"
import { useState } from "react"
import treinoData from '../data/treino.json'
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

export default function HomeComponent() {
  const [currentDayIndex, setCurrentDayIndex] = useState(0)
  const [currentWeek, setCurrentWeek] = useState<string>('1e5')
  const [selectedWeekNumber, setSelectedWeekNumber] = useState(1)

  const weekOptions = extractWeekOptions(treinoData)

  const currentDay = treinoData[currentDayIndex]

  const handlePreviousDay = () => {
    setCurrentDayIndex((prev) => (prev > 0 ? prev - 1 : treinoData.length - 1))
  }

  const handleNextDay = () => {
    setCurrentDayIndex((prev) => (prev < treinoData.length - 1 ? prev + 1 : 0))
  }

  const handleWeekChange = (weekValue: string) => {
    setCurrentWeek(weekValue)
    const weekOption = weekOptions.find(w => w.value === weekValue)
    setSelectedWeekNumber(weekOption?.number || 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Dumbbell className="text-blue-600" />
            Treinos
          </h1>
          <p className="text-gray-600 text-lg">Adson Rocha - Programa de 8 Semanas</p>
        </div>

        {/* Week Selector */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="text-blue-600" />
              Seleção de Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Select value={currentWeek} onValueChange={handleWeekChange}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Selecione a semana" />
                </SelectTrigger>
                <SelectContent>
                  {weekOptions.map((week) => (
                    <SelectItem key={week.value} value={week.value}>
                      {week.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                {weekOptions.map((week) => (
                  <Button
                    key={week.value}
                    variant={currentWeek === week.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleWeekChange(week.value as string)}
                    className="w-12 h-12"
                  >
                    {week.number}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Day Navigation */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handlePreviousDay}
                className="flex items-center gap-2 hover:bg-blue-50"
              >
                <ChevronLeft className="w-5 h-5" />
                Anterior
              </Button>

              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  {currentDay.day}
                </h2>
                <p className="text-gray-600">
                  Dia {currentDayIndex + 1} de {treinoData.length}
                </p>
              </div>

              <Button
                variant="outline"
                size="lg"
                onClick={handleNextDay}
                className="flex items-center gap-2 hover:bg-blue-50"
              >
                Próximo
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* Exercises */}
        <div className="space-y-4">
          {currentDay.exercises.map((exercise, index) => {
            const weekData = exercise.weeks[currentWeek as keyof typeof exercise.weeks]
            const peMatch = weekData.match(/PE(\d)/)
            const pe = peMatch ? `PE${peMatch[1]}` : 'PE3'

            return (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <Target className="text-blue-600 w-5 h-5" />
                    <CardTitle className="font-semibold text-gray-800 flex-1">
                      <span className={`${exercise.name.length > 30 ? 'text-sm' : 'text-lg'}`}>{exercise.name}</span>
                    </CardTitle>
                    <Badge
                      className={`${getPEColor(weekData)} text-white font-medium`}
                      title={getPEDescription(pe)}
                    >
                      {pe}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 font-medium mb-2">
                      Semana {selectedWeekNumber}:
                    </p>
                    <p className="text-gray-800 text-lg">
                      {weekData}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Legend */}
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Legenda de Intensidade (PE)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-500 text-white">PE3</Badge>
                <span className="text-sm text-gray-600">Moderado (1 rep na reserva)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-500 text-white">PE4</Badge>
                <span className="text-sm text-gray-600">Intenso (Falha completa)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-red-500 text-white">PE5</Badge>
                <span className="text-sm text-gray-600">Máximo (Falha parcial)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>Sistema desenvolvido para acompanhamento de treinos</p>
        </div>
      </div>
    </div>
  )
}