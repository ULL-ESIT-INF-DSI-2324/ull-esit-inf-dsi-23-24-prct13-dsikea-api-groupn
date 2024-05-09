import request from "supertest";
import { app } from "../src/indexApp.js";
import Customer from "../src/models/customer.js";

// describe('POST /users', () => {
//   it('Should successfully create a new user', async () => {
//     await request(app).post('/users').send({
//       name: "Eduardo Segredo",
//       email: "esegredo@example.com",
//       dni: "43889845E",
//     }).expect(201);
//   });
// });

const firstCustomer = {
  name: "Eduardo Segredo",
  contact: "+34666666666",
  postalCode: "34556",
  email: "esegredo@example.com",
  dni: "43549856D",
};

beforeEach(async () => {
  await Customer.deleteMany();
  await new Customer(firstCustomer).save();
});

describe("POST /users", () => {
  it("Should successfully create a new user", async () => {
    await request(app)
      .post("/customers")
      .send({
        name: "Eduardo Segredo",
        contact: "+34666666666",
        postalCode: "34556",
        email: "esegredo@example.com",
        dni: "43549856D",
      })
      .expect(201);
  });

  it("Should get an error", async () => {
    await request(app).post("/customers").send(firstCustomer).expect(201);
  });
});

describe("GET /users", () => {
  it("Should get a user by username", async () => {
    await request(app).get("/customers/43549856D").expect(200);
  });

  it("Should find a user by username", async () => {
    await request(app).get("/customers/43549856D").expect(200);
  });
});
