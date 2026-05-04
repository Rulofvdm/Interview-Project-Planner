import { Component } from '@angular/core';
import { ActivityFeedSectionComponent } from './activity-feed/activity-feed-section.component';
import { ProjectsSectionComponent } from './projects-section/projects-section.component';
import { StatCardsSectionComponent } from './stat-cards/stat-cards-section.component';

/**
 * Build the dashboard here. Full brief: /instructions
 *
 * API service is pre-wired in core/api.service.ts:
 *   - apiService.getProjects()   → Observable<Project[]>
 *   - apiService.getActivity()   → Observable<ActivityItem[]>
 *
 * Tier checklist:
 *   Must:   stat cards (Total / In Progress / Overdue / Completed),
 *           project list/table, loading + error states
 *   Should: activity feed, responsive layout, visual polish
 *   Nice:   filter or sort, empty state, status badge component
 *
 * Good luck!
 */
@Component({
  selector: 'app-dashboard',
  imports: [
    ActivityFeedSectionComponent,
    ProjectsSectionComponent,
    StatCardsSectionComponent,
  ],
  templateUrl: 'dashboard.component.html',
  styleUrl: 'dashboard.component.scss',
})
export class DashboardComponent {}
