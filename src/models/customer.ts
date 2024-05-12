import { Document, model, Schema } from "mongoose";
import validator from "validator";

/**
 * Interface for Customer document.
 * @interface ICustomer
 * @extends {Document}
 */
export interface ICustomer extends Document {
  name: string;
  contact: string;
  email: string;
  postalCode: string;
  dni: string;
}

/**
 * Function to calculate the letter of a Spanish DNI (National Identity Document).
 * @param {number} numeroDNI - The number part of the DNI.
 * @returns {string} The corresponding letter for the DNI.
 */
function calcularLetraDNI(numeroDNI: number) {
  const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
  const resto = numeroDNI % 23;
  return letras.charAt(resto);
}

/**
 * Schema for Customer document.
 * @const customerSchema
 * @type {Schema}
 */
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
    unique: true,
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

/**
 * Mongoose model for Customer document.
 * @export
 * @default
 * @type {model<ICustomer>}
 */
export default model<ICustomer>("Customer", customerSchema);
