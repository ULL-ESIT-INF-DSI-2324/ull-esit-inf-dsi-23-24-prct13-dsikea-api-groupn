import { Schema, model, Document } from "mongoose";
import { customerSchema } from "./customer.js";
import { providerSchema } from "./provider.js";
import { furnitureSchema } from "./furniture.js";

export interface FurnitureTuple {
  furniture: typeof furnitureSchema;
  quantity: number;
}

interface ITransaction extends Document {
  type: "Purchase" | "Sale";
  furniture: FurnitureTuple[];
  customer?: typeof customerSchema;
  provider?: typeof providerSchema;
  date: Date;
  price: number;
}

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

export default model<ITransaction>("Transaction", transactionSchema);
