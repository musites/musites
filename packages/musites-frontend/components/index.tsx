import {
  Database,
  DatabaseSet,
  Game,
  GameMode,
  GameOptions,
  Question,
  QuestionWithChoices,
  Result,
} from 'musites'
import React, { useCallback, useState } from 'react'
import { MusitesGame } from './MusitesGame'
import { MusitesIndex } from './MusitesIndex'
import { MusitesResult } from './MusitesResult'
import { MusitesSet } from './MusitesSet'

export interface MusitesProps {
  baseUrl: string
  data: Database
}

type State = 'index' | 'set' | 'game' | 'result'

export const Musites: React.FC<MusitesProps> = (props: MusitesProps) => {
  //#region States

  // Current view.
  const [state, setState] = useState<State>('index')

  // The constant Musites database.
  // Use lazy initial state.
  const [database] = useState<Database>(() => new Database(props.data))
  // The constant sets.
  // Use lazy initial state.
  const [sets] = useState<string[]>(() => database.sets.map((x) => x.name))

  // The Musites game.
  const [game, setGame] = useState<Game | null>(null)
  // Questions.
  const [questions, setQuestions] = useState<
    Question[] | QuestionWithChoices[] | null
  >(null)
  // Mode.
  const [mode, setMode] = useState<GameMode | null>(null)
  // Result.
  const [result, setResult] = useState<Result | null>(null)

  const createGame = useCallback(
    (set: string, options: GameOptions) => {
      const newGame = new Game(
        database.sets.find((x) => x.name === set) as DatabaseSet,
        options
      )
      setGame(newGame)
      setQuestions(newGame.getQuestions() as Question[] | QuestionWithChoices[])
      setMode(options.mode)
    },
    // In fact database.sets is constant
    [database.sets]
  )

  //#endregion

  //#region Handlers

  const onChooseSet = useCallback(() => setState('set'), [])
  const onStartGame = useCallback(
    (set: string, options: GameOptions) => {
      createGame(set, options)
      setState('game')
    },
    [createGame]
  )
  const onReplay = useCallback(() => setState('index'), [])
  const onAnswer = useCallback(
    (id: number, title: string) => game!.answer(id, title),
    [game]
  )
  const onSubmit = useCallback(() => {
    setResult(game!.submit())
    setState('result')
  }, [game])

  //#endregion

  //#region Render

  let child: JSX.Element

  switch (state) {
    case 'index':
      child = <MusitesIndex name={database.name} onChooseSet={onChooseSet} />
      break
    case 'set':
      child = (
        <MusitesSet sets={sets} onStartGame={onStartGame} onReplay={onReplay} />
      )
      break
    case 'game':
      child = (
        <MusitesGame
          baseUrl={props.baseUrl}
          name={database.name}
          mode={mode as GameMode}
          questions={questions as Question[] | QuestionWithChoices[]}
          onAnswer={onAnswer}
          onSubmit={onSubmit}
        />
      )
      break
    case 'result':
      child = (
        <MusitesResult
          name={database.name}
          result={result as Result}
          onReplay={onReplay}
        />
      )
      break
  }
  return child

  //#endregion
}
