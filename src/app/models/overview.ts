export interface Overview {
  matchCount: number;
  teamCount: number;
  playerCount: number;
  competitionCount: number;
  categoryCount: number;
  organizationCount: number;
}

export interface OverviewGetResponse {
  success: boolean;
  message: string;
  data: Overview;
  timestamp: string;
}
