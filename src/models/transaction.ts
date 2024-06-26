import { Schema, model, Document } from "mongoose";
import { customerSchema } from "./customer.js";
import { providerSchema } from "./provider.js";
import { furnitureSchema } from "./furniture.js";

/**
 * Interface for FurnitureTuple.
 * @interface FurnitureTuple
 */
export interface FurnitureTuple {
  furniture: typeof furnitureSchema;
  quantity: number;
}

/**
 * Interface for Transaction document.
 * @interface ITransaction
 * @extends {Document}
 */
export interface ITransaction extends Document {
  type: "Purchase" | "Sale";
  furniture: FurnitureTuple[];
  customer?: typeof customerSchema;
  provider?: typeof providerSchema;
  date: Date;
  price: number;
}

/**
 * Schema for Transaction document.
 * @const transactionSchema
 * @type {Schema}
 */
export const transactionSchema = new Schema<ITransaction>({
  type: {
    type: String,
    enum: ["Purchase", "Sale"],
    required: true,
  },
  furniture: [
    {
      furniture: {
        type: Schema.Types.ObjectId,
        ref: "Furniture",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  customer: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
  },
  provider: {
    type: Schema.Types.ObjectId,
    ref: "Provider",
  },
  date: {
    type: Date,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

/**
 * Mongoose model for Transaction document.
 * @export
 * @default
 * @type {model<ITransaction>}
 */
export default model<ITransaction>("Transaction", transactionSchema);
