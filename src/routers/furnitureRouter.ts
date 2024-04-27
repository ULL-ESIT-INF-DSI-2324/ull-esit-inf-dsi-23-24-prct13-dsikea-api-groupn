import express, { Request, Response } from "express";
import "./db/mongoose.js";
import furniture from "../models/furniture.js";
import { furnitureSchema } from "../models/furniture.js";

export const furnitureRouter = express.Router();
furnitureRouter.use(express.json());

/**
 * Verifica si las claves en la consulta de la solicitud coinciden con las claves en el esquema de los muebles.
 * @param req - La solicitud HTTP.
 * @returns Verdadero si todas las claves en la consulta están en el esquema de los muebles, falso en caso contrario.
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
 * Maneja las solicitudes GET a la ruta "/furnitures".
 * Si se proporciona una consulta, verifica la consulta y luego busca muebles que coincidan con la consulta.
 * Si no se proporciona una consulta, devuelve un error.
 */
furnitureRouter.get("/furnitures", (req: Request, res: Response) => {
  if (req.query) {
    if (checkFurnitureQuery(req)) {
      furniture
        .find(req.query)
        .then((furnitures) => {
          res.json(furnitures);
        })
        .catch(() => {
          res.status(500).json({ message: "Muebles no encontrados" });
        });
    } else {
      res.status(400).json({
        message:
          "Parámetros de búsqueda no válidos, recuerde que los posibles campos son: name, description, material y price",
      });
    }
  } else {
    res
      .status(400)
      .json({ message: "No se ha especificado ningún parámetro de búsqueda" });
  }
});

/**
 * Maneja las solicitudes GET a la ruta "/furnitures/:id".
 * Busca un mueble por su ID. Si no se encuentra el mueble, devuelve un error.
 */
furnitureRouter.get("/furnitures/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  furniture
    .findById(id)
    .then((furniture) => {
      if (furniture) {
        res.json(furniture);
      } else {
        res.status(404).json({ message: "Mueble no encontrado" });
      }
    })
    .catch(() => {
      res.status(500).json({ message: "Error al buscar el mueble" });
    });
});

/**
 * Maneja las solicitudes POST a la ruta "/furnitures".
 * Crea un nuevo mueble con los datos proporcionados en el cuerpo de la solicitud.
 * Si se proporciona una cantidad, devuelve un error porque la cantidad debe establecerse mediante una transacción.
 */
furnitureRouter.post("/furnitures", (req: Request, res: Response) => {
  const newFurniture = new furniture(req.body);
  if (!req.body.cantity) {
    newFurniture
      .save()
      .then(() => {
        res.json({ message: "Mueble añadido correctamente" });
      })
      .catch(() => {
        res.status(500).json({ message: "Error al añadir el mueble" });
      });
  } else {
    res.status(400).json({
      message:
        "No se puede añadir un mueble con cantidad, para ello se debe hacer una transacción",
    });
  }
});

/**
 * Maneja las solicitudes PATCH a la ruta "/furnitures/:id".
 * Actualiza un mueble por su ID con los datos proporcionados en el cuerpo de la solicitud.
 * Si no se encuentra el mueble, devuelve un error.
 */
furnitureRouter.patch("/furnitures/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  furniture
    .findByIdAndUpdate(id, req.body, { new: true })
    .then((furniture) => {
      if (furniture) {
        res.json(furniture);
      } else {
        res.status(404).json({ message: "Mueble no encontrado" });
      }
    })
    .catch(() => {
      res.status(500).json({ message: "Error al actualizar el mueble" });
    });
});

/**
 * Maneja las solicitudes PATCH a la ruta "/furnitures".
 * Actualiza todos los muebles que coinciden con la consulta proporcionada con los datos proporcionados en el cuerpo de la solicitud.
 * Si no se encuentra ningún mueble, devuelve un error.
 * 
 * @note Manu explicame esto
 */
furnitureRouter.patch("/furnitures", (req: Request, res: Response) => {
  furniture
    .updateMany(req.query, req.body)
    .then((furniture) => {
      if (furniture) {
        res.json(furniture);
      } else {
        res.status(404).json({ message: "Mueble no encontrado" });
      }
    })
    .catch(() => {
      res.status(500).json({ message: "Error al actualizar el mueble" });
    });
});

/**
 * Maneja las solicitudes DELETE a la ruta "/furnitures".
 * Elimina todos los muebles que coinciden con la consulta proporcionada.
 * Si no se encuentra ningún mueble, devuelve un error.
 */
furnitureRouter.delete("/furnitures", (req: Request, res: Response) => {
  furniture
    .deleteMany(req.query)
    .then((furniture) => {
      if (furniture) {
        res.json(furniture);
      } else {
        res.status(404).json({ message: "Mueble no encontrado" });
      }
    })
    .catch(() => {
      res.status(500).json({ message: "Error al eliminar el mueble" });
    });
});

/**
 * Maneja las solicitudes DELETE a la ruta "/furnitures/:id".
 * Elimina un mueble por su ID. Si no se encuentra el mueble, devuelve un error.
 */
furnitureRouter.delete("/furnitures/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  furniture
    .findByIdAndDelete(id)
    .then((furniture) => {
      if (furniture) {
        res.json(furniture);
      } else {
        res.status(404).json({ message: "Mueble no encontrado" });
      }
    })
    .catch(() => {
      res.status(500).json({ message: "Error al eliminar el mueble" });
    });
});

// furnitureRouter.listen(3000, () => {
//   console.log("Server is up on port 3000");
// });
