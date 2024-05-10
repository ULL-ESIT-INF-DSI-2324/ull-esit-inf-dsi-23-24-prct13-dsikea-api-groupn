import request from "supertest";
import { app } from "../src/indexApp.js";
import Furniture, { IFurniture } from "../src/models/furniture.js";
import { expect } from 'chai';

const firstFurniture = {
  _id: "663d73b33d7e7cf6d813e6f7",
  name: "Chair",
  description: "Wooden chair",
  material: "wood",
  color: "red",
  price: 50,
  quantity: 2,
  dimensions:  {
    _id: '663d793e2eaa62395d19232c',
    length: 4,
    width: 7,
    height: 8,
  }

  };

const secondFurniture = {
  _id: "507f1f77bcf86cd799439011",
  name: "Table",
  description: "Glass table",
  material: "glass",
  color: "blue",
 
  quantity: 7,
  price: 100,
  dimensions:  {
    _id: "663d72f1e8c597ba49ab8aab",
    length: 4,
    width: 7,
    height: 8,
  }
};

beforeEach(async () => {
  await Furniture.deleteMany();
  await new Furniture(firstFurniture).save();
  await new Furniture(secondFurniture).save();
});

//###############FURNITURES##################//

//### GET ###//
describe("GET /furnitures", () => {
  it("Should get a furniture by ID", async () => {
    const response = await request(app).get("/furnitures/507f1f77bcf86cd799439011").expect(200);
    expect(response.body).to.include({
      _id: "507f1f77bcf86cd799439011",
      name: "Table",
      description: "Glass table",
      material: "glass",
      color: "blue",
      price: 100,
      quantity: 7,
    });
    expect(response.body.dimensions).to.include({
      height: 8,
      length: 4,
      width: 7
    });
  });

  it("Should find all furnitures", async () => {
    const response = await request(app).get("/furnitures").expect(200);
      expect(response.body.map((furniture: IFurniture ) => ({
        name: furniture.name,
        description: furniture.description,
        material: furniture.material,
        color: furniture.color,
        price: furniture.price,
        quantity: furniture.quantity
      }))).to.deep.include.members([
        {
          name: "Chair",
          description: "Wooden chair",
          material: "wood",
          color: "red",
          price: 50,
          quantity: 2, 
        },
        {
   
          name: "Table",
          description: "Glass table",
          material: "glass",
          color: "blue",
          price: 100,
          quantity: 7,
        }
      ]);

  });



  it("Should return 200 furniture name found", async () => {
    const response = await request(app).get("/furnitures?name=Chair").expect(200);
    // Ignoramos los campos _id y __v en la comparación
    const expectedObject = {
      name: 'Chair',
      description: 'Wooden chair',
      material: 'wood',
      price: 50,
      quantity: 2,
      color: 'red',
    };
  
    // Verificamos que cada objeto en la respuesta incluya las propiedades del objeto esperado
    response.body.forEach((item: {name: string,
      description: string,
      material: string,
      price: number,
      quantity: number,
      color: string}) => {
      expect(item).to.include(expectedObject);
    });
  });
});
describe("GET /furnitures", () => {
    it("Should return 404 if furniture ID not found", async () => {
      const response = await request(app).get("/furnitures/663d72f1e8c597ba49ab8aa0").expect(404);
      expect(response.body.error).to.eql('Furniture not found');
    });
});
// //### POST ###//
// describe("POST /furnitures", () => {
//   it('Should successfully create a new furniture', async () => {
//     const response = await request(app).post('/furnitures').send({
//       name: "Sofa",
//       description: "Comfy sofa",
//       material: "Fabric",
//       price: 300,
//     }).expect(201);
//     expect(response.body).to.include({
//       name: "Sofa",
//       description: "Comfy sofa",
//       material: "Fabric",
//       price: 300,
//     });
//   });

//   it('Should return 500 if price is missing', async () => {
//     const response = await request(app).post('/furnitures').send({
//       name: "Bookshelf",
//       description: "Wooden bookshelf",
//       material: "Wood",
//     }).expect(500);
//     expect(response.body.message).to.eql('Error when adding furniture');
//   });
// });

// //### PATCH ###//
// describe("PATCH /furnitures/:id", () => {
//   it('Should successfully modify a furniture by ID', async () => {
//     const response = await request(app).patch('/furnitures/507f1f77bcf86cd799439011').send({
//       name: "Chair",
//       description: "Modern chair",
//       price: 80,
//     }).expect(200);
//     expect(response.body).to.include({
//       _id: "507f1f77bcf86cd799439011",
//       name: "Chair",
//       description: "Modern chair",
//       material: "Wood",
//       price: 80,
//     });
//   });

//   it('Should return 404 if furniture ID not found', async () => {
//     const response = await request(app).patch('/furnitures/997f1f77bcf86cd799439059').send({
//       name: "Chair",
//       description: "Modern chair",
//       price: 80,
//     }).expect(404);
//     expect(response.body.error).to.eql('Furniture not found');
//   });
// });

// //### DELETE ###//
// describe("DELETE /furnitures/:id", () => {
//   it('Should successfully delete a furniture by ID', async () => {
//     const response = await request(app).delete('/furnitures/507f1f77bcf86cd799439011').expect(200);
//     expect(response.body).to.eql({
//       message: "Furniture deleted successfully"
//     });
//   });
  
//   it('Should return 404 if furniture ID not found', async () => {
//     const response = await request(app).delete('/furnitures/997f1f77bcf86cd799439059').expect(404);
//     expect(response.body.error).to.eql('Furniture not found');
//   });
// });
