import express, { Request, Response } from "express";
import Transaction from "../models/transaction.js";
import Customer from "../models/customer.js";
import Provider from "../models/provider.js";
import {
  bodyTransFurniture,
  FurnitureI,
  resetPurchase,
  resetSale,
  getSale,
  getPurchase,
} from "../transactionFunctions.js";

/**
 * Router for handling transaction-related requests.
 */
export const transactionsRouter = express.Router();
transactionsRouter.use(express.json());

/**
 * Handles GET requests for retrieving transactions based on various query parameters.
 * If no query parameters are provided, returns all transactions.
 * If 'dni' query parameter is provided, retrieves transactions associated with a customer's ID number.
 * If 'cif' query parameter is provided, retrieves transactions associated with a provider's CIF number.
 * If 'Idate' and 'Fdate' query parameters are provided, retrieves transactions within a date range.
 * @param {Request} req - The request object containing query parameters.
 * @param {Response} res - The response object.
 * @returns {Response} - The requested transactions or appropriate error message.
 */
transactionsRouter.get("/transactions", async (req: Request, res: Response) => {
  if (Object.keys(req.query).length === 0) {
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

/**
 * Handles GET requests for retrieving a single transaction by its ID.
 * @param {Request} req - The request object containing the transaction ID.
 * @param {Response} res - The response object.
 * @returns {Response} - The requested transaction or appropriate error message.
 */
transactionsRouter.get("/transactions/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id });
    if (transaction) {
      return res.status(201).send(transaction);
    } else {
      return res.status(404).send({ error: "Transaction not found" });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * Handles POST requests for creating new transactions, either sales or purchases.
 * @param {Request} req - The request object containing transaction details.
 * @param {Response} res - The response object.
 * @returns {Response} - The newly created transaction or appropriate error message.
 */
transactionsRouter.post(
  "/transactions",
  async (req: Request, res: Response) => {
    if (req.body.dni && req.body.type === "Sale") {
      try {
        const customer = await Customer.findOne({ dni: req.body.dni });
        if (customer) {
          const furniture = req.body.furniture.map(
            (item: bodyTransFurniture) => ({
              quantity: item.quantity,
              name: item.name,
              material: item.material,
              color: item.color,
            }),
          );
          const saleResult = await getSale(furniture);
          if ("error" in saleResult) {
            return res.status(400).send(saleResult);
          } else {
            const transaction = new Transaction({
              type: req.body.type,
              furniture: saleResult.furniture,
              customer: customer._id,
              date: new Date(),
              price: saleResult.totalPrice,
            });
            const newTransaction = await transaction.save();
            return res.status(201).send(newTransaction);
          }
        } else {
          return res.status(404).send({ error: "Customer not found" });
        }
      } catch (error) {
        console.error(error);
        return res.status(500).send(error);
      }
    } else if (req.body.cif && req.body.type === "Purchase") {
      try {
        const provider = await Provider.findOne({ cif: req.body.cif });
        if (provider) {
          const furniture = req.body.furniture.map((item: FurnitureI) => ({
            name: item.name,
            description: item.description,
            material: item.material,
            dimensions: item.dimensions,
            price: item.price,
            quantity: item.quantity,
            color: item.color,
          }));
          const purchaseResult = await getPurchase(furniture);
          if ("error" in purchaseResult) {
            return res.status(400).send(purchaseResult);
          } else {
            const transaction = new Transaction({
              type: req.body.type,
              furniture: purchaseResult.furniture,
              provider: provider._id,
              date: new Date(),
              price: purchaseResult.totalPrice,
            });
            const newTransaction = await transaction.save();
            return res.status(201).send(newTransaction);
          }
        } else {
          return res.status(404).send({ error: "Provider not found" });
        }
      } catch (error) {
        console.error(error);
        return res.status(500).send(error);
      }
    } else {
      return res.status(400).send({ error: "Invalid transaction type" });
    }
  },
);

/**
 * Handles PATCH requests for updating transactions.
 * @param {Request} req - The request object containing updated transaction information.
 * @param {Response} res - The response object.
 * @returns {Response} - The updated transaction or appropriate error message.
 */
transactionsRouter.patch("/transactions/:id", async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
  });
  let update = false;
  if (!transaction) {
    return res.status(404).send({ error: "Transaction not found" });
  }
  if (req.body.type) {
    return res
      .status(400)
      .send({ error: "You cannot change the type of the transaction" });
  }
  if (req.body.price) {
    return res.status(400).send({
      error:
        "You cannot change the price of the transaction, only if you change the furniture",
    });
  }
  if (req.body.date) {
    Transaction.findByIdAndUpdate(
      { _id: req.params.id },
      { date: req.body.date },
      { new: true, runValidators: true },
    );
    update = true;
  }
  if (transaction.type === "Sale") {
    if (req.body.customer) {
      const customer = await Customer.findOne({ _id: req.body.customer });
      if (customer) {
        Transaction.findByIdAndUpdate(
          { _id: req.params.id },
          { customer: req.body.customer },
          { new: true, runValidators: true },
        );
        update = true;
      } else {
        return res.status(404).send({ error: "Customer not found" });
      }
    } else if (req.body.provider) {
      return res.status(400).send({
        error: "You cannot change the provider of a Sale transaction",
      });
    }
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
      const saleResult = await getSale(furnitureMap);
      if ("error" in saleResult) {
        return res.status(400).send(saleResult);
      } else {
        await Transaction.findOneAndUpdate(
          { _id: req.params.id },
          {
            furniture: saleResult.furniture,
            price: saleResult.totalPrice,
          },
          { new: true, runValidators: true },
        );
        update = true;
      }
    }
  } else if (transaction.type === "Purchase") {
    if (req.body.provider) {
      const provider = await Provider.findOne({ _id: req.body.provider });
      if (provider) {
        Transaction.findByIdAndUpdate(
          { _id: req.params.id },
          { provider: req.body.provider },
          { new: true, runValidators: true },
        );
        update = true;
      } else {
        return res.status(404).send({ error: "Provider not found" });
      }
    } else if (req.body.customer) {
      return res
        .status(400)
        .send({ error: "You must provide the provider on a Purchase" });
    }
    if (req.body.furniture) {
      resetPurchase(transaction.furniture);
      const purchaseResult = await getPurchase(req.body.furniture);
      if ("error" in purchaseResult) {
        return res.status(400).send(purchaseResult);
      } else {
        await Transaction.findOneAndUpdate(
          { _id: req.params.id },
          {
            furniture: purchaseResult.furniture,
            price: purchaseResult.totalPrice,
          },
          { new: true, runValidators: true },
        );
        update = true;
      }
    }
  }
  if (update) {
    return res.status(201).send({ message: "Transaction updated" });
  } else {
    return res.status(400).send({ error: "No valid fields to update" });
  }
});

/**
 * Handles DELETE requests for removing transactions by their ID.
 * If the transaction type is 'Sale', it resets the sale-related furniture stock.
 * If the transaction type is 'Purchase', it resets the purchase-related furniture stock.
 * @param {Request} req - The request object containing the transaction ID.
 * @param {Response} res - The response object.
 * @returns {Response} - Success message or appropriate error message.
 */
transactionsRouter.delete(
  "/transactions/:id",
  async (req: Request, res: Response) => {
    try {
      const transaction = await Transaction.findOne({
        _id: req.params.id,
      });
      if (transaction) {
        if (transaction.type === "Sale") {
          resetSale(transaction.furniture);
          Transaction.findOneAndDelete({ _id: req.params.id });
          return res.status(201).send("Transaction deleted");
        } else if (transaction.type === "Purchase") {
          resetPurchase(transaction.furniture);
          Transaction.findOneAndDelete({ _id: req.params.id });
          return res.status(201).send("Transaction deleted");
        }
      } else {
        return res.status(404).send({ error: "Transaction not found" });
      }
    } catch {
      return res.status(500).send(Error);
    }
  },
);

/**
 * Handles DELETE requests for removing all transactions.
 * @param {Request} req - The request object containing the query parameter 'all'.
 * @param {Response} res - The response object.
 * @returns {Response} - Success message or appropriate error message.
 */
transactionsRouter.delete("/transactions", async (req, res) => {
  try {
    if (req.query.all === "1") {
      await Transaction.deleteMany();
      return res.status(201).send("All transactions deleted");
    } else {
      return res.status(400).send({
        error:
          "You must provide the query parameter 'all' with the value '1' to delete all transactions",
      });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});
