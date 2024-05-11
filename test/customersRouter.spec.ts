import request from "supertest";
import { app } from "../src/indexApp.js";
import Customer from "../src/models/customer.js";
import { ICustomer } from "../src/models/customer.js";
import { expect } from "chai";

// describe('POST /users', () => {
//   it('Should successfully create a new user', async () => {
//     await request(app).post('/users').send({
//       name: "Eduardo Segredo",
//       email: "esegredo@example.com",
//       dni: "43889845E",
//     }).expect(201);
//   });
// });

export const firstCustomer = {
  _id: "507f1f77bcf86cd799439011",
  name: "Eduardo Segredo",
  contact: "+34666666666",
  postalCode: "34556",
  email: "esegredo@example.com",
  dni: "43549856D",
};

export const secondCustomer = {
  _id: "507f1f77bcf86cd799439012",
  name: "Alejandro Martinez",
  contact: "+34645678976",
  postalCode: "39556",
  email: "aleoo@example.com",
  dni: "47540859E",
};

beforeEach(async () => {
  await Customer.deleteMany();
  await new Customer(firstCustomer).save();
  await new Customer(secondCustomer).save();
});

//###############CUSTOMERS##################//

//###GET###//
describe("GET /customer", () => {
  it("Should get a user by username with the dni in the query", async () => {
    const response = await request(app)
      .get("/customers?dni=43549856D")
      .expect(200);
    expect(response.body).to.include(
      firstCustomer,
    );
  });
  it("Should find all customers", async () => {
    const response = await request(app).get("/customers").expect(200);
    expect(
      response.body.map((customer: ICustomer) => ({
        _id: customer._id,
        name: customer.name,
        contact: customer.contact,
        postalCode: customer.postalCode,
        email: customer.email,
        dni: customer.dni,
      })),
    ).to.deep.include.members([
      firstCustomer,
      secondCustomer,
    ]);
  });
  it("Not Should find a user by username beacuse not exist this DNI un the query", async () => {
    const response = await request(app)
      .get("/customers?dni=43549856C")
      .expect(404);
    expect(response.body.error).to.eql("Customer not found");
  });
});

describe("GET /customers/:id", () => {
  it("Should find a customer 2 by id", async () => {
    const response = await request(app)
      .get("/customers/507f1f77bcf86cd799439011")
      .expect(200);
    expect(response.body).to.include(
      firstCustomer,
    );
  });

  it("Not Should find a id not exist", async () => {
    const response = await request(app)
      .get("/customers/663d5ae2b746172c48b08113")
      .expect(404);
    expect(response.body.error).to.eql("Customer not found");
  });
});

//###POST###//
describe("POST /customers", () => {
  it("Should successfully create a new user", async () => {
    const response = await request(app)
      .post("/customers")
      .send({
        name: "Daniel Rodríguez",
        contact: "+34662345696",
        postalCode: "39556",
        email: "daniel@uk.com",
        dni: "73799876A",
      })
      .expect(201);
    expect(response.body).to.include({
      name: "Daniel Rodríguez",
      contact: "+34662345696",
      postalCode: "39556",
      email: "daniel@uk.com",
      dni: "73799876A",
    });
  });

  it("Not Should successfully create a new user beacuse the dni already exists", async () => {
    const response = await request(app)
      .post("/customers")
      .send({
        name: "Eduardo Segredo",
        contact: "+34666666666",
        postalCode: "34556",
        email: "esegredo@example.com",
        dni: "43549856D",
      })
      .expect(400);
    expect(response.body.error).to.eql("DNI already exists");
  });

  it("Not Should successfully create a new user beacuse the invalid number phone", async () => {
    const response = await request(app)
      .post("/customers")
      .send({
        name: "Antonio Mendez",
        contact: "+84676686666",
        postalCode: "34556",
        email: "anton@example.com",
        dni: "47549859D",
      })
      .expect(500);
    expect(response.text).to.eql(
      '{"errors":{"contact":{"name":"ValidatorError","message":"Invalid phone number","properties":{"message":"Invalid phone number","type":"user defined","path":"contact","value":"+84676686666"},"kind":"user defined","path":"contact","value":"+84676686666"}},"_message":"Customer validation failed","name":"ValidationError","message":"Customer validation failed: contact: Invalid phone number"}',
    );
  });
});

