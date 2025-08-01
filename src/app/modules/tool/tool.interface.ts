import { Types } from "mongoose";

export interface ITool {
  toolId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string; 
  commissionRate: number;
  isActive?: boolean;
  founderId: Types.ObjectId;
}

export interface IToolUpdate {
  name?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  commissionRate?: number;
  isActive?: boolean;
}
