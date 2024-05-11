import Furniture, { IFurniture } from "./models/furniture.js";
import { FurnitureTuple } from "./models/transaction.js";

/**
 * Interface for the body of a transaction containing furniture details.
 */
export interface bodyTransFurniture {
  quantity: number;
  name: string;
  material: string;
  color: string;
}

export interface FurnitureI {
  name: string;
  description: string;
  material: string;
  dimensions: { length: number; width: number; height: number };
  price: number;
  quantity: number;
  color: string;
}

export type TransactionType = {
  type: string;
  provider?: string;
  customer?: string;
  furniture: { furniture: string; quantity: number }[];
  date: Date;
  price: number;
};

/**
 * Resets the quantity of furniture items involved in a purchase transaction.
 * @param transaction - The array of furniture items involved in the transaction.
 */
export async function resetPurchase(transaction: FurnitureTuple[]) {
  for (const item of transaction) {
    const foundFurniture = await Furniture.findOne({ _id: item.furniture });
    if (!foundFurniture) {
      return { error: "Furniture not found" };
    }
    const resetQuantity = foundFurniture.quantity - item.quantity;
    Furniture.updateOne({ _id: item.furniture }, { quantity: resetQuantity });
  }
}

/**
 * Resets the quantity of furniture items involved in a sale transaction.
 * @param transaction - The array of furniture items involved in the transaction.
 */
export async function resetSale(transaction: FurnitureTuple[]) {
  for (const item of transaction) {
    const foundFurniture = await Furniture.findOne({ _id: item.furniture });
    if (!foundFurniture) {
      return { error: "Furniture not found" };
    }
    const resetQuantity = foundFurniture.quantity + item.quantity;
    Furniture.updateOne({ _id: item.furniture }, { quantity: resetQuantity });
  }
}

/**
 * Calculates the total price and gathers furniture items for a sale transaction.
 * @param furniture - The array of furniture items in the transaction.
 * @returns The furniture items and the total price of the transaction.
 */
/**
 * Calculates the total price and gathers furniture items for a sale transaction.
 * @param furniture - The array of furniture items in the transaction.
 * @returns The furniture items and the total price of the transaction.
 */
export async function getSale(
  furniture: bodyTransFurniture[],
): Promise<
  | { furniture: { furniture: string; quantity: number }[]; totalPrice: number }
  | { error: string }
> {
  let tPrice: number = 0;
  const foundFurniture: [string, number][] = [];
  for (const item of furniture) {
    const foundFurnitureName = await Furniture.find({ name: item.name });
    if (foundFurnitureName.length === 0) {
      return { error: "Furniture name not found" };
    }
    const foundFurnitureMaterial = await Furniture.find({
      name: item.name,
      material: item.material,
    });
    if (foundFurnitureMaterial.length === 0) {
      return {
        error: "Furniture material not found",
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
      };
    }
    if (item.quantity <= 0) {
      return {
        error: "Quantity must be a positive number",
      };
    }
    if (foundFurnitureColor.quantity < item.quantity) {
      return {
        error: "Not enough quantity",
      };
    }
    await Furniture.updateOne(
      { _id: foundFurnitureColor._id },
      { quantity: foundFurnitureColor.quantity - item.quantity },
    );
    tPrice += foundFurnitureColor.price * item.quantity;
    foundFurniture.push([foundFurnitureColor._id, item.quantity]);
  }
  // console.log("Antes de enviar: ", foundFurniture, tPrice);
  const formattedFurniture = foundFurniture.map(([furniture, quantity]) => ({
    furniture,
    quantity,
  }));
  return { furniture: formattedFurniture, totalPrice: tPrice };
}

/**
 * Calculates the total price and gathers furniture items for a purchase transaction.
 * @param furniture - The array of furniture items in the transaction.
 * @returns The furniture items and the total price of the transaction.
 */
export async function getPurchase(
  furniture: IFurniture[],
): Promise<
  | { furniture: { furniture: string; quantity: number }[]; totalPrice: number }
  | { error: string }
> {
  let tPrice: number = 0;
  const foundFurniture: [string, number][] = [];
  for (const item of furniture) {
    let foundFurnitureObject = await Furniture.findOne({
      name: item.name,
      material: item.material,
      color: item.color,
    });
    if (item.quantity <= 0) {
      return {
        error: "Quantity must be a positive number",
      };
    }
    if (!foundFurnitureObject) {
      foundFurnitureObject = new Furniture(item);
    } else {
      await Furniture.updateOne(
        { _id: foundFurnitureObject._id },
        { quantity: foundFurnitureObject.quantity + item.quantity },
      );
    }
    tPrice += foundFurnitureObject.price * item.quantity;
    foundFurniture.push([foundFurnitureObject._id, item.quantity]);
  }
  // console.log("Antes de enviar: ", foundFurniture, tPrice);
  const formattedFurniture = foundFurniture.map(([furniture, quantity]) => ({
    furniture,
    quantity,
  }));
  return { furniture: formattedFurniture, totalPrice: tPrice };
}
