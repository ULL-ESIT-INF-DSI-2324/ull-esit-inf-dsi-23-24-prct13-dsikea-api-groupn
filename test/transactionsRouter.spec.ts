import request from "supertest";
import { app } from "../src/indexApp.js";
import Transaction, { ITransaction } from "../src/models/transaction.js";
import Furniture from "../src/models/furniture.js";
import { firstCustomer, secondCustomer } from "./customersRouter.spec.js";
import { firstProvider, secondProvider } from "./providerRouter.spec.js";
import {
  firstFurniture,
  secondFurniture,
  thirdFurniture,
} from "./furnitureRouter.spec.js";
import { expect } from "chai";


const firstTransaction = {
  _id: "60d5ec3a8891df7a841211a7",
  type: "Purchase",
  customer: undefined,
  provider: firstProvider._id,
  furniture: [
    {
      _id: "663f4be9ebc05e7bc861f193",
      furniture: firstFurniture._id,
      quantity: 1,
    },
    {
      _id: "663f4be9ebc05e7bc861f194",
      furniture: secondFurniture._id,
      quantity: 1,
    },
  ],
  date: "2022-01-01T00:00:00.000Z",
  price: firstFurniture.price + secondFurniture.price,
};
const secondTransaction = {
  _id: "60d5ec3b8891df7a841211a8",
  type: "Purchase",
  customer: undefined,
  provider: secondProvider._id,
  furniture: [
    {
      _id: "663f4be9ebc05e7bc861f197",
      furniture: firstFurniture._id,
      quantity: 1,
    },
    {
      _id: "663f4be9ebc05e7bc861f198",
      furniture: secondFurniture._id,
      quantity: 1,
    },
    {
      _id: "663f4be9ebc05e7bc861f199",
      furniture: thirdFurniture._id,
      quantity: 1,
    },
  ],
  date: "2022-01-02T00:00:00.000Z",
  price: firstFurniture.price + secondFurniture.price + thirdFurniture.price,
};

const thirdTransaction = {
  _id: "60d5ec3b8891df7a841211a9",
  type: "Sale",
  customer: firstCustomer._id,
  provider: undefined,
  furniture: [
    {
      _id: "663f4be9ebc05e7bc861f19c",
      furniture: firstFurniture._id,
      quantity: 1,
    },
  ],
  date: "2022-01-03T00:00:00.000Z",
  price: firstFurniture.price,
};

const fourthTransaction = {
  _id: "60d5ec3d8891df7a841211aa",
  type: "Sale",
  customer: secondCustomer._id,
  provider: undefined,
  furniture: [
    {
      _id: "663f4be9ebc05e7bc861f19f",
      furniture: firstFurniture._id,
      quantity: 1,
    },
    {
      _id: "663f4be9ebc05e7bc861f1a0",
      furniture: thirdFurniture._id,
      quantity: 1,
    },
  ],
  date: "2022-01-04T00:00:00.000Z",
  price: firstFurniture.price + thirdFurniture.price,
};

beforeEach(async () => {
  await Transaction.deleteMany();
  await new Transaction(firstTransaction).save();
  await new Transaction(secondTransaction).save();
  await new Transaction(thirdTransaction).save();
  await new Transaction(fourthTransaction).save();
});

//###############TRANSACTIONS##################//

