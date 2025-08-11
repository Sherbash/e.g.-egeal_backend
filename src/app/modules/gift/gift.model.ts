import { Schema, model, Document, Types } from 'mongoose';

export enum GiftType {
  DIGITAL = 'DIGITAL',
  PHYSICAL = 'PHYSICAL'
}

export interface IGift extends Document {
  name: string;
  description?: string;
  type: GiftType;
  value: number;
  imageUrl?: string;
  campaign?: Types.ObjectId;
  recipients?: Types.ObjectId[];
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

const GiftSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: Object.values(GiftType), required: true },
  value: { type: Number, required: true },
  imageUrl: { type: String },
  campaign: { type: Schema.Types.ObjectId, ref: 'Campaign' },
  recipients: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  founderId: { type: Schema.Types.ObjectId, ref: 'Founder', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const Gift = model<IGift>('Gift', GiftSchema);
