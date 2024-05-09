import express, { Request, Response } from "express";
import Furniture from "../models/furniture.js";
import { furnitureSchema } from "../models/furniture.js";

export const furnitureRouter = express.Router();
furnitureRouter.use(express.json());

// interface FurnitureReqI {
//   quantity: number;
//   name: string;
//   description: string;
//   material: string;
//   dimensions: string;
//   price: number;
//   color: string;
// }

/**
 * Checks if the keys in the request query match the keys in the furniture schema.
 * @param {Request} req - The HTTP request.
 * @returns True if all keys in the query are in the furniture schema, false otherwise.
 */
function checkFurnitureQuery(req: Request) {
  const keys = Object.keys(req.query);
  const keysFurnitures = Object.keys(furnitureSchema.obj);
  for (const key of keys) {
    if (!keysFurnitures.includes(key)) {
      return false;
    }
  }
  return true;
}

/**
 * GET all furnitures. Or search furnitures by name, description, material, price...
 * @returns {Response} - List of all furnitures.
 */
furnitureRouter.get("/furnitures", (req: Request, res: Response) => {
  if (req.query) {
    if (checkFurnitureQuery(req)) {
      Furniture
        .find(req.query)
        .then((furnitures) => {
          res.json(furnitures);
        })
        .catch(() => {
          res.status(500).json({ message: "Furnitures not found" });
        });
    } else {
      res.status(400).json({
        message:
          "Invalid search parameters, remember that the possible fields are: name, description, material and price",
      });
    }
  } else {
    res
      .status(400)
      .json({ message: "No search parameters specified" });
  }
});

/**
 * GET a furniture by ID.
 * @param {string} id - The ID of the furniture.
 * @returns {Response} - The furniture with the specified ID.
 */
furnitureRouter.get("/furnitures/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  Furniture
    .findById(id)
    .then((furniture) => {
      if (furniture) {
        res.json(furniture);
      } else {
        res.status(404).json({ message: "Furniture not found" });
      }
    })
    .catch(() => {
      res.status(500).json({ message: "Error when searching furniture" });
    });
});

/**
 * POST a new furniture.
 * @param {Request} req - The request object containing customer data.
 * @param {Response} res - The response object.
 * @returns {Response} - The newly created customer.
 */
furnitureRouter.post("/furnitures", (req: Request, res: Response) => {
  // Hacer interfaz y añadir cantidad igual 0.
  if (req.body.quantity) {
    res.status(400).json({
      message:
        "You cannot add a piece of furniture with quantity, to do so you must make a transaction",
    });
  }
  const furniture = {
    name: req.body.name,
    description: req.body.description,
    material: req.body.material,
    dimensions: req.body.dimensions,
    quantity: 0,
    price: req.body.price,
    color: req.body.color,
  };
  const newFurniture = new Furniture(furniture);
  if (!req.body.quantity) {
    newFurniture
      .save()
      .then(() => {
        res.json({ message: "Furniture added successfully" });
      })
      .catch(() => {
        res.status(500).json({ message: "Error when adding furniture" });
      });
  } else {
    res.status(400).json({
      message:
        "You cannot add a piece of furniture with quantity, to do so you must make a transaction",
    });
  }
});

/**
 * Update furniture information.
 * @param {Request} req - The request object containing updated furniture information.
 * @param {Response} res - The response object.
 * @returns {Response} - The updated furniture.
 */
furnitureRouter.patch("/furnitures", (req: Request, res: Response) => {
  // Avisar al usuario que la cantidad no se puede modificar, es decir que el mueble se añade pero la cantidad está a cero.
  Furniture
    .updateMany(req.query, req.body)
    .then((furniture) => {
      if (furniture) {
        res.json(furniture);
      } else {
        res.status(404).json({ message: "Furniture not found" });
      }
    })
    .catch(() => {
      res.status(500).json({ message: "Error when updating furniture" });
    });
});

/**
 * Update furniture information by ID.
 * @param {Request} req - The request object containing updated furniture information.
 * @param {Response} res - The response object.
 * @returns {Response} - The updated furniture.
 */
furnitureRouter.patch("/furnitures/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  Furniture
    .findByIdAndUpdate(id, req.body, { new: true })
    .then((furniture) => {
      if (furniture) {
        res.json(furniture);
      } else {
        res.status(404).json({ message: "Furniture not found" });
      }
    })
    .catch(() => {
      res.status(500).json({ message: "Error when updating furniture" });
    });
});

/**
 * Delete a furniture by ID.
 * @param {Request} req - The request object containing the ID of the furniture to be deleted.
 * @param {Response} res - The response object.
 * @returns {Response} - Success message if the furniture is deleted, otherwise error message.
 */
furnitureRouter.delete("/furnitures/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  Furniture
    .findByIdAndDelete(id)
    .then((furniture) => {
      if (furniture) {
        res.json(furniture);
      } else {
        res.status(404).json({ message: "Furniture not found" });
      }
    })
    .catch(() => {
      res.status(500).json({ message: "Error when deleting furniture" });
    });
});