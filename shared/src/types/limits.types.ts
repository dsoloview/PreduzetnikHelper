export interface ILimitStatus {
  limit: number;
  current: number;
  remaining: number;
  percentage: number;
  isExceeded: boolean;
}

export interface ILimitsResponse {
  pausalLimit: ILimitStatus;
  vatLimit: ILimitStatus;
}
