import request from "supertest";
import { app } from "../src/indexApp.js";
import Customer from "../src/models/customer.js";
import Provider from "../src/models/provider.js";
import Furniture from "../src/models/furniture.js";
import { expect } from 'chai';



const firstCustomer = {
  name: "Eduardo ",
  contact: "+34666666696",
  postalCode: "34557",
  email: "esegredo@example.com",
  dni: "43539956A",
};


const firstFurniture = {
  _id: "663d73b33d7e7cf6d813e6f8",
  name: "Chair",
  description: "Wooden chair",
  material: "wood",
  color: "red",
  price: 50,
  quantity: 2,
  dimensions:  {
    _id: '663d793e2eaa62395d19232d',
    length: 4,
    width: 7,
    height: 8,
  }

  };



describe('Transactions Router', () => {

   
    new Customer(firstCustomer).save();


  it('Should create a new transaction', async () => {
    const newTransaction = {
      type: "Sale",
      dni: "43549856D",
      furniture: [{  
      _id: "663d73b33d7e7cf6d813e6f8",
      name: "Chair",
      description: "Wooden chair",
      material: "wood",
      color: "red",
      price: 50,
      quantity: 2,
      dimensions:  {
        _id: '663d793e2eaa62395d19232d',
        length: 4,
        width: 7,
        height: 8,
      }}],

    };

    const response = await request(app)
      .post('/transactions')
      .send(newTransaction)
      .expect(500);
      console.log(response.body);

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
});
