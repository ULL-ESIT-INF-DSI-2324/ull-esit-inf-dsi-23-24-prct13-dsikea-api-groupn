import { Document, connect, model, Schema } from "mongoose";
import validator from 'validator';

connect("mongodb://127.0.0.1:27017/providers")
  .then(() => {
    console.log("Connected to the providers database");
  })
  .catch(() => {
    console.log(
      "Something went wrong when conecting to the providers database",
    );
  });

interface IProvider extends Document {
  name: string;
  contact: string;
  address: string;
  cif: string;
}

export const providerSchema: Schema = new Schema<IProvider>({
  name: { type: String, required: true },
  contact: {
    type: String,
    required: true,
    validate: {
      validator: (value: string) => {
        return validator.isMobilePhone(value, 'any');
      },
      message: "Invalid phone number"
    }
  },
  address: {
    type: String,
    required: true,
    validate: {
      validator: (value: string) => {
        return validator.isPostalCode(value, 'any');
      },
      message: "Invalid address"
    }
  },
  cif: {
    type: String,
    required: true,
    validate: {
      validator: (value: string) => {
        return validator.isAlphanumeric(value) && value.length === 9 && value[0] === value[0].toUpperCase();
      },
      message: "Invalid CIF"
    }
  },
});

export default model<IProvider>("Provider", providerSchema);
