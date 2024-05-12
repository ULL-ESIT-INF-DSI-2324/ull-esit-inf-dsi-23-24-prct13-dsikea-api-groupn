import express from "express";
import "./db/mongoose.js";
import { transactionsRouter } from "./routers/transactionsRouter.js";
import { customersRouter } from "./routers/customersRouter.js";
import { providerRouter } from "./routers/providerRouter.js";
import { furnitureRouter } from "./routers/furnitureRouter.js";

/**
 * Creates an Express application.
 */
export const app = express();
app.use(express.json());
app.use(transactionsRouter);
app.use(furnitureRouter);
app.use(customersRouter);
app.use(providerRouter);

/**
 * Port on which the server will listen for incoming requests.
 */
const port = process.env.PORT || 3000;

/**
 * Starts the Express server.
 */
app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
