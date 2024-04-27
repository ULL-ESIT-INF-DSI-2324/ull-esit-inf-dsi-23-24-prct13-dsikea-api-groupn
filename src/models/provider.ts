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
  contact: { type: String, required: true },
  address: { type: String, required: true },
  cif: { type: String, required: true },
});

export default model<IProvider>("Provider", providerSchema);