import express, { Request, Response } from "express";
import Provider from "../models/provider.js";
// import { providerSchema } from "../models/provider.js";

export const providerRouter = express.Router();
providerRouter.use(express.json());

// GET all providers
providerRouter.get("/providers", async (req: Request, res: Response) => {
  try {
    const providers = await Provider.find();
    if (providers) {
      return res.send(providers);
    } else {
      return res.status(404).send({ error: "Providers not found" });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

providerRouter.get("/providers/:cif", async (req: Request, res: Response) => {
  try {
    const provider = await Provider.findOne({ cif: req.params.cif });
    if (provider) {
      return res.send(provider);
    } else {
      return res.status(404).send({ error: "Provider not found" });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

// GET a specific provider by ID
providerRouter.get("/providers/:id", async (req, res) => {
  try {
    const provider = await Provider.findOne({ id: req.params.id });
    if (provider) {
      return res.send(provider);
    } else {
      return res.status(404).send({ error: "Provider not found" });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

// POST a new provider
providerRouter.post("/providers", async (req, res) => {
  try {
    const provider = new Provider({
      name: req.body.name,
      address: req.body.address,
      cif: req.body.cif,
    });
    const newProvider = await provider.save();
    return res.status(201).send(newProvider);
  } catch (error) {
    return res.status(500).send(error);
  }
});

providerRouter.patch("/providers:cif", async (req, res) => {
  try {
    const allowedUpdates = ["name", "contact", "address", "cif"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidUpdate) {
      return res.status(400).send({
        error: "Update is not permitted",
      });
    }
    const provider = await Provider.findOneAndUpdate(
      { cif: req.params.cif },
      req.body,
      { new: true, runValidators: true },
    );
    if (provider) {
      return res.send(provider);
    }
    return res.status(404).send({ error: "Provider not found" });
  } catch (error) {
    return res.status(400).send(error);
  }
});

providerRouter.patch("/providers/:id", async (req, res) => {
  try {
    const allowedUpdates = ["name", "contact", "address", "cif"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidUpdate) {
      return res.status(400).send({
        error: "Update is not permitted",
      });
    }
    const provider = await Provider.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true },
    );
    if (provider) {
      return res.send(provider);
    }
    return res.status(404).send({ error: "Provider not found" });
  } catch (error) {
    return res.status(400).send(error);
  }
});

// DELETE a provider by CIF
providerRouter.delete("/providers/:cif", async (req, res) => {
  try {
    const provider = await Provider.findOneAndDelete({ cif: req.params.cif });
    if (provider) {
      res.send({ message: "Provider deleted" });
    } else {
      res.status(404).send({ error: "Provider not found" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

// DELETE a provider by ID
providerRouter.delete("/providers/:id", async (req: Request, res: Response) => {
  try {
    const provider = await Provider.findOneAndDelete({ _id: req.params.id });
    if (provider) {
      res.send({ message: "Provider deleted" });
    } else {
      res.status(404).send({ error: "Provider not found" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
