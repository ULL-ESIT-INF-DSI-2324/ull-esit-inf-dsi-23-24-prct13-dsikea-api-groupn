import express, { Request, Response} from 'express';
import './db/mongoose.js';
import furniture from '../models/furniture.js';
import { furnitureSchema } from '../models/furniture.js';

const app = express();
app.use(express.json());

function comprubeQuery (req:Request) {    
  const keys = Object.keys(req.query);
  const keysFurnitures = Object.keys(furnitureSchema.obj);
  for (const key of keys) {
    if (!keysFurnitures.includes(key)) {
      return false;
    }
  }
  return true;
}

app.get('/furnitures', (req: Request, res: Response) => {
  if(req.query){
    if(comprubeQuery(req)){
      furniture.find(req.query).then((furnitures) => {
        res.json(furnitures);
      }).catch(() => {
        res.status(500).json({ message: 'Muebles no encontrados' });
      });
    } else {
      res.status(400).json({ message: 'Parámetros de búsqueda no válidos, recuerde que los posibles campos son: name, description, material y price' });
    }
  } else {
    res.status(400).json({ message: 'No se ha especificado ningún parámetro de búsqueda' });
  }
});


app.get('/furnitures/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  furniture.findById(id).then((furniture) => {
    if (furniture) {
      res.json(furniture);
    } else {
      res.status(404).json({ message: 'Mueble no encontrado' });
    }
  }).catch(() => {
    res.status(500).json({ message: 'Error al buscar el mueble' });
  });
});


app.post('/furnitures', (req: Request, res: Response) => {
  const newFurniture = new furniture(req.body);
  if (!req.body.cantity){
    newFurniture.save().then(() => {
      res.json({ message: 'Mueble añadido correctamente' });
    }).catch(() => {
      res.status(500).json({ message: 'Error al añadir el mueble' });
    });
  } else {
    res.status(400).json({ message: 'No se puede añadir un mueble con cantidad, para ello se debe hacer una transacción' });
  }
});

app.patch('/furnitures/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  furniture.findByIdAndUpdate(id
    , req.body
    , { new: true }
  ).then((furniture) => {
    if (furniture) {
      res.json(furniture);
    } else {
      res.status(404).json({ message: 'Mueble no encontrado' });
    }
  }).catch(() => {
    res.status(500).json({ message: 'Error al actualizar el mueble' });
  });
});

app.patch('/furnitures', (req: Request, res: Response) => {
  furniture.updateMany(req.query, req.body).then((furniture) => {
    if (furniture) {
      res.json(furniture);
    } else {
      res.status(404).json({ message: 'Mueble no encontrado' });
    }
  }).catch(() => {
    res.status(500).json({ message: 'Error al actualizar el mueble' });
  });
});

app.delete('/furnitures', (req: Request, res: Response) => {
  furniture.deleteMany(req.query).then((furniture) => {
    if (furniture) {
      res.json(furniture);
    } else {
      res.status(404).json({ message: 'Mueble no encontrado' });
    }
  }).catch(() => {
    res.status(500).json({ message: 'Error al eliminar el mueble' });
  });
});

app.delete('/furnitures/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  furniture.findByIdAndDelete(id).then((furniture) => {
    if (furniture) {
      res.json(furniture);
    } else {
      res.status(404).json({ message: 'Mueble no encontrado' });
    }
  }).catch(() => {
    res.status(500).json({ message: 'Error al eliminar el mueble' });
  });
});

app.listen(3000, () => {
  console.log('Server is up on port 3000');
});