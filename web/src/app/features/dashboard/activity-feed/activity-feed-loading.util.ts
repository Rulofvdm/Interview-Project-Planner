import { ActivityItem, ActivityType } from '../../../core/models'

const ACTIVITY_TYPES: ActivityType[] = ['task_completed', 'project_created', 'comment_added', 'status_changed']
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomWord(length: number): string {
  let output = ''
  for (let idx = 0; idx < length; idx++) {
    output += LETTERS[randomInt(0, LETTERS.length - 1)]
  }
  return output
}

function randomText(minWords: number, maxWords: number): string {
  const wordCount = randomInt(minWords, maxWords)
  return Array.from({ length: wordCount }, () => randomWord(randomInt(3, 10))).join(' ')
}

export function createMockActivity(count = 8): ActivityItem[] {
  return Array.from({ length: count }, (_, idx) => ({
    id: `mock-activity-${idx + 1}`,
    type: ACTIVITY_TYPES[idx % ACTIVITY_TYPES.length],
    actor: {
      id: `mock-actor-${idx + 1}`,
      name: randomText(2, 3),
      initials: randomWord(2).toUpperCase(),
    },
    projectId: `mock-project-${idx + 1}`,
    projectName: randomText(2, 4),
    message: randomText(3, 6),
    timestamp: `2026-01-${String((idx % 28) + 1).padStart(2, '0')}T12:00:00.000Z`,
  }))
}
