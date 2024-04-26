import { Document, connect, model, Schema } from "mongoose";

connect("mongodb://127.0.0.1:27017/furnitures")
  .then(() => {
    console.log("Connected to the furnitures database");
  })
  .catch(() => {
    console.log(
      "Something went wrong when conecting to the furnitures database",
    );
  });

type Dimension = {
  length: number;
  width: number;
  height: number;
};

interface IFurniture extends Document {
  id: number;
  name: string;
  description: string;
  material: string;
  dimensions: Dimension;
  price: number;
}

export const furnitureSchema: Schema = new Schema<IFurniture>({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  material: {
    type: String,
    required: true,
  },
  dimensions: {
    type: {
      length: Number,
      width: Number,
      height: Number,
    },
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

export default model<IFurniture>("Furniture", furnitureSchema);
