import { Project, ProjectStatus } from "../../../../core/models"

const STATUS_VALUES: ProjectStatus[] = ['not_started', 'in_progress', 'completed', 'overdue']
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomLetters(length: number): string {
  let output = ''
  for (let idx = 0; idx < length; idx++) {
    output += LETTERS[randomInt(0, LETTERS.length - 1)]
  }
  return output
}

function randomPlaceholderText(minWords: number, maxWords: number): string {
  const words: string[] = []
  const wordsCount = randomInt(minWords, maxWords)
  for (let idx = 0; idx < wordsCount; idx++) {
    words.push(randomLetters(randomInt(3, 10)))
  }
  return words.join(' ')
}

export function createMockProjects(count = 10): Project[] {
  return Array.from({ length: count }, (_, idx) => ({
    id: `mock-project-${idx + 1}`,
    name: randomPlaceholderText(2, 4),
    description: randomPlaceholderText(5, 11),
    status: STATUS_VALUES[idx % STATUS_VALUES.length],
    owner: {
      id: `mock-owner-${idx + 1}`,
      name: randomPlaceholderText(2, 3),
      initials: randomLetters(2).toUpperCase(),
      avatarColor: '#d9d9d9',
    },
    dueDate: '2026-12-31',
    progress: 0,
    tasksTotal: randomInt(8, 16),
    tasksDone: randomInt(1, 7),
    tags: [randomPlaceholderText(1, 2), randomPlaceholderText(1, 2)],
  }))
}
