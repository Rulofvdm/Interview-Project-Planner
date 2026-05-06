import { Pipe, PipeTransform } from "@angular/core"
import { PROJECT_STATUS_LABEL, ProjectStatus } from "../../../core/models"

@Pipe({
  name: 'statusLabel',
  standalone: true,
})
export class StatusLabelPipe implements PipeTransform {
  transform(status: ProjectStatus): string {
    return PROJECT_STATUS_LABEL[status]
  }
}

