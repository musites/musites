import { Button, Flex, Section } from 'infrastry'
import { GameOptions } from 'musites'
import React from 'react'

export interface MusitesSetProps {
  sets: string[]
  onStartGame: (set: string, options: GameOptions) => void
  onReplay: () => void
}

export const MusitesSet: React.FC<MusitesSetProps> = (
  props: MusitesSetProps
) => {
  return (
    <Section className="inf-flex-column inf-justify-center inf-align-center musites-section musites-section-set">
      <p className="inf-s-ll musites-section-set-header">Choose a game set:</p>
      <Flex className="inf-flex-column musites-section-set-list">
        {props.sets.map((x) => (
          <button
            className="musites-button"
            key={x}
            onClick={() =>
              props.onStartGame(x, {
                choiceCount: 4,
                count: 10,
                mode: 'choice',
              })
            }
          >
            {x}
          </button>
        ))}
      </Flex>
      <Button onClick={props.onReplay}>BACK</Button>
    </Section>
  )
}
