import express, { Request, Response } from "express";
import Transaction from "../models/transaction.js";
import Customer from "../models/customer.js";
import Provider from "../models/provider.js";
import Furniture from "../models/furniture.js";
//usar express no touters.
export const transactionsRouter = express.Router();
transactionsRouter.use(express.json());

interface FurnitureReqI {
  quantity: number;
  name: string;
  description: string;
  material: string;
  dimensions: string;
  price: number;
  color: string;
}

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

const findFurniture = async (furniture: FurnitureReqI[], res: Response) => {
  const foundFurniture = [];
  // Check if the furniture exists and has enough quantity
  for (const item of furniture) {
    // Check if the furniture name exists
    const foundFurnitureName = await Furniture.findOne({ name: item.name });
    if (!foundFurnitureName) {
      return res.status(404).send({ error: "Furniture name not found" });
    }

    // Check if the furniture material exists
    const foundFurnitureMaterial = await Furniture.findOne({
      name: item.name,
      material: item.material,
    });
    if (!foundFurnitureMaterial) {
      return res.status(404).send({
        error: "Furniture material not found",
        furnitures: foundFurnitureName,
      });
    }

    // Check if the furniture color exists
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

    // Check if there is enough quantity of the furniture
    if (foundFurnitureColor.quantity < item.quantity) {
      return res.status(400).send({ error: "Not enough furniture" });
    }

    // Push the furniture id to the foundFurniture array
    foundFurniture.push(foundFurnitureColor._id);
  }
  return foundFurniture;
};

/**
 * POST a new transaction
 * @route POST /transactions/:dni
 * @param req - The request object containing the customer's dni in the params and furniture details in the body
 * @param res - The response object
 * @returns The created transaction object
 */
transactionsRouter.post("/transactions/:dni", async (req, res) => {
  try {
    // Find the customer by dni
    const customer = await Customer.findOne({ dni: req.params.dni });
    if (customer) {
      // Map the furniture details from the request body
      const furniture = req.body.furniture.map((item: FurnitureReqI) => ({
        quantity: item.quantity,
        name: item.name,
        material: item.material,
        color: item.color,
      }));

      const foundFurniture = await findFurniture(furniture, res);

      // Check if any furniture was found
      if (!foundFurniture) {
        return res.status(404).send({ error: "Furniture not found" });
      }

      // Create a new transaction object
      const transaction = new Transaction({
        type: req.body.type,
        furniture: foundFurniture,
        customer: customer._id,
      });

      // Save the transaction to the database
      const newTransaction = await transaction.save();

      // Return the created transaction object
      return res.status(201).send(newTransaction);
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * POST a new transaction
 * @route POST /transactions/:cif
 * @param req - The request object containing the provider's cif in the params and furniture details in the body
 * @param res - The response object
 * @returns The created transaction object
 */
transactionsRouter.post("/transactions/:cif", async (req, res) => {
  try {
    // Find the provider by cif
    const provider = await Provider.findOne({ cif: req.params.cif });
    if (provider) {
      // Map the furniture details from the request body
      const furniture = req.body.furniture.map((item: FurnitureReqI) => ({
        quantity: item.quantity,
        name: item.name,
        description: item.description,
        material: item.material,
        dimensions: item.dimensions,
        price: item.price,
        color: item.color,
      }));

      const furnitureIDs = [];
      // Create and save the furniture objects or update existing ones
      for (const item of furniture) {
        // Check if the furniture already exists
        const existingFurniture = await Furniture.findOne({
          name: item.name,
          material: item.material,
          color: item.color,
        });
        if (existingFurniture) {
          // Update the quantity of the existing furniture
          existingFurniture.quantity += item.quantity;
          // Save the updated furniture to the database
          const updatedFurniture = await existingFurniture.save();
          // Push the furniture id to the furnitureToUpdate array
          furnitureIDs.push(updatedFurniture._id);
        } else {
          // Create a new furniture object
          const newFurniture = new Furniture(item);
          // Save the furniture to the database
          const savedFurniture = await newFurniture.save();
          // Push the furniture id to the furnitureToCreate array
          furnitureIDs.push(savedFurniture._id);
        }
      }

      // Create a new transaction object
      const transaction = new Transaction({
        type: req.body.type,
        furniture: furnitureIDs,
        provider: provider._id,
      });
      // Save the transaction to the database
      const newTransaction = await transaction.save();
      // Return the created transaction object
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
transactionsRouter.delete(
  "/customers/:id",
  async (req: Request, res: Response) => {
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
  },
);
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
