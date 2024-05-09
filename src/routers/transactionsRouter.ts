import express, { Request, Response } from "express";
import Transaction from "../models/transaction.js";
import Customer from "../models/customer.js";
import Provider from "../models/provider.js";
import Furniture from "../models/furniture.js";
import { Schema } from "mongoose";

export const transactionsRouter = express.Router();
transactionsRouter.use(express.json());

interface bodyTransFurniture {
  quantity: number;
  name: string;
  material: string;
  color: string;
}
// Función que busaca los ids de los muebles (La ppide en informe). MIrar tambien condiciones de las fechas y horas.
function furnituresId(furnitures: bodyTransFurniture[]) {
  const foundFurniture: [Schema.Types.ObjectId, number][] = [];
  let tPrice: number = 0;
  furnitures.forEach(async (item: bodyTransFurniture) => {
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
    if (foundFurnitureColor.quantity < item.quantity) {
      return { error: "Not enough furniture" };
    } else {
      Furniture.findOneAndUpdate(
        { _id: foundFurnitureColor._id },
        { quantity: foundFurnitureColor.quantity - item.quantity },
      );
    }
    tPrice += foundFurnitureColor.price * item.quantity;
    foundFurniture.push([foundFurnitureColor._id, item.quantity]);
  });
  return { foundFurniture, tPrice };
}

transactionsRouter.get("/transactions", async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find();
    if (transactions) {
      return res.send(transactions);
    } else {
      return res.status(404).send({ error: "Transactions not found" });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

transactionsRouter.get(
  "/transactions/:type",
  async (req: Request, res: Response) => {
    try {
      const customer = await Transaction.find({ type: req.params.type });
      if (customer) {
        return res.send(customer);
      } else {
        return res.status(404).send({ error: "Customer not found" });
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  },
);

transactionsRouter.get("/transactions/:id", async (req, res) => {
  try {
    const customer = await Transaction.findOne({ id: req.params.id });
    if (customer) {
      return res.send(customer);
    } else {
      return res.status(404).send({ error: "Customer not found" });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

transactionsRouter.post("/transactions:dni", async (req, res) => {
  try {
    const customer = await Customer.findOne({ dni: req.params.dni });
    if (customer) {
      const furniture = req.body.furniture.map((item: bodyTransFurniture) => ({
        quantity: item.quantity,
        name: item.name,
        material: item.material,
        color: item.color,
      }));
      const foundFurniture: [Schema.Types.ObjectId, number][] = [];
      let tPrice: number = 0;
      furniture.forEach(async (item: bodyTransFurniture) => {
        const foundFurnitureName = await Furniture.find({ name: item.name });
        if (!foundFurnitureName) {
          return res.status(404).send({ error: "Furniture name not found" });
        }
        const foundFurnitureMaterial = await Furniture.find({
          name: item.name,
          material: item.material,
        });
        if (!foundFurnitureMaterial) {
          return res.status(404).send({
            error: "Furniture material not found",
            furnitures: foundFurnitureName,
          });
        }
        const foundFurnitureColor = await Furniture.findOne({
          name: item.name,
          material: item.material,
          color: item.color,
        });
        if (!foundFurnitureColor) {
          return res.status(404).send({
            error: "Furniture color not found",
            furnitures: foundFurnitureMaterial,
          });
        }
        if (foundFurnitureColor.quantity < item.quantity) {
          return res.status(400).send({ error: "Not enough furniture" });
        } else {
          Furniture.findOneAndUpdate(
            { _id: foundFurnitureColor._id },
            { quantity: foundFurnitureColor.quantity - item.quantity },
          );
        }
        tPrice += foundFurnitureColor.price * item.quantity;
        foundFurniture.push([foundFurnitureColor._id, item.quantity]);
      });
      const transaction = new Transaction({
        type: req.body.type,
        furniture: foundFurniture,
        customer: customer._id,
        time: req.body.time,
        date: req.body.date,
        totalPrice: tPrice,
      });
      const newTransaction = await transaction.save();
      return res.status(201).send(newTransaction);
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

transactionsRouter.post("/transactions:cif", async (req, res) => {
  try {
    const provider = await Provider.findOne({ cif: req.params.cif });
    if (provider) {
      const furniture = req.body.furniture.map((item: bodyTransFurniture) => ({
        quantity: item.quantity,
        name: item.name,
        material: item.material,
        color: item.color,
      }));
      let tPrice: number = 0;
      const foundFurniture: [Schema.Types.ObjectId, number][] = [];
      furniture.forEach(async (item: bodyTransFurniture) => {
        const foundFurnitureName = await Furniture.find({ name: item.name });
        if (!foundFurnitureName) {
          return res.status(404).send({ error: "Furniture name not found" });
        }
        const foundFurnitureMaterial = await Furniture.find({
          name: item.name,
          material: item.material,
        });
        if (!foundFurnitureMaterial) {
          return res.status(404).send({
            error: "Furniture material not found",
            furnitures: foundFurnitureName,
          });
        }
        const foundFurnitureColor = await Furniture.findOne({
          name: item.name,
          material: item.material,
          color: item.color,
        });
        if (!foundFurnitureColor) {
          return res.status(404).send({
            error: "Furniture color not found",
            furnitures: foundFurnitureMaterial,
          });
        }
        Furniture.findOneAndUpdate(
          { _id: foundFurnitureColor._id },
          { quantity: foundFurnitureColor.quantity + item.quantity },
        );
        tPrice += foundFurnitureColor.price * item.quantity;
        foundFurniture.push([foundFurnitureColor._id, item.quantity]);
      });
      const transaction = new Transaction({
        type: req.body.type,
        furniture: foundFurniture,
        provider: provider._id,
        time: req.body.time,
        date: req.body.date,
        totalPrice: tPrice,
      });
      const newTransaction = await transaction.save();
      return res.status(201).send(newTransaction);
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

// Actualizar transacciones
//transactionsRouter.patch("/transactions:id", async (req, res) => {
//   if (!transaction) {
//    return res.status(404).send({ error: "Transaction not found" });
//  }
//  const transaction = await Transaction.findOneAndUpdate({ _id: req.params.id });
//});

transactionsRouter.delete(
  "/transactions/:id",
  async (req: Request, res: Response) => {
    try {
      const transaction = await Transaction.findOneAndDelete({
        _id: req.params.id,
      });
      if (transaction) {
        res.send({ message: "Transaction deleted" });
      } else {
        res.status(404).send({ error: "Transaction not found" });
      }
    } catch (error) {
      res.status(500).send(error);
    }
  },
);
