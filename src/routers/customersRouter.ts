import express, { Request, Response } from "express";
import Customer from "../models/customer.js";
// import { providerSchema } from "../models/provider.js";

export const customersRouter = express.Router();
customersRouter.use(express.json());

/**
 * GET all customers.
 * @returns {Response} - List of all customers.
 */
customersRouter.get("/customers", async (__, res: Response) => {
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
});

/**
 * GET a customer by DNI.
 * @param {string} dni - The DNI of the customer.
 * @returns {Response} - The customer with the specified DNI.
 */
customersRouter.get("/customers", async (req: Request, res: Response) => {
  if (req.query.dni) {
    try {
      const customer = await Customer.findOne({ dni: req.params.dni });
      if (customer) {
        return res.send(customer);
      } else {
        return res.status(404).send({ error: "Customer not found" });
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  } else {
    return res.status(404).send({ error: "You must put dni in the body" });
  }
});

/**
 * GET a customer by ID.
 * @param {string} id - The ID of the customer.
 * @returns {Response} - The customer with the specified ID.
 */
customersRouter.get("/customers/:id", async (req, res) => {
  try {
    const customer = await Customer.findOne({ id: req.params.id });
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
 * POST a new customer.
 * @param {Request} req - The request object containing customer data.
 * @param {Response} res - The response object.
 * @returns {Response} - The newly created customer.
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
    const newCustomer = await customers.save();
    return res.status(201).send(newCustomer);
  } catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * Update customer information by ID.
 * @param {Request} req - The request object containing updated customer information.
 * @param {Response} res - The response object.
 * @returns {Response} - The updated customer.
 */
customersRouter.patch("/customers/:id", async (req, res) => {
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
 * Delete a customer by DNI.
 * @param {Request} req - The request object containing the DNI of the customer to be deleted.
 * @param {Response} res - The response object.
 * @returns {Response} - Success message if the customer is deleted, otherwise error message.
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
 * Delete a customer by ID.
 * @param {Request} req - The request object containing the ID of the customer to be deleted.
 * @param {Response} res - The response object.
 * @returns {Response} - Success message if the customer is deleted, otherwise error message.
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