//###GET###//
describe("GET /transactions", () => {
  it("Should get all transactions if there is no cif or nif in the body", async () => {
    const response = await request(app).get("/transactions").expect(200);
    expect(
      response.body.map((transaction: ITransaction) => ({
        _id: transaction._id,
        type: transaction.type,
        customer: transaction.customer,
        provider: transaction.provider,
        date: transaction.date,
        furniture: transaction.furniture,
        price: transaction.price,
      })),
    ).to.deep.include.members([
      firstTransaction,
      secondTransaction,
      thirdTransaction,
      fourthTransaction,
    ]);
  });

  it("Should get transactions associated with a customer's ID number if dni query parameter is provided", async () => {
    const response = await request(app)
      .get("/transactions?dni=43549856D")
      .expect(200);
    expect(
      response.body.map((transaction: ITransaction) => ({
        _id: transaction._id,
        type: transaction.type,
        customer: transaction.customer,
        provider: transaction.provider,
        date: transaction.date,
        furniture: transaction.furniture,
        price: transaction.price,
      })),
    ).to.deep.include.members([thirdTransaction]);
  });

  it("Should get transactions associated with a provider's ID number if cif query parameter is provided", async () => {
    const response = await request(app)
      .get("/transactions?cif=A12345678")
      .expect(200);
    expect(
      response.body.map((transaction: ITransaction) => ({
        _id: transaction._id,
        type: transaction.type,
        customer: transaction.customer,
        provider: transaction.provider,
        date: transaction.date,
        furniture: transaction.furniture,
        price: transaction.price,
      })),
    ).to.deep.include.members([firstTransaction]);
  });

  it("Should get transactions within a date range if Idate and Fdate query parameters are provided", async () => {
    const response = await request(app)
      .get("/transactions?Idate=2022-01-01&Fdate=2022-01-03")
      .expect(200);
    expect(
      response.body.map((transaction: ITransaction) => ({
        _id: transaction._id,
        type: transaction.type,
        customer: transaction.customer,
        provider: transaction.provider,
        date: transaction.date,
        furniture: transaction.furniture,
        price: transaction.price,
      })),
    ).to.deep.include.members([
      firstTransaction,
      secondTransaction,
      thirdTransaction,
    ]);
  });
});

