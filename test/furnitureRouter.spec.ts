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

  const thirstFurniture = {
    _id: "663d73b33d7e7cf6d813e6f9",
    name: "Chair",
    description: "Glasses chair",
    material: "glass",
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
  

const secondFurniture = {
  _id: "507f1f77bcf86cd799439011",
  name: "Table",
  description: "Wood table",
  material: "wood",
  color: "blue",
 
  quantity: 7,
  price: 100,
  dimensions:  {
    _id: "663d72f1e8c597ba49ab8aab",
    length: 5,
    width: 7,
    height: 8,
  }
};

beforeEach(async () => {
  await Furniture.deleteMany();
  await new Furniture(firstFurniture).save();
  await new Furniture(secondFurniture).save();
  await new Furniture(thirstFurniture).save();


});

//###############FURNITURES##################//

//### GET ###//
describe("GET /furnitures", () => {

  it("Should find all furnitures", async () => {
    const response = await request(app).get("/furnitures").expect(200);
      expect(response.body.map((furniture: IFurniture ) => ({
        name: furniture.name,
        description: furniture.description,
        material: furniture.material,
        color: furniture.color,
        price: furniture.price,
        quantity: furniture.quantity,
        dimensions: furniture.dimensions
      }))).to.deep.include.members([
        {
          name: "Chair",
          description: "Wooden chair",
          material: "wood",
          color: "red",
          price: 50,
          quantity: 2, 
          dimensions: {
            _id: firstFurniture.dimensions._id,
            length: 4,
            width: 7,
            height: 8,
          }
        },
        {
          name: "Table",
          description: "Wood table",
          material: "wood",
          color: "blue",
          quantity: 7,
          price: 100,
          dimensions:  {
            _id: secondFurniture.dimensions._id,
            length: 5,
            width: 7,
            height: 8,
          }
        },
        
        {
          name: "Chair",
          description: "Glasses chair",
          material: "glass",
          color: "red",
          price: 50,
          quantity: 2,
          dimensions:  {
            _id: thirstFurniture.dimensions._id,
            length: 4,
            width: 7,
            height: 8,
          }
      }
        
      ]);

  });



  it("Should return 200 and two furnitures with name chair ", async () => {
    const response = await request(app).get("/furnitures?name=Chair").expect(200);

    expect(response.body.map((furniture: IFurniture ) => ({
      name: furniture.name,
      description: furniture.description,
      material: furniture.material,
      color: furniture.color,
      price: furniture.price,
      quantity: furniture.quantity,
      dimensions: furniture.dimensions
    }))).to.deep.include.members([
      {
        name: "Chair",
        description: "Wooden chair",
        material: "wood",
        color: "red",
        price: 50,
        quantity: 2, 
        dimensions: {
          _id: firstFurniture.dimensions._id,
          length: 4,
          width: 7,
          height: 8,
        }
      },
      {
        name: "Chair",
        description: "Glasses chair",
        material: "glass",
        color: "red",
        price: 50,
        quantity: 2,
        dimensions:  {
          _id: thirstFurniture.dimensions._id,
          length: 4,
          width: 7,
          height: 8,
        }
     }
    ]);
  });
  it("Should return 404 if furniture name not found", async () => {
    const response = await request(app).get("/furnitures?name=Bed").expect(404);
    expect(response.body).to.eql({error:  "Furnitures not found"});
  });
  it("Should return 200 if furniture name not found", async () => {
    const response = await request(app).get("/furnitures?material=wood").expect(200);
    expect(response.body.map((furniture: IFurniture ) => ({
      name: furniture.name,
      description: furniture.description,
      material: furniture.material,
      color: furniture.color,
      price: furniture.price,
      quantity: furniture.quantity,
      dimensions: furniture.dimensions
    }))).to.deep.include.members([
      {
        name: "Chair",
        description: "Wooden chair",
        material: "wood",
        color: "red",
        price: 50,
        quantity: 2, 
        dimensions: {
          _id: firstFurniture.dimensions._id,
          length: 4,
          width: 7,
          height: 8,
        }
      },
      {
 
        name: "Table",
        description: "Wood table",
        material: "wood",
        color: "blue",
        price: 100,
        quantity: 7,
        dimensions: {
          _id: secondFurniture.dimensions._id,
          length: 5,
          width: 7,
          height: 8,
        }
      }
    ]);
  });
});


describe("GET /furnitures/:id", () => {
  it("Should get a furniture by ID", async () => {
    const response = await request(app).get("/furnitures/507f1f77bcf86cd799439011").expect(200);
    expect(response.body).to.include({
      _id: "507f1f77bcf86cd799439011",
      name: "Table",
      description: "Wood table",
      material: "wood",
      color: "blue",
      price: 100,
      quantity: 7,
    });
    expect(response.body.dimensions).to.include({
      height: 8,
      length: 5,
      width: 7
    });
  });
    it("Should return 404 if furniture ID not found", async () => {
      const response = await request(app).get("/furnitures/663d72f1e8c597ba49ab8aa0").expect(404);
      expect(response.body.error).to.eql('Furniture not found');
    });
});



//### POST ###//
describe("POST /furnitures", () => {
  it('Should successfully create a new furniture', async () => {
    const response = await request(app).post('/furnitures').send({
      name: "Sofa",
      description: "Comfy sofa",
      material: "metal",
      price: 300,
      quantity: 0,
      dimensions:  {
        length: 5,
        width: 9,
        height: 8,
      },
      color: "blue",
    }).expect(200);
    expect(response.body).to.include({message: "Furniture added successfully"});
    const responseget = await request(app).get("/furnitures?name=Sofa").expect(200);

    expect(responseget.body.map((furniture: IFurniture ) => ({
      name: furniture.name,
      description: furniture.description,
      material: furniture.material,
      color: furniture.color,
      price: furniture.price,
      quantity: furniture.quantity,
    }))).to.deep.include.members([
      {
        name: "Sofa",
        description: "Comfy sofa",
        material: "metal",
        price: 300,
        quantity: 0,
        color: "blue",
      }
    ]);
  });
  it('Not should create a new furniture beacuse the quantity is distint a 0', async () => {
    const response = await request(app).post('/furnitures').send({
      name: "Sofa",
      description: "Comfy sofa",
      material: "metal",
      price: 300,
      quantity: 2,
      dimensions:  {
        length: 5,
        width: 9,
        height: 8,
      },
      color: "blue",
    }).expect(400);
    expect(response.body).to.include({error: "You cannot add a piece of furniture with quantity, to do so you must make a transaction",});
  });
  it('Not should create a new furniture beacuse the furniture not have a dimension, material', async () => {
    const response = await request(app).post('/furnitures').send({
      name: "Sofa",
      description: "Comfy sofa",
      price: 300,
      quantity: 0,
      color: "blue",
    }).expect(500);

    expect(response.body).to.include({error: "Error when adding furniture" ,});
  });

  it('Should return 500 if atributes is missing', async () => {
    const response = await request(app).post('/furnitures').send({
      name: "Bookshelf",
      description: "Wooden bookshelf",
      material: "Wood",
      quantity: 0,
    }).expect(500);
    expect(response.body).to.eql({error: "Error when adding furniture"} );
  });
});

//### PATCH ###//
describe("PATCH /furnitures/:id", () => {
  it('Should successfully modify a furniture by ID', async () => {
    const response = await request(app).patch('/furnitures/507f1f77bcf86cd799439011').send({
      name: "Table",
      description: "Glass table",
      material: "glass",
      color: "red",
      price: 50,
      quantity: 0,
      
    }).expect(200);

    expect(response.body).to.include({
      name: "Table",
      description: "Glass table",
      material: "glass",
      color: "red",
      price: 50,
      quantity: 0,
    });
  });

  it('Should return 404 if furniture ID not found', async () => {
    const response = await request(app).patch('/furnitures/997f1f77bcf86cd799439059').send({
      name: "Table",
      description: "Glass table",
      material: "glass",
      color: "red",
      price: 50,
      quantity: 0,
    }).expect(404);
    expect(response.body).to.eql({error: 'Furniture not found'});
  });
  it('Should return 400 if add quantity', async () => {
    const response = await request(app).patch('/furnitures/507f1f77bcf86cd799439011').send({
      name: "Table",
      description: "Glass table",
      material: "glass",
      color: "red",
      quantity: 5,
    }).expect(400);
    expect(response.body).to.eql( {error: "You cannot add a piece of furniture with quantity, to do so you must make a transaction", });
  });
});


describe("PATCH /furnitures", () => {
  it('Should successfully modify a furniture by name and material', async () => {
    const response = await request(app).patch('/furnitures?name=Table&material=wood').send({
      name: "Table",
      description: "Glass table",
      material: "glass",
      color: "red",
      price: 3,
      quantity: 0,
      
    }).expect(200);

    expect(response.body.furniture).to.include({
      name: "Table",
      description: "Glass table",
      material: "glass",
      color: "red",
      price: 3,
      quantity: 0,
    });
    expect(response.body).to.include({message: "Furniture updated successfully"});
  });

  it('Should return 404 if furniture ID not found', async () => {
    const response = await request(app).patch('/furnitures?name=Tabla').send({
      name: "Table",
      description: "Glass table",
      material: "glass",
      color: "red",
      price: 50,
      quantity: 0,
    }).expect(404);
    expect(response.body).to.eql({error: 'Furniture not found'});
  });
  it('Should return 400 if add quantity', async () => {
    const response = await request(app).patch('/furnitures?material=acero').send({
      name: "Table",
      description: "Glass table",
      material: "glass",
      color: "red",
      quantity: 5,
    }).expect(400);
    expect(response.body).to.eql( {error: "You cannot add a piece of furniture with quantity, to do so you must make a transaction", });
  });
  it('Should return 400 Invalid search parameters', async () => {
    const response = await request(app).patch('/furnitures?modelo=x21').send({
      name: "Table",
      description: "Glass table",
      material: "glass",
      color: "red",
      quantity: 0,
    }).expect(400);
    expect(response.body).to.eql( {error:
      "Invalid search parameters, remember that the possible fields are: name, description, material and price"
  });
});
});


//### DELETE ###//
describe("DELETE /furnitures", () => {
  it('Should successfully delete a furniture by ID', async () => {
    const response = await request(app).delete('/furnitures?name=Table').expect(200);
    expect(response.body).to.eql({
      message: "Furniture deleted successfully"
    });
    const response_get_delete = await request(app).get("/furnitures?name=Table").expect(404);
    expect(response_get_delete.body).to.eql({
      error: "Furnitures not found"
    });
  });
  
  it('Should return 500 Multiple matching furniture', async () => {
    const response = await request(app).delete('/furnitures?name=Chair').expect(500);
    expect(response.body.error).to.eql('Multiple matching furniture items have been found.');
  });
  it('Should return 500 if furniture atribute is disntint', async () => {
    const response = await request(app).delete('/furnitures?nombre=Chair').expect(400);
    expect(response.body).to.eql({error:
      "Invalid search parameters, remember that the possible fields are: name, description, material and price",
  });
  });
});

//### DELETE ###//
describe("DELETE /furnitures/:id", () => {
  it('Should successfully delete a furniture by ID', async () => {
    const response = await request(app).delete('/furnitures/507f1f77bcf86cd799439011').expect(200);
    expect(response.body).to.eql({
      message: "Furniture deleted successfully"
    });
    const response_get_delete = await request(app).get("/furnitures/507f1f77bcf86cd799439011").expect(404);
    expect(response_get_delete.body).to.eql({
      error: "Furniture not found"
    });
  });
  
  it('Should return 404 if furniture ID not found', async () => {
    const response = await request(app).delete('/furnitures/997f1f77bcf86cd799439059').expect(404);
    expect(response.body.error).to.eql('Furniture not found');
  });
  it('Should return 500 if furniture ID is disntint format', async () => {
    const response = await request(app).delete('/furnitures/997f').expect(500);
    expect(response.body).to.eql({error: "Error when deleting furniture"});
  });
});
