import { Document, model, Schema } from "mongoose";
// import validator from 'validator';

/**
 * Type for the dimensions of a furniture item.
 * @typedef Dimension
 * @property {number} length - The length of the furniture item.
 * @property {number} width - The width of the furniture item.
 * @property {number} height - The height of the furniture item.
 */
type Dimension = {
  length: number;
  width: number;
  height: number;
};

/**
 * Interface for Furniture document.
 * @interface IFurniture
 * @extends {Document}
 */
export interface IFurniture extends Document {
  name: string;
  description: string;
  material: string;
  dimensions: Dimension;
  price: number;
  quantity: number;
  color: string;
}

/**
 * Schema for Furniture document.
 * @const furnitureSchema
 * @type {Schema}
 */
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
    validate: {
      validator: function (value: number) {
        return value >= 0;
      },
      message: "Quantity must be a non-negative number",
    },
  },
  color: {
    type: String,
    enum: ["red", "blue", "green", "yellow", "black", "white", "brown"],
    required: true,
  },
});

/**
 * Mongoose model for Furniture document.
 * @export
 * @default
 * @type {model<IFurniture>}
 */
export default model<IFurniture>("Furniture", furnitureSchema);
