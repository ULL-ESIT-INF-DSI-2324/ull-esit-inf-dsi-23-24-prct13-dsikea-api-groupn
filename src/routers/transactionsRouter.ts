import express, { Request, Response } from "express";
import Transaction from "../models/transaction.js";
import Customer from "../models/customer.js";
import Provider from "../models/provider.js";
import Furniture from "../models/furniture.js";
import { Schema } from "mongoose";
//usar express no touters.
export const transactionsRouter = express.Router();
transactionsRouter.use(express.json());

// GET all providers
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

transactionsRouter.get("/transactions/:type", async (req: Request, res: Response) => {
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
});

// GET a specific provider by ID
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

// POST a new provider
transactionsRouter.post("/transactions:dni", async (req, res) => {
  try {
    const customer = await Customer.findOne({ dni: req.params.dni });
    if (customer) {
      const furniture = req.body.furniture.map((item: any) => ({ // Añadir interfaz de item
        quantity: item.quantity,
        name: item.name,
        material: item.material,
        color: item.color,
      }));
      const foundFurniture: [Schema.Types.ObjectId, number][] = []; // Añadir interfaz
      furniture.forEach(async (item: any) => { // Añadir interfaz de item
        const foundFurnitureName = await Furniture.find({ name: item.name });
        if (!foundFurnitureName) {
          return res.status(404).send({ error: "Furniture name not found" });
        }
        const foundFurnitureMaterial = await Furniture.find({ name: item.name, material: item.material });
        if (!foundFurnitureMaterial) {
          return res.status(404).send({ error: "Furniture material not found", furnitures: foundFurnitureName });
        }
        const foundFurnitureColor = await Furniture.findOne({ name: item.name ,material: item.material, color: item.color });
        if (!foundFurnitureColor) {
          return res.status(404).send({ error: "Furniture color not found", furnitures: foundFurnitureMaterial });
        }
        if (foundFurnitureColor.quantity < item.quantity) {
          return res.status(400).send({ error: "Not enough furniture" });
        }
        foundFurniture.push([foundFurnitureColor._id, item.quantity]);
      });
      // Recorrer array de busqueda de muebles

      const transaction = new Transaction({
        type: req.body.type,
        furniture: foundFurniture,
        customer: customer._id,
      });
      const newTransaction = await transaction.save();
      return res.status(201).send(newTransaction);
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

transactionsRouter.patch("/customers:contact", async (req, res) => {
  try {
    const allowedUpdates = ["name", "contact", "address", "dni"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidUpdate) {
      return res.status(400).send({
        error: "Update is not permitted",
      });
    }
    const customer = await Customer.findOneAndUpdate(
      { contact: req.params.contact },
      req.body,
      { new: true, runValidators: true },
    );
    if (customer) {
      return res.send(customer);
    }
    return res.status(404).send({ error: "Customer not found" });
  } catch (error) {
    return res.status(400).send(error);
  }
});

transactionsRouter.patch("/customers/:id", async (req, res) => {
  try {
    const allowedUpdates = ["name", "contact", "address", "dni"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidUpdate) {
      return res.status(400).send({
        error: "Update is not permitted",
      });
    }
    const provider = await Customer.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true },
    );
    if (provider) {
      return res.send(provider);
    }
    return res.status(404).send({ error: "Customer not found" });
  } catch (error) {
    return res.status(400).send(error);
  }
});

// DELETE a provider by CIF
transactionsRouter.delete("/customers/:dni", async (req, res) => {
  try {
    const provider = await Customer.findOneAndDelete({ dni: req.params.dni });
    if (provider) {
      res.send({ message: "Customer deleted" });
    } else {
      res.status(404).send({ error: "Customer not found" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

// DELETE a provider by ID
transactionsRouter.delete("/customers/:id", async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id });
    if (customer) {
      res.send({ message: "Customer deleted" });
    } else {
      res.status(404).send({ error: "Cutomer not found" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});