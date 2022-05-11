import { Database, DatabaseSet, Game, QuestionWithChoices } from '../src/index'

const sampleDatabaseData = {
  name: 'Test Artist',
  sets: [
    {
      name: 'Simple',
      music: [
        {
          title: ['Music A Simple', 'C'],
          source: ['music_a_simple_source1', 'music_a_simple_source2'],
        },
        {
          title: ['Music B Simple', 'D'],
          source: ['music_b_simple_source1', 'music_b_simple_source2'],
        },
      ],
    },
    {
      name: 'Normal',
      music: [
        {
          title: ['Music A Normal', 'C'],
          source: ['music_a_normal_source1', 'music_a_normal_source2'],
        },
        {
          title: ['Music B Normal', 'D'],
          source: ['music_b_normal_source1', 'music_b_normal_source2'],
        },
      ],
    },
  ],
}

const getRightAnswer: (source: string) => string = (source) =>
  `Music ${source[6].toUpperCase()} Normal`

const getWrongAnswer: (source: string) => string = () => `The Wrong Answer`

describe('Musites database', () => {
  const badDataBaseError = 'Musites: Bad database'
  const badDataBaseSetError = 'Musites: Bad database set'

  test('Throw when constructing empty database', () => {
    expect(() => {
      new Database({ name: '', sets: [] })
    }).toThrowError(badDataBaseError)
  })

  test('Throw when constructing empty database set', () => {
    expect(() => {
      new DatabaseSet({ name: '', music: [] })
    }).toThrowError(badDataBaseSetError)

    expect(() => {
      new Database({ name: '', sets: [{ name: '', music: [] }] })
    }).toThrowError(badDataBaseError)
  })

  test('Construct valid database', () => {
    const database = new Database(sampleDatabaseData)
    expect(database.name).toBe(sampleDatabaseData.name)
    expect(database.sets.length).toBe(sampleDatabaseData.sets.length)
    for (let i = 0; i < sampleDatabaseData.sets.length; i++) {
      expect(database.sets[i].name).toBe(sampleDatabaseData.sets[i].name)
      expect(database.sets[i].count).toBe(
        sampleDatabaseData.sets[i].music.length
      )
    }
  })
})

describe('Musites generic', () => {
  test('Construct valid game', () => {
    const database = new Database(sampleDatabaseData)
    const set = database.sets[1]
    expect(new Game(set)).toBeTruthy()
  })

  test('Submit only once', () => {
    const database = new Database(sampleDatabaseData)
    const set = database.sets[1]
    const game = new Game(set)
    game.submit()
    expect(() => {
      game.submit()
    }).toThrowError('Musites: Game already finished.')
  })

  test('Storage answer', () => {
    const database = new Database(sampleDatabaseData)
    const set = database.sets[1]
    const game = new Game(set)
    const answer = 'Aaaaa'
    game.answer(1, answer)
    const result = game.submit()
    expect(result.data[0].answer).toBe(answer)
  })
})

describe('Musites mode choice', () => {
  test('Construct valid game', () => {
    const database = new Database(sampleDatabaseData)
    const set = database.sets[1]
    expect(new Game(set, { mode: 'choice' })).toBeTruthy()
  })

  test('Generate choices', () => {
    const database = new Database(sampleDatabaseData)
    const set = database.sets[1]
    const game = new Game(set, { mode: 'choice' })
    for (const question of game.getQuestions())
      expect(
        (question as QuestionWithChoices).choices.length
      ).toBeGreaterThanOrEqual(1)
  })

  test('Generate correct result', () => {
    const database = new Database(sampleDatabaseData)
    const set = database.sets[1]
    const game = new Game(set, { mode: 'choice', count: 4 })
    const questions = game.getQuestions()

    // Fill all question with correct answer
    for (const question of questions) {
      game.answer(question.id, getRightAnswer(question.source))
    }

    // Fill last question with wrong answer
    game.answer(4, getWrongAnswer(questions[3].source))

    const result = game.submit()
    expect(result).toBeTruthy()
    expect(result.accuracy).toBe(0.75)
    expect(result.total).toBe(4)
    expect(result.correct).toBe(3)
    expect(result.wrong).toBe(1)
  })
})

describe('Musites mode fill', () => {
  test('Construct valid game', () => {
    const database = new Database(sampleDatabaseData)
    const set = database.sets[1]
    expect(new Game(set, { mode: 'fill' })).toBeTruthy()
  })

  test('Did not generate choices', () => {
    const database = new Database(sampleDatabaseData)
    const set = database.sets[1]
    const game = new Game(set, { mode: 'fill' })
    for (const question of game.getQuestions())
      expect((question as QuestionWithChoices).choices).toBeUndefined()
  })

  test('Generate correct result', () => {
    const database = new Database(sampleDatabaseData)
    const set = database.sets[1]
    const game = new Game(set, { mode: 'fill', count: 4 })
    const questions = game.getQuestions()

    // Fill all question with correct answer
    for (const question of questions) {
      game.answer(question.id, getRightAnswer(question.source))
    }

    // Fill last question with wrong answer
    game.answer(4, getWrongAnswer(questions[3].source))

    const result = game.submit()
    expect(result).toBeTruthy()
    expect(result.accuracy).toBe(0.75)
    expect(result.total).toBe(4)
    expect(result.correct).toBe(3)
    expect(result.wrong).toBe(1)
  })
})
