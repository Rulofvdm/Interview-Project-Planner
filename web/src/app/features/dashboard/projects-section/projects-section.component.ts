import { Component, Input, Signal, computed, signal } from '@angular/core'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInput } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSelectModule } from '@angular/material/select'
import { Project, PROJECT_STATUS_FILTER_OPTIONS, ProjectStatusFilterOption } from '../../../core/models'
import { ProjectsListViewComponent } from './projects-list-view/projects-list-view.component'
import { ProjectsTableViewComponent } from './projects-table-view/projects-table-view.component'

type ProjectsSectionViewMode = 'list' | 'table'

@Component({
  selector: 'app-projects-section',
  imports: [
    MatButtonToggleModule,
    MatFormFieldModule,
    MatIconModule,
    MatInput,
    MatProgressSpinnerModule,
    MatSelectModule,
    ProjectsListViewComponent,
    ProjectsTableViewComponent,
  ],
  templateUrl: 'projects-section.component.html',
  styleUrl: 'projects-section.component.scss',
})
export class ProjectsSectionComponent {
  @Input() projects!: Signal<Project[]>
  @Input() loading!: boolean

  readonly projectStatusFilterOptions = PROJECT_STATUS_FILTER_OPTIONS
  
  readonly statusFilter = signal<ProjectStatusFilterOption>('all')
  readonly searchText = signal<string>('')
  readonly viewMode = signal<ProjectsSectionViewMode>('list')

  readonly filteredProjects = computed(() => {
    let projects = this.projects() ?? []
    if (!projects.length) return []
    
    const statusFilter = this.statusFilter()
    if (statusFilter !== 'all') projects = projects.filter((project) => project.status === statusFilter)
    
    const searchText = this.searchText()
    if (searchText) projects = this.filterProjectsBySearchText(projects, searchText)
    return projects
  })

  onStatusFilterChange(value: ProjectStatusFilterOption): void {
    this.statusFilter.set(value)
  }

  onSearchTextChange(value: string): void {
    this.searchText.set(value)
  }

  onViewModeChange(mode: ProjectsSectionViewMode): void {
    this.viewMode.set(mode)
  }

  filterProjectsByStatus(projects: Project[], statusFilter: ProjectStatusFilterOption): Project[] {
    return projects.filter((project) => project.status === statusFilter)
  }

  filterProjectsBySearchText(projects: Project[], searchText: string): Project[] {
    return projects.filter((project) =>
      project.name.includes(searchText) ||
      project.description.includes(searchText) ||
      project.owner.name.includes(searchText) ||
      project.tags.some((tag) => tag.includes(searchText))
    )
  }
}
