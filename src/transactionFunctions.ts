import Furniture from "./models/furniture.js";
import { FurnitureTuple } from "./models/transaction.js";
import { Schema } from "mongoose";

/**
 * Interface for the body of a transaction containing furniture details.
 */
export interface bodyTransFurniture {
  quantity: number;
  name: string;
  material: string;
  color: string;
}

export type TransactionType = {
  type: string;
  provider?: string;
  customer?: string;
  furniture: { furniture: string; quantity: number; }[];
  date: Date;
  price: number;
};

/**
 * Resets the quantity of furniture items involved in a purchase transaction.
 * @param transaction - The array of furniture items involved in the transaction.
 */
export function resetPurchase(transaction: FurnitureTuple[]) {
  transaction.forEach(async (item: FurnitureTuple) => {
    const foundFurniture = await Furniture.findOne({ _id: item.furniture });
    if (!foundFurniture) {
      return { error: "Furniture not found" };
    }
    const resetQuantity = foundFurniture.quantity - item.quantity;
    Furniture.updateOne({ _id: item.furniture }, { quantity: resetQuantity });
  });
}

/**
 * Resets the quantity of furniture items involved in a sale transaction.
 * @param transaction - The array of furniture items involved in the transaction.
 */
export function resetSale(transaction: FurnitureTuple[]) {
  transaction.forEach(async (item: FurnitureTuple) => {
    const foundFurniture = await Furniture.findOne({ _id: item.furniture });
    if (!foundFurniture) {
      return { error: "Furniture not found" };
    }
    const resetQuantity = foundFurniture.quantity + item.quantity;
    Furniture.updateOne({ _id: item.furniture }, { quantity: resetQuantity });
  });
}

/**
 * Calculates the total price and gathers furniture items for a sale transaction.
 * @param furniture - The array of furniture items in the transaction.
 * @returns The furniture items and the total price of the transaction.
 */
export function getSale(furniture: bodyTransFurniture[]) {
  let tPrice: number = 0;
  const foundFurniture: [Schema.Types.ObjectId, number][] = [];
  furniture.forEach(async (item: bodyTransFurniture) => {
    const foundFurnitureName = await Furniture.find({ name: item.name });
    if (!foundFurnitureName) {
      return { error: "Furniture name not found" };
    }
    const foundFurnitureMaterial = await Furniture.find({
      name: item.name,
      material: item.material,
    });
    if (!foundFurnitureMaterial) {
      return {
        error: "Furniture material not found",
        furnitures: foundFurnitureName,
      };
    }
    const foundFurnitureColor = await Furniture.findOne({
      name: item.name,
      material: item.material,
      color: item.color,
    });
    if (!foundFurnitureColor) {
      return {
        error: "Furniture color not found",
        furnitures: foundFurnitureMaterial,
      };
    }
    Furniture.findOneAndUpdate(
      { _id: foundFurnitureColor._id },
      { quantity: foundFurnitureColor.quantity + item.quantity },
    );
    tPrice += foundFurnitureColor.price * item.quantity;
    foundFurniture.push([foundFurnitureColor._id, item.quantity]);
  });
  return { furniture: foundFurniture, tPrice: tPrice };
}

/**
 * Calculates the total price and gathers furniture items for a purchase transaction.
 * @param furniture - The array of furniture items in the transaction.
 * @returns The furniture items and the total price of the transaction.
 */
export function getPurchase(furniture: bodyTransFurniture[]) {
  let tPrice: number = 0;
  const foundFurniture: [Schema.Types.ObjectId, number][] = [];
  furniture.forEach(async (item: bodyTransFurniture) => {
    const foundFurnitureName = await Furniture.find({ name: item.name });
    if (!foundFurnitureName) {
      return { error: "Furniture name not found" };
    }
    const foundFurnitureMaterial = await Furniture.find({
      name: item.name,
      material: item.material,
    });
    if (!foundFurnitureMaterial) {
      return {
        error: "Furniture material not found",
        furnitures: foundFurnitureName,
      };
    }
    const foundFurnitureColor = await Furniture.findOne({
      name: item.name,
      material: item.material,
      color: item.color,
    });
    if (!foundFurnitureColor) {
      return {
        error: "Furniture color not found",
        furnitures: foundFurnitureMaterial,
      };
    }
    Furniture.findOneAndUpdate(
      { _id: foundFurnitureColor._id },
      { quantity: foundFurnitureColor.quantity + item.quantity },
    );
    tPrice += foundFurnitureColor.price * item.quantity;
    foundFurniture.push([foundFurnitureColor._id, item.quantity]);
  });
  return { furniture: foundFurniture, tPrice: tPrice };
}
