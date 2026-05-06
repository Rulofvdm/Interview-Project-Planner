import { Component, output } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'

@Component({
  selector: 'app-dashboard-error',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: 'dashboard-error.component.html',
  styleUrl: 'dashboard-error.component.scss',
})
export class DashboardErrorComponent {}
