import { Document, model, Schema } from "mongoose";
import validator from "validator";

export interface IProvider extends Document {
  name: string;
  contact: string;
  postalCode: string;
  cif: string;
}

export const providerSchema: Schema = new Schema<IProvider>({
  name: { type: String, required: true },
  contact: {
    type: String,
    required: true,
    validate: {
      validator: (value: string) => {
        return validator.isMobilePhone(value, "any");
      },
      message: "Invalid phone number",
    },
  },
  postalCode: {
    type: String,
    required: true,
    validate: {
      validator: (value: string) => {
        return validator.isPostalCode(value, "any");
      },
      message: "Invalid address",
    },
  },
  cif: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: (value: string) => {
        const control = 'JABCDEFGHI';
        const digit = value.slice(1, -1);
        const letter = value.charAt(0);
        const controlDigit = value.slice(-1);
  
        let sum = 0;
        for (let i = 0; i < digit.length; i++) {
          const num = parseInt(digit.charAt(i), 10);
          if (i % 2 === 0) {
            sum += [0, 2, 4, 6, 8, 1, 3, 5, 7, 9][num];
          } else {
            sum += num;
          }
        }
  
        const calculatedControlDigit = sum % 10 === 0 ? 0 : 10 - (sum % 10);
        return (
          /^[ABCDEFGHJNPQRSUVW]{1}/.test(letter) &&
          digit.length === 7 &&
          (controlDigit === calculatedControlDigit.toString() ||
            controlDigit === control.charAt(calculatedControlDigit))
        );
      },
      message: "Invalid CIF",
    },
  },
});

export default model<IProvider>("Provider", providerSchema);
