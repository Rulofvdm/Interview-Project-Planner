import { Component, Input } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'

@Component({
  selector: 'app-projects-empty-state',
  imports: [MatIconModule],
  templateUrl: 'projects-empty-state.component.html',
  styleUrl: 'projects-empty-state.component.scss',
})
export class ProjectsEmptyStateComponent {
  @Input({ required: true }) title!: string
  @Input({ required: true }) description!: string
}
