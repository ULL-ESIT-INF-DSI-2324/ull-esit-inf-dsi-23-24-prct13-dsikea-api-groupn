import express, { Request, Response } from "express";
import Provider from "../models/provider.js";

/**
 * Router for handling provider related requests.
 */
export const providerRouter = express.Router();
providerRouter.use(express.json());

/**
 * GET all providers or retrieve provider by CIF.
 * @returns {Response} - List of all providers or the requested provider.
 */
providerRouter.get("/providers", async (req: Request, res: Response) => {
  if (req.query.cif) {
    try {
      const provider = await Provider.findOne({ cif: req.query.cif });
      if (provider) {
        return res.send(provider);
      } else {
        return res.status(404).send({ error: "Provider not found" });
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  } else {
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
  }
});

/**
 * GET a specific provider by ID.
 * @param {string} id - The ID of the provider.
 * @returns {Response} - The provider with the specified ID.
 */
providerRouter.get("/providers/:id", async (req, res) => {
  try {
    const provider = await Provider.findOne({ _id: req.params.id });

    if (provider) {
      return res.send(provider);
    } else {
      return res.status(404).send({ error: "Provider not found" });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * POST a new provider.
 * @param {Request} req - The request object containing provider data.
 * @param {Response} res - The response object.
 * @returns {Response} - The newly created provider or an error message.
 */
providerRouter.post("/providers", async (req, res) => {
  try {
    const provider = new Provider({
      name: req.body.name,
      contact: req.body.contact,
      postalCode: req.body.postalCode,
      cif: req.body.cif,
    });
    const samedni = await Provider.findOne({ cif: req.body.cif });
    if (samedni) {
      return res.status(400).send({ error: "CIF already exists" });
    }
    const newProvider = await provider.save();
    return res.status(201).send(newProvider);
  } catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * Update provider information based on CIF.
 * @param {Request} req - The request object containing updated provider information.
 * @param {Response} res - The response object.
 * @returns {Response} - The updated provider or an error message.
 */
providerRouter.patch("/providers", async (req, res) => {
  if (req.query.cif) {
    try {
      const allowedUpdates = ["name", "contact", "postalCode", "cif"];
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
        { cif: req.query.cif },
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
  } else {
    return res.status(404).send({ error: "You must put cif in the body" });
  }
});

/**
 * Update provider information by ID.
 * @param {Request} req - The request object containing updated provider information.
 * @param {Response} res - The response object.
 * @returns {Response} - The updated provider or an error message.
 */
providerRouter.patch("/providers/:id", async (req, res) => {
  try {
    const allowedUpdates = ["name", "contact", "postalCode", "cif"];
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
      { _id: req.params.id },
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

/**
 * Delete a provider by CIF.
 * @param {Request} req - The request object containing the CIF of the provider to be deleted.
 * @param {Response} res - The response object.
 * @returns {Response} - Success message if the provider is deleted, otherwise error message.
 */
providerRouter.delete("/providers", async (req, res) => {
  if (req.query.cif) {
    try {
      const provider = await Provider.findOneAndDelete({ cif: req.query.cif });
      if (provider) {
        res.send({ message: "Provider deleted" });
      } else {
        res.status(404).send({ error: "Provider not found" });
      }
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    res.status(404).send({ error: "You must put cif in the body" });
  }
});

/**
 * Delete a provider by ID.
 * @param {Request} req - The request object containing the ID of the provider to be deleted.
 * @param {Response} res - The response object.
 * @returns {Response} - Success message if the provider is deleted, otherwise error message.
 */
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
