import { Document, model, Schema } from "mongoose";
import validator from "validator";

export interface ICustomer extends Document {
  name: string;
  contact: string;
  email: string;
  postalCode: string;
  dni: string;
}

function calcularLetraDNI(numeroDNI: number) {
  const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const resto = numeroDNI % 23;
  return letras.charAt(resto);
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
      validator: (value: string) => {
        const numeroDNI = parseInt(value.slice(0, -1), 10);
        const letraDNI = value.slice(-1);
        return letraDNI === calcularLetraDNI(numeroDNI);
      },
      message: "Invalid DNI",
    },
  },
});

export default model<ICustomer>("Customer", customerSchema);
