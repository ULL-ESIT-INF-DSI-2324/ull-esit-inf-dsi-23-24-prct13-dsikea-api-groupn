import request from "supertest";
import { app } from "../src/indexApp.js";

describe("POST /users", () => {
  it("Should successfully create a new user", async () => {
    await request(app)
      .post("/users")
      .send({
        name: "Eduardo Segredo",
        username: "esegredo",
        email: "esegredo@example.com",
      })
      .expect(201);
  });
});

let fornuture, customer, providers, transactions;

// beforeEach(async () => {
//   fornuture = await createFornuture();
//   customer = await createCustomer();
//   providers = await createProviders();
//   transactions = await createTransactions();
// });
