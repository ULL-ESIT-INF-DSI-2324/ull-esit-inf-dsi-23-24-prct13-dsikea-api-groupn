import { Document, connect, model, Schema } from "mongoose";
// import validator from 'validator';

// connect("mongodb://127.0.0.1:27017/furnitures")
//   .then(() => {
//     console.log("Connected to the furnitures database");
//   })
//   .catch(() => {
//     console.log(
//       "Something went wrong when conecting to the furnitures database",
//     );
//   });

type Dimension = {
  length: number;
  width: number;
  height: number;
};

export interface IFurniture extends Document {
  name: string;
  description: string;
  material: string;
  dimensions: Dimension;
  price: number;
  quantity: number;
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
    enum: ["wood", "metal", "plastic", "glass", "fabric", "leather"],
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
  quantity: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    enum: ["red", "blue", "green", "yellow", "black", "white", "brown"],
    required: true,
  },
});

export default model<IFurniture>("Furniture", furnitureSchema);
