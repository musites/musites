import { Flex, Section } from 'infrastry'
import { GameMode, Question, QuestionWithChoices } from 'musites'
import React, { useCallback, useState } from 'react'
import { MusitesPlayer } from './MusitesPlayer'

export interface MusitesGameProps {
  baseUrl: string
  name: string
  mode: GameMode
  questions: Question[] | QuestionWithChoices[]
  onAnswer: (id: number, title: string) => void
  onSubmit: () => void
}

export const MusitesGame: React.FC<MusitesGameProps> = (
  props: MusitesGameProps
) => {
  // Total count of questions. Constant.
  const [total] = useState<number>(props.questions.length)
  // Question index.
  const [index, setIndex] = useState<number>(0)

  const onClick = useCallback(
    (answer) => {
      props.onAnswer(index + 1, answer)
      if (index + 1 === total) props.onSubmit()
      else setIndex((x) => x + 1)
    },
    // total and props are constant
    [index, props, total]
  )

  const question = props.questions[index]
  let questionView: JSX.Element

  switch (props.mode) {
    case 'choice':
      questionView = (
        <Flex className="inf-flex-column musites-section-set-list">
          {(question as QuestionWithChoices).choices.map((x) => (
            <button
              className="musites-button"
              key={x}
              onClick={() => onClick(x)}
            >
              {x}
            </button>
          ))}
        </Flex>
      )
      break
    case 'fill':
      questionView = <Flex />
      break
  }

  return (
    <Section className="inf-flex-column inf-align-center inf-t-align-center musites-section musites-section-index">
      <p>
        <span className="inf-s-ll">Test how much you know about </span>
        <span className="inf-s-ll inf-c-acc-d">{props.name}</span>
      </p>
      {questionView}
      <MusitesPlayer src={props.baseUrl + question.source} />
    </Section>
  )
}
