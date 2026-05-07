import { Component, inject, signal } from '@angular/core'
import { ActivityFeedSectionComponent } from './activity-feed/activity-feed-section.component'
import { DashboardErrorComponent } from './dashboard-error/dashboard-error.component'
import { ProjectsSectionComponent } from './projects-section/projects-section.component'
import { StatCardsSectionComponent } from './stat-cards/stat-cards-section.component'
import { ApiService } from '../../core/api.service'
import { ToastService } from '../../core/toast.service'
import { toSignal } from '@angular/core/rxjs-interop'
import { catchError, of, tap } from 'rxjs'

@Component({
  selector: 'app-dashboard',
  imports: [
    ActivityFeedSectionComponent,
    ProjectsSectionComponent,
    StatCardsSectionComponent,
    DashboardErrorComponent,
  ],
  templateUrl: 'dashboard.component.html',
  styleUrl: 'dashboard.component.scss',
})
export class DashboardComponent {
  apiService = inject(ApiService)
  toastService = inject(ToastService)

  readonly error = signal(false)
  readonly projectsLoading = signal(true)
  readonly projects = toSignal(this.apiService.getProjects().pipe(
    tap(() => this.projectsLoading.set(false)),
    catchError(() => {
      this.projectsLoading.set(false)
      this.error.set(true)
      this.toastService.error('Failed to load projects.')
      return of([])
    })
  ), { initialValue: [] })

  readonly activityLoading = signal(true)
  readonly activity = toSignal(this.apiService.getActivity().pipe(
    tap(() => this.activityLoading.set(false)),
    catchError(() => {
      this.activityLoading.set(false)
      this.error.set(true)
      this.toastService.error('Failed to load activity feed.')
      return of([])
    })
  ), { initialValue: [] })
}
