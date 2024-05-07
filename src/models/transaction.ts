import { Schema, connect, model, Document } from "mongoose";
import { customerSchema } from "./customer.js";
import { providerSchema } from "./provider.js";
import { furnitureSchema } from "./furniture.js";

connect("mongodb://127.0.0.1:27017/transactions")
  .then(() => {
    console.log("Connected to the transactions database");
  })
  .catch(() => {
    console.log(
      "Something went wrong when conecting to the transactions database",
    );
  });

// Definición de la interfaz para el documento de transacción
interface ITransaction extends Document {
  type: "Compra" | "Venta";
  furniture: (typeof furnitureSchema)[];
  customer?: typeof customerSchema;
  provider?: typeof providerSchema;
}

// Definición del esquema de transacción
export const transactionSchema = new Schema<ITransaction>({
  type: {
    type: String,
    enum: ["Compra", "Venta"],
    required: true,
  },
  furniture: [
    {
      type: Schema.Types.ObjectId,
      ref: "Furniture",
      quantity: {
        type: Number,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      material: {
        type: String,
        enum: ["wood", "metal", "plastic", "glass", "fabric", "leather"],
        required: true,
      },
      color: {
        type: String,
        enum: ["red", "blue", "green", "yellow", "black", "white", "brown"],
        required: true,
      },
    }
  ],
  customer: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
    dni: { type: String, required: true, validate: (value: string) => {
      if(!value.match(/^\d{8}[A-Z]$/)){
          throw new Error("Invalid DNI"); // Ultima letra del dni de control
      }
    }},
  },
  provider: {
    type: Schema.Types.ObjectId,
    ref: "Provider",
    cif: { type: String, required: true, validate: (value: string) => {
      if(!value.match(/^[A-Z]{1}\d{8}$/)){
        throw new Error("Invalid CIF"); // Ultima letra del cif de control
      }
    }},
  },
});

// Creación del modelo de transacción
export default model<ITransaction>("Transaction", transactionSchema);
