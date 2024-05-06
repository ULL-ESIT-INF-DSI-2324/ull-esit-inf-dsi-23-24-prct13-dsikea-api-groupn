import { Document, connect, model, Schema } from "mongoose";

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
  contact: { type: String, required: true, validate: (value: string) => {
      if(!value.match(/^\d{3} \d{3} \d{3}$/)){
        throw new Error("Invalid phone number");
      }
    }
  },
  address: { type: String, required: true, validate: (value: string) => {
      if(!value.match(/^\d{1,5} \w{3,}\s\w{3,}\s\w{3,}$/)){
        throw new Error("Invalid address");
      }
    }
  },
  cif: { type: String, required: true, validate: (value: string) => {
      if(!value.match(/^[A-Z]{1}\d{8}$/)){
        throw new Error("Invalid CIF");
      }
    }
  },
});

export default model<IProvider>("Provider", providerSchema);