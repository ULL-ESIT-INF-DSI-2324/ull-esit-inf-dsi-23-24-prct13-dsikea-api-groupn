import express, { Request, Response } from "express";
import Customer from "../models/customer.js";
// import { providerSchema } from "../models/provider.js";

export const customersRouter = express.Router();
customersRouter.use(express.json());

// GET all providers
customersRouter.get("/customers", async (req: Request, res: Response) => {
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

customersRouter.get("/customers/:dni", async (req: Request, res: Response) => {
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
});

// GET a specific provider by ID
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

// POST a new provider
customersRouter.post("/customers", async (req, res) => {
  try {
    const customers = new Customer({
      name: req.body.name,
      contact: req.body.contact,
      address: req.body.address,
      dni: req.body.dni,
    });
    const newCustomer = await customers.save();
    return res.status(201).send(newCustomer);
  } catch (error) {
    return res.status(500).send(error);
  }
});

customersRouter.patch("/customers:contact", async (req, res) => {
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

customersRouter.patch("/customers/:id", async (req, res) => {
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
customersRouter.delete("/customers/:dni", async (req, res) => {
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
customersRouter.delete("/customers/:id", async (req: Request, res: Response) => {
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
