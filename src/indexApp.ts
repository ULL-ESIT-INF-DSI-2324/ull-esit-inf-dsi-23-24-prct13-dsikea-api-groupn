import express from "express";
import "./db/mongoose.js";
import { transactionsRouter } from "./routers/transactionsRouter.js";
import { customersRouter } from "./routers/customersRouter.js";
import { providerRouter } from "./routers/providerRouter.js";

const app = express();
app.use(express.json());
app.use(transactionsRouter);
app.use(customersRouter);
app.use(providerRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
