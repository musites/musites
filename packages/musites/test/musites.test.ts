import { Database } from '../src/index'

test('Throw when constructing empty database', () => {
  expect(() => {
    new Database({ name: '', music: [] })
  }).toThrow()
})
