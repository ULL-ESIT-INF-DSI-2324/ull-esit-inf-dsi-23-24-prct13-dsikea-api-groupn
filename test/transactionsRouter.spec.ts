import request from "supertest";
import { app } from "../src/indexApp.js";
import Transaction from "../src/models/transaction.js";
import { ITransaction } from "../src/models/transaction.js";
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
        provider: firstProvider._id,
        furniture: [
          {
            furniture: firstFurniture._id,
            quantity: 2,
          },
          {
            furniture: secondFurniture._id,
            quantity: 1,
          },
        ],
      })
      .expect(201);

    expect(response.body.provider).to.equal(
      firstFurniture.price * 2 + secondFurniture.price,
    );
  });

//   it("Should create a new sale transaction", async () => {
//     const newTransaction = {
//       type: "Sale",
//       customer: firstCustomer._id,
//       furniture: [
//         {
//           furniture: firstFurniture._id,
//           quantity: 1,
//         },
//         {
//           furniture: thirdFurniture._id,
//           quantity: 2,
//         },
//       ],
//       date: "2022-01-06T00:00:00.000Z",
//     };

//     const response = await request(app)
//       .post("/transactions")
//       .send(newTransaction)
//       .expect(201);

//     expect(response.body).to.have.property("_id");
//     expect(response.body.type).to.equal(newTransaction.type);
//     expect(response.body.customer).to.equal(newTransaction.customer);
//     expect(response.body.furniture).to.deep.equal(newTransaction.furniture);
//     expect(response.body.date).to.equal(newTransaction.date);
//   });

//   it("Should return 400 if transaction type is invalid", async () => {
//     const newTransaction = {
//       type: "InvalidType",
//       customer: firstCustomer._id,
//       furniture: [
//         {
//           furniture: firstFurniture._id,
//           quantity: 1,
//         },
//       ],
//       date: "2022-01-07T00:00:00.000Z",
//     };

//     const response = await request(app)
//       .post("/transactions")
//       .send(newTransaction)
//       .expect(400);

//     expect(response.body).to.have.property("error", "Invalid transaction type");
//   });

//   it("Should return 400 if furniture quantity is invalid", async () => {
//     const newTransaction = {
//       type: "Purchase",
//       provider: firstProvider._id,
//       furniture: [
//         {
//           furniture: firstFurniture._id,
//           quantity: -1,
//         },
//       ],
//       date: "2022-01-08T00:00:00.000Z",
//     };

//     const response = await request(app)
//       .post("/transactions")
//       .send(newTransaction)
//       .expect(400);

//     expect(response.body).to.have.property(
//       "error",
//       "Invalid furniture quantity",
//     );
//   });

//   it("Should return 400 if furniture ID is invalid", async () => {
//     const newTransaction = {
//       type: "Sale",
//       customer: firstCustomer._id,
//       furniture: [
//         {
//           furniture: "invalidFurnitureId",
//           quantity: 1,
//         },
//       ],
//       date: "2022-01-09T00:00:00.000Z",
//     };

//     const response = await request(app)
//       .post("/transactions")
//       .send(newTransaction)
//       .expect(400);

//     expect(response.body).to.have.property("error", "Invalid furniture ID");
//   });

//   it("Should return 400 if provider ID is invalid", async () => {
//     const newTransaction = {
//       type: "Purchase",
//       provider: "invalidProviderId",
//       furniture: [
//         {
//           furniture: firstFurniture._id,
//           quantity: 1,
//         },
//       ],
//       date: "2022-01-10T00:00:00.000Z",
//     };

//     const response = await request(app)
//       .post("/transactions")
//       .send(newTransaction)
//       .expect(400);

//     expect(response.body).to.have.property("error", "Invalid provider ID");
//   });

//   it("Should return 400 if customer ID is invalid", async () => {
//     const newTransaction = {
//       type: "Sale",
//       customer: "invalidCustomerId",
//       furniture: [
//         {
//           furniture: firstFurniture._id,
//           quantity: 1,
//         },
//       ],
//       date: "2022-01-11T00:00:00.000Z",
//     };

//     const response = await request(app)
//       .post("/transactions")
//       .send(newTransaction)
//       .expect(400);

//     expect(response.body).to.have.property("error", "Invalid customer ID");
//   });
});

// it('Should get all transactions', async () => {
//   const response = await request(app)
//     .get('/transactions')
//     .expect(200);

//   expect(response.body).to.be.an('array');
// });

// it('Should return 404 if transaction not found', async () => {
//   const response = await request(app)
//     .get('/transactions/non_existent_id')
//     .expect(404);

//   expect(response.body).to.have.property('error', 'Transaction not found');
// });
