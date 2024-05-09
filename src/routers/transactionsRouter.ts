import express, { Request, Response } from "express";
import Transaction from "../models/transaction.js";
import Customer from "../models/customer.js";
import Provider from "../models/provider.js";
import Furniture from "../models/furniture.js";
import { FurnitureTuple } from "../models/transaction.js";
import { Schema } from "mongoose";

export const transactionsRouter = express.Router();
transactionsRouter.use(express.json());

function resetPurchase (transaction: FurnitureTuple[]) {
  transaction.forEach(async (item: FurnitureTuple) => {
    const foundFurniture = await Furniture.findOne({ _id: item.furniture });
    if (!foundFurniture) {
      return { error: "Furniture not found" };
    }
    const resetQuantity = foundFurniture.quantity - item.quantity;
    Furniture.updateOne({ _id: item.furniture }, { quantity: resetQuantity });
  });
}
function resetSale (transaction: FurnitureTuple[]) {
  transaction.forEach(async (item: FurnitureTuple) => {
    const foundFurniture = await Furniture.findOne({ _id: item.furniture });
    if (!foundFurniture) {
      return { error: "Furniture not found" };
    }
    const resetQuantity = foundFurniture.quantity + item.quantity;
    Furniture.updateOne({ _id: item.furniture }, { quantity: resetQuantity });
  });
}

function getSale(furniture: bodyTransFurniture[]) {
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
  return {furniture: foundFurniture, tPrice: tPrice};
}

function getPurchase (furniture: bodyTransFurniture[]){
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
  return {furniture: foundFurniture, tPrice: tPrice};
}

interface bodyTransFurniture {
  quantity: number;
  name: string;
  material: string;
  color: string;
}

transactionsRouter.get("/transactions", async (req: Request, res: Response) => {
  if (!req.query) {
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
  } else {
    if (req.query.dni) {
      try {
        const customer = await Customer.findOne({ dni: req.query.dni });
        if (customer) {
          const transactions = await Transaction.find({
            customer: customer._id,
          });
          if (transactions) {
            return res.send(transactions);
          } else {
            return res.status(404).send({ error: "Transactions not found" });
          }
        } else {
          return res.status(404).send({ error: "Customer not found" });
        }
      } catch (error) {
        return res.status(500).send(error);
      }
    } else if (req.query.cif) {
      try {
        const provider = await Provider.findOne({ cif: req.query.cif });
        if (provider) {
          const transactions = await Transaction.find({
            provider: provider._id,
          });
          if (transactions) {
            return res.send(transactions);
          } else {
            return res.status(404).send({ error: "Transactions not found" });
          }
        } else {
          return res.status(404).send({ error: "Customer not found" });
        }
      } catch (error) {
        return res.status(500).send(error);
      }
    } else if (req.query.Idate && req.query.Fdate) {
      try {
        const transactions = await Transaction.find({
          date: { $gte: req.query.Idate, $lte: req.query.Fdate },
        });
        if (transactions) {
          return res.send(transactions);
        } else {
          return res.status(404).send({ error: "Transactions not found" });
        }
      } catch (error) {
        return res.status(500).send(error);
      }
    }
  }
});

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

transactionsRouter.get("/transactions", async (req: Request, res: Response) => {
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

transactionsRouter.post("/transactions", async (req, res) => {
  if (req.body.dni && req.body.type === "Sale") {
    try {
      const customer = await Customer.findOne({ dni: req.query.dni });
      if (customer) {
        const furniture = req.body.furniture.map(
          (item: bodyTransFurniture) => ({
            quantity: item.quantity,
            name: item.name,
            material: item.material,
            color: item.color,
          }),
        );
        if(!getSale(furniture).furniture){
          return res.status(400).send(getSale(furniture));
        } else {
        const transaction = new Transaction({
          type: req.body.type,
          furniture: getSale(furniture).furniture,
          customer: customer._id,
          time: req.body.time,
          date: req.body.date,
          totalPrice: getSale(furniture).tPrice,
        });
        const newTransaction = await transaction.save();
        return res.status(201).send(newTransaction);
      }
    } else {
      return res.status(404).send({ error: "Customer not found" });
    }
    } catch (error) {
      return res.status(500).send(error);
    }
  } else if (req.query.cif && req.query.type === "Purchase") {
    try {
      const provider = await Provider.findOne({ cif: req.query.cif });
      if (provider) {
        const furniture = req.body.furniture.map(
          (item: bodyTransFurniture) => ({
            quantity: item.quantity,
            name: item.name,
            material: item.material,
            color: item.color,
          }),
        );
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
      } else {
        return res.status(404).send({ error: "Provider not found" });
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  }
});

// Actualizar transacciones
transactionsRouter.patch("/transactions:id", async (req, res) => {
    const transaction = await Transaction.findOneAndUpdate({ _id: req.params.id });
    if (transaction) {
      if (transaction.type === "Sale") {
        // Como no se si se van a cambiar los muebles pondré todo el stock a como estaba antes sumando, esto lo haré solo si el usuario desea cambiar los muebles.
        if (req.body.furniture) {
          resetSale(transaction.furniture);
          const furnitureMap = req.body.furniture.map(
            (item: bodyTransFurniture) => ({
              quantity: item.quantity,
              name: item.name,
              material: item.material,
              color: item.color,
            }),
          );
        if (!getSale(furnitureMap).furniture) {
          return res.status(400).send(getSale(req.body.furniture));
        } else {
          const foundFurniture = getSale(req.body.furniture).furniture;
          const tPrice = getSale(req.body.furniture).tPrice;
          Transaction.findOneAndUpdate(
            { _id: req.params.id },
            {
              furniture: foundFurniture,
              totalPrice: tPrice,
            },
            { new: true, runValidators: true },
          );
        }
      }
      } else if (transaction.type === "Purchase") {
        // Como no se si se van a cambiar los muebles pondré el stock como estaba antes restando, solo si el usuario quiere cambiar los muebles.
        if (req.body.furniture) {    
          resetPurchase(transaction.furniture);
          if (!getPurchase(req.body.furniture).furniture) {
            return res.status(400).send(getPurchase(req.body.furniture));
          } else {
          const foundFurniture = getPurchase(req.body.furniture).furniture;
          const tPrice = getPurchase(req.body.furniture).tPrice;
          Transaction.findOneAndUpdate(
            { _id: req.params.id },
            {
              furniture: foundFurniture,
              totalPrice: tPrice,
            },
            { new: true, runValidators: true },
          );
          }
        }

        
    }
    } else {
      return res.status(404).send({ error: "Transaction not found" });
    }
});

transactionsRouter.delete(
  "/transactions/:id",
  async (req: Request, res: Response) => {
    try {
      const transaction = await Transaction.findOne({
        _id: req.params.id,
      });
      if(transaction) {
        if(transaction.type === "Sale") {
          resetSale(transaction.furniture);
          Transaction.findOneAndDelete({ _id: req.params.id });
        } else {
          resetPurchase(transaction.furniture);
          Transaction.findOneAndDelete({ _id: req.params.id });
          // Borrar muebles que se han creado?
        }
      } else {
        return res.status(404).send({ error: "Transaction not found" });
      }
  }catch{
    return res.status(500).send(Error);
  }
});