//###PATCH###//

describe("PATCH /customers", () => {
  it("Should successfully modify a customer", async () => {
    const response = await request(app)
      .patch("/customers?dni=47540859E")
      .send({
        name: "Alejandro Martinez",
        contact: "+34777345695",
        postalCode: "55555",
      })
      .expect(200);
    expect(response.body).to.include({
      dni: "47540859E",
      name: "Alejandro Martinez",
      contact: "+34777345695",
      postalCode: "55555",
    });
  });
  it("Not should successfully modify a customer other atributes like _id", async () => {
    const response = await request(app)
      .patch("/customers?dni=47540859E")
      .send({
        _id: "00000000000000000000",
        name: "Alejandro Martinez",
        contact: "+34777345695",
        postalCode: "55555",
      })
      .expect(400);
    expect(response.body).to.include({
      error: "Update is not permitted",
    });
  });

  it("Not should successfully modify a customer not exist", async () => {
    const response = await request(app)
      .patch("/customers?dni=45549856A")
      .send({
        name: "Eduardo Segredo",
        contact: "+34666666677",
        postalCode: "34556",
      })
      .expect(404);
    expect(response.body).to.include({
      error: "Customer not found",
    });
  });
});

describe("PATCH /customers/:id", () => {
  it("Should successfully modify a customer", async () => {
    const response = await request(app)
      .patch("/customers/507f1f77bcf86cd799439012")
      .send({
        name: "Alejandro Martinez Gonzalez",
        email: "alemarti@hotmail.es",
        postalCode: "66666",
      })
      .expect(200);
    expect(response.body).to.include({
      dni: "47540859E",
      name: "Alejandro Martinez Gonzalez",
      email: "alemarti@hotmail.es",
      postalCode: "66666",
    });
  });
  it("Not should  modify a customer other atributes like _id", async () => {
    const response = await request(app)
      .patch("/customers/507f1f77bcf86cd799439011")
      .send({
        _id: "00000000000000000000",
        name: "Alejandro Martinez Gonzalez",
        email: "alemarti@hotmail.es",
        postalCode: "66666",
      })
      .expect(400);
    expect(response.body).to.include({
      error: "Update is not permitted",
    });
  });
  it("Not should  modify a customer, not found a customer", async () => {
    const response = await request(app)
      .patch("/customers/997f1f77bcf86cd799439059")
      .send({
        name: "Alejandro Martinez Gonzalez",
        email: "alemarti@hotmail.es",
        postalCode: "77777",
      })
      .expect(404);
    expect(response.body).to.include({
      error: "Customer not found",
    });
  });
});

//###DELETE###//
describe("DELETE /customers/:id", () => {
  it("Should successfully delete a customer", async () => {
    const response = await request(app)
      .delete("/customers/507f1f77bcf86cd799439011")
      .expect(200);
    expect(response.body).to.eql({
      message: "Customer deleted",
    });
  });

  it("Not should delete a customer, not found a customer", async () => {
    const response = await request(app)
      .patch("/customers/997f1f77bcf86cd799439059")
      .expect(404);
    expect(response.body).to.eql({
      error: "Customer not found",
    });
  });
});

describe("DELETE /customers", () => {
  it("Should successfully delete a customer", async () => {
    const response = await request(app)
      .delete("/customers?dni=47540859E")
      .expect(200);
    expect(response.body).to.eql({
      message: "Customer deleted",
    });
  });

  it("Not should delete a customer, not found a customer", async () => {
    const response = await request(app)
      .patch("/customers?dni=48888888A")
      .expect(404);
    expect(response.body).to.eql({
      error: "Customer not found",
    });
  });
  it("Not should delete a customer, not found the dni in the body", async () => {
    const response = await request(app).patch("/customers").expect(404);
    expect(response.body).to.eql({
      error: "You must put dni in the body",
    });
  });
});
