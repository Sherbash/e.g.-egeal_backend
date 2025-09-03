import { model, Schema } from "mongoose";
import { IContactPackage } from "./contact-package.interface";


const contactPackageSchema = new Schema<IContactPackage>({
  name: {type: String, required: true},
  email: {type: String, required: true},
  message: {type: String, required: true},
}, {
  timestamps: true
})

export const ContactPackage = model<IContactPackage>('ContactPackage', contactPackageSchema)