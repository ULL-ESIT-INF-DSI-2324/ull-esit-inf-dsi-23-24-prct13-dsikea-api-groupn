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
  cantity?: number;
  color: string;
}

export const furnitureSchema: Schema = new Schema<IFurniture>({
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
    enum: ["wood", "metal", "plastic", "glass", "fabric", "leather"],
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
  cantity: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    required: true,
    enum: ["red", "blue", "green", "yellow", "black", "white", "brown"],
  }
});

export default model<IFurniture>("Furniture", furnitureSchema);
