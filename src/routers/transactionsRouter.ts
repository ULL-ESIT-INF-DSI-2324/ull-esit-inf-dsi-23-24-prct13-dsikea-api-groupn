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
transactionsRouter.get(
  "/transactions/:id",
  async (req: Request, res: Response) => {
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
  },
);

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
          // console.log(furniture);
          const saleResult = await getSale(furniture);
          if ("error" in saleResult) {
            return res.status(400).send(saleResult);
          } else {
            // console.log(saleResult);
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
          // console.log(furniture);
          const purchaseResult = await getPurchase(furniture);
          if ("error" in purchaseResult) {
            return res.status(400).send(purchaseResult);
          } else {
            // console.log(purchaseResult);
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
transactionsRouter.patch(
  "/transactions:id",
  async (req: Request, res: Response) => {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
    });
    if (transaction) {
      if (transaction.type === "Sale") {
        // The stock of the furniture is reset before the transaction,
        // only if the user changes the furniture
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
            // You should not be able to update the id and the type
            if(req.body.type === "Purchase") {
              return res.status(400).send({ error: "You cannot change the type of transaction" });
            }
            await Transaction.updateOne(
              {
                furniture: saleResult.furniture,
                price: saleResult.totalPrice,
              },
              { new: true, runValidators: true },
            );
          }
        }
      } else if (transaction.type === "Purchase") {
        // The stock of the furniture is reset before the transaction,
        // only if the user changes the furniture
        if (req.body.furniture) {
          resetPurchase(transaction.furniture);
          const purchaseResult = await getPurchase(req.body.furniture);
          if ("error" in purchaseResult) {
            return res.status(400).send(purchaseResult);
          } else {
            // You should not be able to update the id and the type
            if(req.body.type === "Sale") {
              return res.status(400).send({ error: "You cannot change the type of transaction" });
            }
            await Transaction.updateOne(
              {
                furniture: purchaseResult.furniture,
                totalPrice: purchaseResult.totalPrice,
              },
              { new: true, runValidators: true },
            );
          }
        }
      }
    } else {
      return res.status(404).send({ error: "Transaction not found" });
    }
  },
);

/**
 * Handles DELETE requests for removing transactions by their ID.
 * If the transaction type is 'Sale', it resets the sale-related furniture stock.
 * If the transaction type is 'Purchase', it resets the purchase-related furniture stock.
 * @param {Request} req - The request object containing the transaction ID.
 * @param {Response} res - The response object.
 * @returns {Response} - Success message or appropriate error message.
 *
 * @note CAMBIAR ESTE COMENTARIO POR FAVOR.
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
        } else if (transaction.type === "Purchase") {
          resetPurchase(transaction.furniture);
          Transaction.findOneAndDelete({ _id: req.params.id });
        } else {
          return res
            .status(404)
            .send({ error: "Transaction type not admitted" });
        }
      } else {
        return res.status(404).send({ error: "Transaction not found" });
      }
    } catch {
      return res.status(500).send(Error);
    }
  },
);
