import { Button, Section } from 'infrastry'
import { Result } from 'musites'
import React from 'react'

export interface MusitesResultProps {
  name: string
  result: Result
  onReplay: () => void
}

export const MusitesResult: React.FC<MusitesResultProps> = (
  props: MusitesResultProps
) => {
  return (
    <Section className="inf-flex-column inf-align-center inf-t-align-center musites-section musites-section-index">
      <p className="inf-s-lll">
        <span>Here's how much you know about</span>
        <br></br>
        <span className="inf-c-acc-d">{props.name}</span>
        <span>:</span>
      </p>
      <p className="musites-section-result-ranking inf-c-acc-dd">
        {props.result.ranking}
      </p>
      <p>
        <span>You got </span>
        <span className="inf-c-acc-d">{props.result.correct}</span>
        <span> out of </span>
        <span className="inf-c-acc-d">{props.result.total}</span>
        <span> questions right,</span>
        <br></br>
        <span className="inf-c-acc-d">
          {(props.result.accuracy * 100).toFixed(1)}
        </span>
        <span> % correct.</span>
      </p>
      <Button onClick={props.onReplay}>REPLAY</Button>
    </Section>
  )
}
