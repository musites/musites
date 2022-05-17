import { Button, Section } from 'infrastry'
import React from 'react'

export interface MusitesIndexProps {
  name: string
  onChooseSet: () => void
}

export const MusitesIndex: React.FC<MusitesIndexProps> = (
  props: MusitesIndexProps
) => {
  return (
    <Section className="inf-flex-column inf-justify-center inf-align-center inf-t-align-center musites-section musites-section-index">
      <p className="inf-s-lll">Test how much you know about</p>
      <p className="inf-c-acc-d inf-w-b musites-section-index-name">
        {props.name}
      </p>
      <Button onClick={props.onChooseSet}>START!</Button>
    </Section>
  )
}
