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
    set: DatabaseSet,

    /**
     * Game options.
     */
    options?: Partial<GameOptions>
  ) {
    // Parse game options
    // and then use `this.options` anywhere else.
    // Do not use `options`.
    this.#options = Object.assign({}, defaultGameOptions, options)

    // Construct data
    this.#data = []

    // Get the music used in this game,
    // and transform Music to Item.
    const musicData = set.music
    const music: Item[] = musicData.flatMap((x) =>
      x.source.map((y) => {
        let choices: string[] | null = null

        if (this.#options.mode === 'choice') {
          // Generate choices.
          // `choicesData` is the list of all wrong choices.
          const choicesData = musicData
            .filter((z) => x !== z)
            .map((z) => z.title[0])
          let lottery: string[] = []
          choices = [x.title[0]]

          // We need to roll
          // `this.options.choiceCount - 1` choice(s).
          while (choices.length < this.#options.choiceCount) {
            if (!lottery.length) {
              // Copy `choicesData` to lottery
              lottery = choicesData.concat()
            }

            // Roll
            const i = Math.floor(Math.random() * lottery.length)
            choices.push(lottery[i])
            lottery.splice(i, 1)
          }

          // Shuffle
          shuffle(choices)
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

    while (this.#data.length < this.#options.count) {
      if (!lottery.length) {
        // Copy music to lottery
        lottery = music.concat()
      }

      // Roll
      const i = Math.floor(Math.random() * lottery.length)
      const item = lottery[i]

      lottery.splice(i, 1)
      if (item !== lastRolled) {
        lastRolled = item
        this.#data.push(item)
      }
    }
  }

  /**
   * Internal game options.
   */
  #options: GameOptions

  //#region State

  /**
   * Internal state of game.
   */
  #state: 'ingame' | 'completed' = 'ingame'

  /**
   * Internal state of game data.
   */
  #data: Item[]

  //#endregion

  //#region Core

  /**
   * Get questions.
   *
   * @returns List of questions.
   */
  getQuestions(): Question[] | QuestionWithChoices[] {
    return this.#options.mode === 'choice'
      ? this.#data.map((x, i) => ({
          id: i + 1,
          source: x.source,
          choices: x.choices,
        }))
      : this.#data.map((x, i) => ({
          id: i + 1,
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
    this.#data[id - 1].answer = title
  }

  /**
   * Submit and finish the game.
   *
   * @returns The result of the game.
   */
  submit(): Result {
    if (this.#state === 'completed')
      throw new Error('Musites: Game already finished.')
    this.#state = 'completed'

    // Now calc the result.
    const total = this.#options.count
    let correct = 0

    if (this.#options.mode === 'choice') {
      // Use exact matching.
      correct = this.#data.filter(
        (x) => x.answer !== null && x.title[0] === x.answer
      ).length
    } else {
      // Use fuzzy matching.
      correct = this.#data.filter(
        (x) =>
          x.answer !== null &&
          x.title
            .map((x) => x.toLowerCase())
            .some((y) => x.answer!.toLowerCase().includes(y))
      ).length
    }

    const accuracy = correct / this.#options.count
    const wrong = this.#options.count - correct

    // Calc ranking.
    let ranking = 'C'
    if (accuracy > 0.45) ranking = 'B'
    if (accuracy > 0.72) ranking = 'A'
    if (total >= 10) {
      if (wrong === 2) ranking = 'S'
      if (wrong === 1) ranking = 'SS'
      if (wrong === 0) ranking = 'SSS'
    }

    return {
      total,
      correct,
      wrong,
      accuracy,
      ranking,
      data: this.#data,
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
    data: DatabaseData
  ) {
    if (!data || !data.name || !data.sets)
      throw new Error('Musites: Bad database')

    this.name = data.name
    this.sets = data.sets.map((x) => new DatabaseSet(x))
  }

  public name: string
  public sets: DatabaseSet[]
}

/**
 * The Musites database set.
 */
export class DatabaseSet {
  constructor(
    /**
     * Set data.
     */
    data: DatabaseSetData
  ) {
    if (!data || !data.name || !data.music)
      throw new Error('Musites: Bad database set')

    this.name = data.name
    this.music = data.music.concat()
    this.count = this.music.length
  }

  public name: string

  /**
   * List of tracks in this set.
   */
  public music: Music[]

  /**
   * Count of tracks in this set.
   */
  public count: number
}

//#region Option

/**
 * Musites game mode.
 */
export type GameMode = 'choice' | 'fill'

/**
 * Musites game options.
 */
export interface GameOptions {
  mode: GameMode
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

interface DatabaseData {
  name: string
  sets: DatabaseSetData[]
}

interface DatabaseSetData {
  name: string
  music: Music[]
}

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
  id: number
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
  ranking: string
  data: Item[]
}

//#endregion

//#region Utils

function shuffle(array: unknown[]) {
  let m = array.length
  let t: unknown
  let i: number
  while (m) {
    i = Math.floor(Math.random() * m--)
    t = array[m]
    array[m] = array[i]
    array[i] = t
  }
  return array
}

//#endregion
