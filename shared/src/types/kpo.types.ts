export interface IKpoEntry {
  sequenceNumber: number;
  date: string; // payment date (paidAt)
  description: string;
  productAmount: number;
  serviceAmount: number;
  totalAmount: number;
}

export interface IKpoResponse {
  year: number;
  entries: IKpoEntry[];
  totalYearly: number;
}
