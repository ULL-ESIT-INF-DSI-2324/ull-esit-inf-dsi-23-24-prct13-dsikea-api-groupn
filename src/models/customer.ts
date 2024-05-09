import { Document, model, Schema } from "mongoose";
import validator from 'validator';

interface ICustomer extends Document {
  name: string;
  contact: string;
  email: string;
  postalCode: string;
  dni: string;
}

export const customerSchema: Schema = new Schema<ICustomer>({
  name: { type: String, required: true },
  contact: {
    type: String,
    required: true,
    validate: {
      validator: (value: string) => validator.isMobilePhone(value, "any"),
      message: "Invalid phone number",
    },
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: (value: string) => validator.isEmail(value),
      message: "Invalid email",
    },
  },
  postalCode: {
    type: String,
    required: true,
    validate: {
      validator: (value: string) => validator.isPostalCode(value, "any"),
      message: "Invalid address",
    },
  },
  dni: {
    type: String,
    required: true,
    validate: {
      validator: (value: string) => /^[0-9]{8}[A-Z]$/.test(value),
      message: "Invalid DNI",
    },
  },
});

export default model<ICustomer>("Customer", customerSchema);
