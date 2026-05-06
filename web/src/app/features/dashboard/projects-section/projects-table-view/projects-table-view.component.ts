import { DatePipe, PercentPipe } from '@angular/common'
import { Component, Input } from '@angular/core'
import { MatChipsModule } from '@angular/material/chips'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatTableModule } from '@angular/material/table'
import { Project } from '../../../../core/models'
import { StatusLabelPipe } from '../status-label.pipe'

@Component({
  selector: 'app-projects-table-view',
  imports: [
    DatePipe,
    MatChipsModule,
    MatProgressBarModule,
    MatTableModule,
    PercentPipe,
    StatusLabelPipe,
  ],
  templateUrl: './projects-table-view.component.html',
  styleUrl: './projects-table-view.component.scss',
})
export class ProjectsTableViewComponent {
  @Input({ required: true }) projects!: Project[]

  readonly displayedColumns: string[] = [
    'project',
    'owner',
    'progress',
    'dueDate',
    'tags',
    'status',
  ]
}
