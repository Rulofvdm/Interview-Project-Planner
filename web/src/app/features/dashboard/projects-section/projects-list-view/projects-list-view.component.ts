import { Component, Input } from '@angular/core'
import { Project } from '../../../../core/models'
import { ProjectListItemCardComponent } from './project-list-item-card/project-list-item-card.component'

@Component({
  selector: 'app-projects-list-view',
  imports: [ProjectListItemCardComponent],
  templateUrl: './projects-list-view.component.html',
  styleUrl: './projects-list-view.component.scss',
})
export class ProjectsListViewComponent {
  @Input({ required: true }) projects!: Project[]
}
