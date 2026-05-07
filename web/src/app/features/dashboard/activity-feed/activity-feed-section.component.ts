import { Component, Input, Signal } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { ActivityItem, ActivityType } from '../../../core/models'
import { SkeletonDirective } from '../../../core/directives/skeleton.directive'
import { createMockActivity } from './activity-feed-loading.util'

@Component({
  selector: 'app-activity-feed-section',
  imports: [
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatListModule,
    SkeletonDirective,
  ],
  templateUrl: 'activity-feed-section.component.html',
  styleUrl: 'activity-feed-section.component.scss',
})
export class ActivityFeedSectionComponent {
  @Input({ required: true }) activity!: Signal<ActivityItem[]>
  @Input({ required: true }) loading!: boolean
  readonly loadingActivity = createMockActivity(8)

  getActivityItems(): ActivityItem[] {
    if (this.loading) return this.loadingActivity
    return this.activity()
  }

  activityIcon(type: ActivityType): string {
    switch (type) {
      case 'task_completed':
        return 'check_circle'
      case 'project_created':
        return 'add_circle'
      case 'comment_added':
        return 'comment'
      case 'status_changed':
        return 'update'
    }
  }

  activityIconColor(type: ActivityType): 'primary' | 'accent' | undefined {
    switch (type) {
      case 'task_completed':
        return 'primary'
      case 'project_created':
        return 'accent'
      case 'comment_added':
        return undefined
      case 'status_changed':
        return 'primary'
    }
  }

  shortCalendarDate(iso: string): string {
    const d = new Date(iso)
    const now = new Date()
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    if (d.getFullYear() !== now.getFullYear()) opts.year = 'numeric'
    return d.toLocaleDateString(undefined, opts)
  }

  relativeAgo(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime()
    const sec = Math.floor(diffMs / 1000)
    if (sec < 45) return 'just now'
    const min = Math.floor(sec / 60)
    if (min < 60) return `${min}m ago`
    const hr = Math.floor(min / 60)
    if (hr < 24) return hr === 1 ? '1 hr ago' : `${hr} hrs ago`
    const day = Math.floor(hr / 24)
    if (day < 7) return `${day}d ago`
    const wk = Math.floor(day / 7)
    if (wk < 8) return wk === 1 ? '1 wk ago' : `${wk} wks ago`
    const mo = Math.floor(day / 30)
    if (mo < 24) return mo <= 1 ? '1 mo ago' : `${mo} mos ago`
    const yr = Math.floor(day / 365)
    return yr <= 1 ? '1 yr ago' : `${yr} yrs ago`
  }

  activityMetaLine(iso: string): string {
    return `${this.shortCalendarDate(iso)} · ${this.relativeAgo(iso)}`
  }
}
