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

const findFurniture = async (
  furniture: FurnitureReqI[],
  res: Response,
): Promise<FurnitureReqI[]> => {
  const foundFurniture: FurnitureReqI[] = [];
  // Check if the furniture exists and has enough quantity
  for (const item of furniture) {
    // Check if the furniture name exists
    const foundFurnitureName = await Furniture.findOne({ name: item.name });
    if (!foundFurnitureName) {
      res.status(404).send({ error: "Furniture name not found" });
      return [];
    }

    // Check if the furniture material exists
    const foundFurnitureMaterial = await Furniture.findOne({
      name: item.name,
      material: item.material,
    });
    if (!foundFurnitureMaterial) {
      res.status(404).send({
        error: "Furniture material not found",
        furnitures: foundFurnitureName,
      });
      return [];
    }

    // Check if the furniture color exists
    const foundFurnitureColor = await Furniture.findOne({
      name: item.name,
      material: item.material,
      color: item.color,
    });
    if (!foundFurnitureColor) {
      res.status(404).send({
        error: "Furniture color not found",
        furnitures: foundFurnitureMaterial,
      });
      return [];
    }

    // Check if there is enough quantity of the furniture
    if (foundFurnitureColor.quantity < item.quantity) {
      res.status(400).send({ error: "Not enough quantity furniture" });
      return [];
    }

    // Push the furniture object to the foundFurniture array
    foundFurniture.push({
      quantity: item.quantity,
      name: item.name,
      description: item.description,
      material: item.material,
      dimensions: item.dimensions,
      price: item.price,
      color: item.color,
    });
  }
  return foundFurniture;
};

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

/**
 * POST a new transaction
 * @route POST /transactions/:dni
 * @param req - The request object containing the customer's dni in the params and furniture details in the body
 * @param res - The response object
 * @returns The created transaction object
 */
transactionsRouter.post("/transactions/customer/:dni", async (req, res) => {
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
        price: item.price,
      }));

      const foundFurniture: FurnitureReqI[] = await findFurniture(
        furniture,
        res,
      );

      // Check if any furniture was found
      if (!foundFurniture) {
        return res.status(404).send({ error: "Furniture not found" });
      }

      let totalPrice = 0;
      // Calculate the total price
      foundFurniture.forEach(async (item: FurnitureReqI) => {
        const furniture = await Furniture.findById(item);
        if (furniture) {
          totalPrice += furniture.price * furniture.quantity;
        }
      });

      // Create a new transaction object
      const transaction = new Transaction({
        type: req.body.type,
        furniture: foundFurniture,
        customer: customer._id,
        date: new Date(),
        price: totalPrice,
      });

      // Save the transaction to the database
      const newTransaction = await transaction.save();

      // Subtract the quantity of the furniture from the database
      for (const item of furniture) {
        const foundFurnitureColor = await Furniture.findOne({
          name: item.name,
          material: item.material,
          color: item.color,
        });
        if (foundFurnitureColor != null) {
          foundFurnitureColor.quantity -= item.quantity;
          await foundFurnitureColor.save();
        }
      }

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
transactionsRouter.post("/transactions/provider/:cif", async (req, res) => {
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
      let totalPrice = 0;
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
        totalPrice += item.price * item.quantity;
      }

      // Create a new transaction object
      const transaction = new Transaction({
        type: req.body.type,
        furniture: furnitureIDs,
        provider: provider._id,
        date: new Date(),
        price: totalPrice,
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

// Actualizar transacciones

//transactionsRouter.patch("/transactions:id", async (req, res) => {
//   if (!transaction) {
//    return res.status(404).send({ error: "Transaction not found" });
//  }
//  const transaction = await Transaction.findOneAndUpdate({ _id: req.params.id });

//});

//haz el modify de trasactuons router



transactionsRouter.patch("/transactions" ,  async (req: Request, res: Response) => {
  try {
    const transaction = await Transaction.findOneAndUpdate({ _id: req.body.id } , req.body);
    if (transaction) {
      res.status(200).send(transaction);  
    } else {
      res.status(404).send({ error: "Transaction not found" });
    }
  } catch (error) {
    res.status( 500).send(error );
  }
},
);






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