//###POST###//
describe("POST /transactions", () => {
  it("Should create a new purchase transaction and calculate the total price", async () => {
    const response = await request(app)
      .post("/transactions")
      .send({
        type: "Purchase",
        cif: firstProvider.cif,
        furniture: [
          {
            quantity: 2,
            name: firstFurniture.name,
            material: firstFurniture.material,
            color: firstFurniture.color,
          },
        ],
      })
      .expect(201);
    expect(response.body.price).to.equal(firstFurniture.price * 2);
  });

  it("Should create a new purchase transaction with more furnitures and calculate the total price", async () => {
    const response = await request(app)
      .post("/transactions")
      .send({
        type: "Purchase",
        cif: firstProvider.cif,
        furniture: [
          {
            quantity: 2,
            name: firstFurniture.name,
            material: firstFurniture.material,
            color: firstFurniture.color,
          },
          {
            quantity: 1,
            name: secondFurniture.name,
            material: secondFurniture.material,
            color: secondFurniture.color,
          },
        ],
      })
      .expect(201);
    expect(response.body.price).to.equal(
      firstFurniture.price * 2 + secondFurniture.price,
    );
  });

  it("Should create a new purchase transaction and calculate the total price", async () => {
    const response = await request(app)
      .post("/transactions")
      .send({
        type: "Sale",
        dni: firstCustomer.dni,
        furniture: [
          {
            quantity: 2,
            name: firstFurniture.name,
            material: firstFurniture.material,
            color: firstFurniture.color,
          },
        ],
      })
      .expect(201);
    expect(response.body.price).to.equal(firstFurniture.price * 2);
  });

  it("Should create a new sale transaction with more furnitures and calculate the total price", async () => {
    const response = await request(app)
      .post("/transactions")
      .send({
        type: "Sale",
        dni: firstCustomer.dni,
        furniture: [
          {
            quantity: 2,
            name: firstFurniture.name,
            material: firstFurniture.material,
            color: firstFurniture.color,
          },
          {
            quantity: 1,
            name: secondFurniture.name,
            material: secondFurniture.material,
            color: secondFurniture.color,
          },
        ],
      })
      .expect(201);
    expect(response.body.price).to.equal(
      firstFurniture.price * 2 + secondFurniture.price,
    );
  });

  it("Should return 400 if there is not enough quantity to sale", async () => {
    const response = await request(app)
      .post("/transactions")
      .send({
        type: "Sale",
        dni: firstCustomer.dni,
        furniture: [
          {
            quantity: 10,
            name: firstFurniture.name,
            material: firstFurniture.material,
            color: firstFurniture.color,
          },
        ],
      })
      .expect(400);
    expect(response.body).to.have.property("error", "Not enough quantity");
  });

  const newFurniture = {
    name: "New Furniture",
    description: "New Furniture Description",
    material: "Wood",
    dimensions: "100x100x100",
    quantity: 10,
    price: 100,
    color: "Brown",
  };

  new Furniture(newFurniture).save();

  it("A new piece of furniture must be created in the database if an unknown furniture is purchased", async () => {
    const response = await request(app)
      .post("/transactions")
      .send({
        type: "Purchase",
        cif: firstProvider.cif,
        furniture: [
          {
            quantity: 2,
            name: firstFurniture.name,
            material: firstFurniture.material,
            color: firstFurniture.color,
          },
          newFurniture,
        ],
      })
      .expect(201);
    expect(response.body.price).to.equal(
      firstFurniture.price * 2 + newFurniture.price * newFurniture.quantity,
    );
    expect(Furniture.findOne({ name: newFurniture.name })).to.not.be.null;
  });

  it("should not create transactions with negative quantities", async () => {
    const response_1 = await request(app)
      .post("/transactions")
      .send({
        type: "Purchase",
        cif: firstProvider.cif,
        furniture: [
          {
            quantity: -2,
            name: firstFurniture.name,
            material: firstFurniture.material,
            color: firstFurniture.color,
          },
          newFurniture,
        ],
      })
      .expect(400);
    expect(response_1.body).to.have.property(
      "error",
      "Quantity must be a positive number",
    );

    const response_2 = await request(app)
      .post("/transactions")
      .send({
        type: "Sale",
        dni: firstCustomer.dni,
        furniture: [
          {
            quantity: -2,
            name: firstFurniture.name,
            material: firstFurniture.material,
            color: firstFurniture.color,
          },
          newFurniture,
        ],
      })
      .expect(400);
    expect(response_2.body).to.have.property(
      "error",
      "Quantity must be a positive number",
    );
  });

  it("should return an error if furniture name is not found", async () => {
    const response = await request(app)
      .post("/transactions")
      .send({
        type: "Sale",
        dni: firstCustomer.dni,
        furniture: [
          {
            quantity: 2,
            name: "Unknown Furniture",
            material: firstFurniture.material,
            color: firstFurniture.color,
          },
        ],
      })
      .expect(400);
    expect(response.body).to.have.property("error", "Furniture name not found");
  });

  it("should return an error if furniture material is not found", async () => {
    const response = await request(app)
      .post("/transactions")
      .send({
        type: "Sale",
        dni: firstCustomer.dni,
        furniture: [
          {
            quantity: 2,
            name: firstFurniture.name,
            material: "Unknown Material",
            color: firstFurniture.color,
          },
        ],
      })
      .expect(400);
    expect(response.body).to.have.property(
      "error",
      "Furniture material not found",
    );
  });

  it("should return an error if furniture color is not found", async () => {
    const response = await request(app)
      .post("/transactions")
      .send({
        type: "Sale",
        dni: firstCustomer.dni,
        furniture: [
          {
            quantity: 2,
            name: firstFurniture.name,
            material: firstFurniture.material,
            color: "Unknown Color",
          },
        ],
      })
      .expect(400);
    expect(response.body).to.have.property(
      "error",
      "Furniture color not found",
    );
  });

  it("should return 500 if trying to purchase a furniture without enough attributes ", async () => {
    await request(app)
      .post("/transactions")
      .send({
        type: "Sale",
        dni: firstCustomer.dni,
        furniture: [
          {
            quantity: 2,
            name: "Unknown Furniture",
            material: firstFurniture.material,
            color: firstFurniture.color,
          },
        ],
      })
      .expect(400);
  });

  it("Should not create a new sale if the customer does not exist", async () => {
    const response = await request(app)
      .post("/transactions")
      .send({
        type: "Sale",
        dni: "42808994P",
        furniture: [
          {
            quantity: 2,
            name: firstFurniture.name,
            material: firstFurniture.material,
            color: firstFurniture.color,
          },
        ],
      })
      .expect(404);
    expect(response.body).to.have.property("error", "Customer not found");
  });

  it("Should not create a new purchase if the provider does not exist", async () => {
    const response = await request(app)
      .post("/transactions")
      .send({
        type: "Purchase",
        cif: "V12345889",
        furniture: [
          {
            quantity: 2,
            name: firstFurniture.name,
            material: firstFurniture.material,
            color: firstFurniture.color,
          },
        ],
      })
      .expect(404);
    expect(response.body).to.have.property("error", "Provider not found");
  });
});

