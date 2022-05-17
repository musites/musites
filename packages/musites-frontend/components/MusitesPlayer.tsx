import { mdiPause, mdiPlay } from '@mdi/js'
import Icon from '@mdi/react'
import { Button, Flex } from 'infrastry'
import React, { useEffect, useState } from 'react'

export interface MusitesPlayerProps {
  src: string
}

export const MusitesPlayer: React.FC<MusitesPlayerProps> = (
  props: MusitesPlayerProps
) => {
  const [playing, toggle] = useAudio(props.src)

  return (
    <Flex align="center">
      <Button onClick={toggle}>
        {playing ? (
          <Icon path={mdiPause} size={1.2} />
        ) : (
          <Icon path={mdiPlay} size={1.2} />
        )}
      </Button>
    </Flex>
  )
}

function useAudio(url: string): [boolean, () => void] {
  const [audio] = useState<HTMLAudioElement>(new Audio())
  const [playing, setPlaying] = useState(true)

  const toggle = () => setPlaying(!playing)

  useEffect(
    () => {
      audio.src = url
      setPlaying(true)
      audio.play()
    },
    // But the audio is constant
    [audio, url]
  )

  useEffect(
    () => {
      if (playing) audio.play()
      else {
        audio.pause()
        audio.currentTime = 0
      }
    },
    // But the audio is constant
    [audio, playing]
  )

  useEffect(
    () => {
      audio.addEventListener('ended', () => setPlaying(false))
      return () => {
        audio.pause()
        audio.removeEventListener('ended', () => setPlaying(false))
      }
    },
    // But the audio is constant
    [audio]
  )

  return [playing, toggle]
}
