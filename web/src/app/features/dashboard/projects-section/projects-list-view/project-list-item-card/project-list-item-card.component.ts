import { Component, Input } from "@angular/core"
import { Project } from "../../../../../core/models"
import { StatusLabelPipe } from "../../status-label.pipe"
import { MatCard, MatCardContent } from "@angular/material/card"
import { MatChip } from "@angular/material/chips"
import { MatProgressBar } from "@angular/material/progress-bar"
import { DatePipe } from "@angular/common"

@Component({
  selector: 'app-project-list-item-card',
  templateUrl: './project-list-item-card.component.html',
  styleUrls: ['./project-list-item-card.component.scss'],
  imports: [
    StatusLabelPipe,
    MatCard,
    MatCardContent,
    MatChip,
    MatProgressBar,
    DatePipe,
  ]
})
export class ProjectListItemCardComponent {
  @Input() project!: Project
}