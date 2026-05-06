import { Component, computed, Input, Signal } from '@angular/core'
import { Project } from '../../../core/models'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatIconModule } from '@angular/material/icon'

@Component({
  selector: 'app-stat-cards-section',
  templateUrl: 'stat-cards-section.component.html',
  styleUrl: 'stat-cards-section.component.scss',
  imports: [
    MatProgressSpinnerModule,
    MatIconModule,
  ],
})
export class StatCardsSectionComponent {
  @Input({ required: true }) projects!: Signal<Project[]>
  @Input({ required: true }) loading!: boolean

  totalProjects = computed(() => this.projects().length ?? 0)
  inProgressProjects = computed(() => this.projects().filter(project => project.status === 'in_progress').length ?? 0)
  overdueProjects = computed(() => this.projects().filter(project => project.status === 'overdue').length ?? 0)
  completedProjects = computed(() => this.projects().filter(project => project.status === 'completed').length ?? 0)
}
