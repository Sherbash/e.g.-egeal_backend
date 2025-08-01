import { Document, model, Schema } from "mongoose";
import { ITool } from "./tool.interface";

interface IToolDocument extends ITool, Document {}

const toolSchema = new Schema<IToolDocument>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  commissionRate: { type: Number, required: true },
  toolId: { type: String, unique: true, required: true },
  isActive: { type: Boolean, default: true },
  imageUrl: { type: String }, 
  founderId: { type: Schema.Types.ObjectId, ref: 'Founder', required: true },
});

export const ToolModel = model<IToolDocument>("Tool", toolSchema);