//###PATCH###//
describe("PATCH /transactions/:id", () => {
  it("Should not update a transaction's type", async () => {
    const response = await request(app)
      .patch(`/transactions/${firstTransaction._id}`)
      .send({ type: "Purchase"})
      .expect(400);
    expect(response.body).to.have.property( "error", "You cannot change the type of the transaction" );
  });

  it("Should update a transaction's customer", async () => {
    const response = await request(app)
      .patch(`/transactions/${fourthTransaction._id}`)
      .send({ customer: firstCustomer._id})
      .expect(201);
    expect(response.body).to.have.property("message", "Transaction updated");
  });

  it("Should not ", async () => {
    const response = await request(app)
      .patch(`/transactions/${firstTransaction._id}`)
      .send({ provider: secondProvider._id })
      .expect(201);
    expect(response.body).to.have.property("message", "Transaction updated");
  });

  it("Should update a transaction's furniture", async () => {
    const updatedFurniture = [
      {
        quantity: 2,
        name: firstFurniture.name,
        material: firstFurniture.material,
        color: firstFurniture.color,
      },
      {
        quantity: 4,
        name: secondFurniture.name,
        material: secondFurniture.material,
        color: secondFurniture.color,
      },
    ];
    await request(app)
      .patch(`/transactions/${firstTransaction._id}`)
      .send({ furniture: updatedFurniture })
      .expect(201);
  });

  it("Should update a transaction's date", async () => {
    const updatedDate = "2022-01-05T00:00:00.000Z";
    const response = await request(app)
      .patch(`/transactions/${firstTransaction._id}`)
      .send({ date: updatedDate })
      .expect(201);
    expect(response.body).to.have.property("message", "Transaction updated");
  });

  it("Should update a transaction's price", async () => {
    const updatedPrice = 1000;
    const response = await request(app)
      .patch(`/transactions/${firstTransaction._id}`)
      .send({ price: updatedPrice })
      .expect(400);
    expect(response.body).to.have.property("error", "You cannot change the price of the transaction, only if you change the furniture");
  });

  it("Should return 404 if the transaction ID does not exist", async () => {
    const response = await request(app)
      .patch(`/transactions/663d72f1e8c597ba49ab8aa0`)
      .send({ customer: firstCustomer._id })
      .expect(404);
    expect(response.body).to.have.property("error", "Transaction not found");
  });
});

describe("DELETE /transactions/:id", () => {
  it("Should delete a transaction if its exist", async () => {
  await request(app).delete(`/transactions/${firstTransaction._id}`).expect(201);
  });

  it("Should return 400 if the transaction ID does not exist ", async () => {
    await request(app).delete(`/transactions/663d72f1e8c597ba49ab8aa0`).expect(404);
  });
});