export interface IReview {
  userId: string;
  toolId: string;
  userName: string;
  email?: string;
  rating: number;
  comment: string;
}
