import express, { Request, Response } from "express";
import Customer from "../models/customer.js";

/**
 * Router for handling customer related requests.
 */
export const customersRouter = express.Router();
customersRouter.use(express.json());

/**
 * GET /customers
 * If a DNI is provided, it returns the customer with that DNI.
 * If no DNI is provided, it returns all customers.
 * @param {Request} req - The request object containing query parameters.
 * @param {Response} res - The response object.
 * @returns {Response} - The requested customer(s) or appropriate error message.
 */
customersRouter.get("/customers", async (req: Request, res: Response) => {
  if (req.query.dni) {
    try {
      const customer = await Customer.findOne({ dni: req.query.dni });
      if (customer) {
        return res.send(customer);
      } else {
        return res.status(404).send({ error: "Customer not found" });
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  } else {
    try {
      const customers = await Customer.find();
      if (customers) {
        return res.send(customers);
      } else {
        return res.status(404).send({ error: "Customers not found" });
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  }
});

/**
 * GET /customers/:id
 * Returns the customer with the provided ID.
 * @param {Request} req - The request object containing the customer ID.
 * @param {Response} res - The response object.
 * @returns {Response} - The requested customer or appropriate error message.
 */
customersRouter.get("/customers/:id", async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id });

    if (!customer) {
      return res.status(404).send({ error: "Customer not found" });
    } else {
      return res.send(customer);
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * POST /customers
 * Creates a new customer with the provided data.
 * Returns an error if a customer with the same DNI already exists.
 * @param {Request} req - The request object containing customer data.
 * @param {Response} res - The response object.
 * @returns {Response} - The created customer or appropriate error message.
 */
customersRouter.post("/customers", async (req, res) => {
  try {
    const customers = new Customer({
      name: req.body.name,
      contact: req.body.contact,
      email: req.body.email,
      postalCode: req.body.postalCode,
      dni: req.body.dni,
    });
    const samedni = await Customer.findOne({ dni: req.body.dni });
    if (samedni) {
      return res.status(400).send({ error: "DNI already exists" });
    }
    const newCustomer = await customers.save();
    return res.status(201).send(newCustomer);
  } catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * PATCH /customers/:id
 * Updates the customer with the provided ID.
 * Only allows updates to certain fields.
 * @param {Request} req - The request object containing customer data.
 * @param {Response} res - The response object.
 * @returns {Response} - The updated customer or appropriate error message.
 */
customersRouter.patch("/customers/:id", async (req, res) => {
  try {
    const allowedUpdates = ["name", "contact", "postalCode", "dni", "email"];
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
      { _id: req.params.id },
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

/**
 * PATCH /customers
 * Updates the customer with the provided DNI.
 * Only allows updates to certain fields.
 * @param {Request} req - The request object containing customer data.
 * @param {Response} res - The response object.
 * @returns {Response} - The updated customer or appropriate error message.
 */
customersRouter.patch("/customers", async (req, res) => {
  if (req.query.dni) {
    try {
      const allowedUpdates = ["name", "contact", "postalCode", "dni"];
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
        { dni: req.query.dni },
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
  } else {
    return res.status(404).send({ error: "You must put dni in the body" });
  }
});

/**
 * DELETE /customers
 * Deletes the customer with the provided DNI.
 * @param {Request} req - The request object containing customer data.
 * @param {Response} res - The response object.
 * @returns {Response} - Success message or appropriate error message.
 */
customersRouter.delete("/customers", async (req, res) => {
  if (req.query.dni) {
    try {
      const provider = await Customer.findOneAndDelete({ dni: req.query.dni });
      if (provider) {
        res.send({ message: "Customer deleted" });
      } else {
        res.status(404).send({ error: "Customer not found" });
      }
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    return res.status(404).send({ error: "You must put dni in the body" });
  }
});

/**
 * DELETE /customers/:id
 * Deletes the customer with the provided ID.
 * @param {Request} req - The request object containing the customer ID.
 * @param {Response} res - The response object.
 * @returns {Response} - Success message or appropriate error message.
 */
customersRouter.delete(
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
