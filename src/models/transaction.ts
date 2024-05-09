import { Schema, model, Document } from "mongoose";
import { customerSchema } from "./customer.js";
import { providerSchema } from "./provider.js";
import { furnitureSchema } from "./furniture.js";

// connect("mongodb://127.0.0.1:27017/transactions")
//   .then(() => {
//     console.log("Connected to the transactions database");
//   })
//   .catch(() => {
//     console.log(
//       "Something went wrong when conecting to the transactions database",
//     );
//   });

interface ITransaction extends Document {
  type: "Purchase" | "Sale";
  furniture: (typeof furnitureSchema)[];
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
      type: Schema.Types.ObjectId,
      ref: "Furniture",
    }
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
  }
});

export default model<ITransaction>("Transaction", transactionSchema);
