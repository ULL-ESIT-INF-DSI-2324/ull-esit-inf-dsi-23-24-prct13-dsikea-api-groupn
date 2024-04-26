import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

// Datos de ejemplo para la tienda de muebles
let muebles = [
    { id: 1, nombre: 'Silla', precio: 50 },
    { id: 2, nombre: 'Mesa', precio: 100 },
];

// Obtener todos los muebles
app.get('/muebles', (req: Request, res: Response) => {
    res.json(muebles);
});

// Obtener un mueble por su ID
app.get('/muebles/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const mueble = muebles.find((m) => m.id === id);
    if (mueble) {
        res.json(mueble);
    } else {
        res.status(404).json({ message: 'Mueble no encontrado' });
    }
});

// Crear un nuevo mueble
app.post('/muebles', (req: Request, res: Response) => {
    const { nombre, precio } = req.body;
    const id = muebles.length + 1;
    const nuevoMueble = { id, nombre, precio };
    muebles.push(nuevoMueble);
    res.status(201).json(nuevoMueble);
});

// Actualizar un mueble existente
app.put('/muebles/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { nombre, precio } = req.body;
    const mueble = muebles.find((m) => m.id === id);
    if (mueble) {
        mueble.nombre = nombre;
        mueble.precio = precio;
        res.json(mueble);
    } else {
        res.status(404).json({ message: 'Mueble no encontrado' });
    }
});

// Eliminar un mueble
app.delete('/muebles/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const index = muebles.findIndex((m) => m.id === id);
    if (index !== -1) {
        const muebleEliminado = muebles.splice(index, 1)[0];
        res.json(muebleEliminado);
    } else {
        res.status(404).json({ message: 'Mueble no encontrado' });
    }
});

// Iniciar el servidor
const port = 3000;
app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});