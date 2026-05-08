export interface IKpoEntry {
  sequenceNumber: number;
  issueDate: string;
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
