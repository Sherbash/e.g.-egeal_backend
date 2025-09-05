import { model, Schema } from "mongoose";
import { IContactPackage, IStoreInfoFromPackagePopup, } from "./contact-package.interface";


const contactPackageSchema = new Schema<IContactPackage>({
  name: {type: String, required: true},
  email: {type: String, required: true},
  message: {type: String, required: true},
}, {
  timestamps: true
})

// const storeInfoFromPackagePopup = new Schema<IStoreInfoFromPackagePopup>({
//   name: {type: String, required: true},
//   email: {type: String, required: true},
// }, {
//   timestamps: true
// })

// export const StoreInfoFromPackagePopup = model<IStoreInfoFromPackagePopup>('StoreInfoFromPackagePopup', storeInfoFromPackagePopup );

export const ContactPackage = model<IContactPackage>('ContactPackage', contactPackageSchema );