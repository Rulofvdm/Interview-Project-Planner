export type ProjectStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue'
export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  completed: 'Completed',
  overdue: 'Overdue',
}

export type ProjectStatusFilterOption = ProjectStatus | 'all'
export const PROJECT_STATUS_FILTER_OPTIONS: { value: ProjectStatusFilterOption, label: string }[] = [
  { value: 'all', label: 'All statuses' },
  ...Object.entries(PROJECT_STATUS_LABEL).map(([key, value]) => ({ value: key as ProjectStatus, label: value })),
] as const

export interface Owner {
  id: string
  name: string
  initials: string
  avatarColor: string
}

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  owner: Owner
  dueDate: string        // ISO date (YYYY-MM-DD)
  progress: number       // float 0.0 → 1.0
  tasksTotal: number
  tasksDone: number
  tags: string[]
}

export type ActivityType =
  | 'task_completed'
  | 'project_created'
  | 'comment_added'
  | 'status_changed'

export interface Actor {
  id: string
  name: string
  initials: string
}

export interface ActivityItem {
  id: string
  type: ActivityType
  actor: Actor
  projectId: string
  projectName: string
  message: string
  timestamp: string      // ISO datetime
}

export type TaskStatus = 'not_started' | 'in_progress' | 'completed'

export interface Task {
  id: string
  projectId: string
  title: string
  status: TaskStatus
}
