/**
 * The Musites game.
 *
 * @author Il Harper <hi@ilharper.com> (https://ilharper.com)
 */
export class Game {
  constructor(
    /**
     * Game database.
     */
    database: Database,

    /**
     * Game options.
     */
    options: Partial<GameOptions>
  ) {
    // Parse game options
    // and then use `this.options` anywhere else.
    // Do not use `options`.
    this.options = Object.assign({}, defaultGameOptions, options)

    // Construct data
    this.data = []

    // Get the music used in this game,
    // and transform Music to Item.
    const musicData = database.data.music
    const music: Item[] = musicData.flatMap((x) =>
      x.source.map((y) => {
        let choices: string[] | null = null

        if (this.options.mode === 'choice') {
          // Generate choices.
          // `choicesData` is the list of all wrong choices.
          const choicesData = musicData
            .filter((z) => x !== z)
            .map((z) => z.title[0])
          let lottery: string[] = []
          const choicesResult: string[] = [x.title[0]]

          // We need to roll
          // `this.options.choiceCount - 1` choice(s).
          while (choicesResult.length < this.options.choiceCount) {
            if (!lottery) {
              // Copy `choicesData` to lottery
              lottery = choicesData.concat()
            }

            // Roll
            const i = Math.floor(Math.random() * lottery.length)
            lottery = lottery.splice(i, 1)
            choicesResult.push(lottery[i])
          }
        }
        return {
          source: y,
          title: x.title.concat(), // Copy
          choices,
          answer: null,
        }
      })
    )

    // So now we have the music list
    // distinct by their sources.
    // Now roll the music.

    // lastRolled ensures there will be no
    // identical tracks next to each other.
    let lastRolled: Item | null = null
    let lottery: Item[] = []

    while (this.data.length < this.options.count) {
      if (!lottery) {
        // Copy music to lottery
        lottery = music.concat()
      }

      // Roll
      const i = Math.floor(Math.random() * lottery.length)
      const item = lottery[i]

      if (item !== lastRolled) {
        lottery = lottery.splice(i, 1)
        lastRolled = item
        this.data.push(item)
      }
    }
  }

  /**
   * Internal game options.
   */
  private options: GameOptions

  //#region State

  /**
   * Internal state of game.
   */
  private state: 'ingame' | 'completed' = 'ingame'

  /**
   * Internal state of game data.
   */
  private data: Item[]

  //#endregion

  //#region Core

  /**
   * Get questions.
   *
   * @returns List of questions.
   */
  getQuestions(): Question[] | QuestionWithChoices[] {
    return this.options.mode === 'choice'
      ? this.data.map((x) => ({
          source: x.source,
          choices: x.choices,
        }))
      : this.data.map((x) => ({
          source: x.source,
        }))
  }

  /**
   * Answer a question.
   *
   * @param id Question id.
   * @param title The answer.
   */
  answer(id: number, title: string) {
    this.data[id].answer = title
  }

  /**
   * Submit and finish the game.
   *
   * @returns The result of the game.
   */
  submit(): Result {
    if (this.state === 'completed')
      throw new Error('Musites: Game already finished.')
    this.state = 'completed'

    // Now calc the result.
    let correct = 0

    if (this.options.mode === 'choice') {
      // Use exact matching.
      correct = this.data.filter(
        (x) => x.answer !== null && x.title[0] === x.answer
      ).length
    } else {
      // Use fuzzy matching.
      correct = this.data.filter(
        (x) => x.answer !== null && x.title.some((y) => x.answer!.includes(y))
      ).length
    }

    return {
      total: this.options.count,
      correct,
      wrong: this.options.count - correct,
      accuracy: correct / this.options.count,
    }
  }

  //#endregion
}

/**
 * The Musites database.
 */
export class Database {
  constructor(
    /**
     * Musites data.
     */
    public data: {
      name: string
      music: Music[]
    }
  ) {
    if (!data || !data.name || !data.music)
      throw new Error('Musites: Bad database')

    this.musicList = data.music.map((x) => x.title[0])
    this.count = this.musicList.length
  }

  /**
   * List of tracks in this database.
   */
  public musicList: string[]

  /**
   * Count of tracks in this database.
   */
  public count: number
}

//#region Option

/**
 * Musites game options.
 */
export interface GameOptions {
  mode: 'choice' | 'fill'
  count: number
  choiceCount: number
}

/**
 * Default Musites game options.
 */
const defaultGameOptions: GameOptions = {
  mode: 'choice',
  count: 10,
  choiceCount: 4,
}

//#endregion

//#region Data Types

/**
 * An item in the data of a Musites game,
 * including question, choices (in choice mode)
 * and answer.
 */
interface Item {
  source: string
  title: string[]
  choices: string[] | null
  answer: string | null
}

/**
 * A single music in database.
 */
interface Music {
  title: string[]
  source: string[]
}

/**
 * A question item.
 */
export interface Question {
  source: string
}

/**
 * A question item with choices.
 */
export interface QuestionWithChoices extends Question {
  choices: string[]
}

export interface Result {
  total: number
  correct: number
  wrong: number
  accuracy: number
}

//#endregion
