import request from "supertest";
import { app } from "../src/indexApp.js";
import Provider from "../src/models/provider.js";
import { IProvider } from "../src/models/provider.js";
import { expect } from 'chai';



const firstProvider = {
  name: "Eduardo Segredo",
  contact: "+34666666666",
  postalCode: "34556",
  cif: "D43549856",
};

const secondProvider = {
  _id: "507f1f77bcf86cd799439011",
  name: "Alejandro Martinez",
  contact: "+34645678976",
  postalCode: "39556",
  cif: "E47540859",
};

beforeEach(async () => {
  await Provider.deleteMany();
  await new Provider(firstProvider).save();
  await new Provider(secondProvider).save();
});


//###############Provider##################//

//###GET###//
describe("GET /provider", () => {
  it("Should get a user by username with the cif in the query", async () => {
    const response = await request(app).get('/providers?cif=D43549856').expect(200);
    expect(response.body).to.include({
      name: "Eduardo Segredo",
      contact: "+34666666666",
      postalCode: "34556",
      cif: "D43549856",
    });
    
  });
  it("Should find all providers", async () => {
    const response = await request(app).get("/providers").expect(200);

    expect(response.body.map((provider: IProvider ) => ({
      name: provider.name,
      contact: provider.contact,
      postalCode: provider.postalCode,
      cif: provider.cif,
    }))).to.deep.include.members([
      {
        name: "Eduardo Segredo",
        contact: "+34666666666",
        postalCode: "34556",
        cif: "D43549856",
      },
      {
        name: "Alejandro Martinez",
        contact: "+34645678976",
        postalCode: "39556",
        cif: "E47540859",
      }
    ]);
  });
  it("Not Should find a user by username beacuse not exist this DNI un the query", async () => {
    const response = await request(app).get("/providers?cif=C43549856").expect(404);
    expect(response.body.error).to.eql('Provider not found')
  });
});

describe("GET /providers/:id", () => {
  it("Should find a provider 2 by id", async () => {
    const response = await request(app).get("/providers/507f1f77bcf86cd799439011").expect(200);
    expect(response.body).to.include({
      _id: "507f1f77bcf86cd799439011",
      name: "Alejandro Martinez",
      contact: "+34645678976",
      postalCode: "39556",
      cif: "E47540859",
    });
  });
  
  it("Not Should find a id not exist", async () => {
    const response = await request(app).get("/providers/663d5ae2b746172c48b08113").expect(404);
    expect(response.body.error).to.eql('Provider not found')
  });
});

//###POST###//
describe("POST /providers", () => {

  it('Should successfully create a new user', async () => {
    const response = await request(app).post('/providers').send({
      name: "Daniel Rodríguez",
      contact: "+34662345696",
      postalCode: "39556",
      cif: "A73799876",
    }).expect(201);
    expect(response.body).to.include(
      {
        name: "Daniel Rodríguez",
        contact: "+34662345696",
        postalCode: "39556",
        cif: "A73799876",
      });
  });

  it('Not Should successfully create a new user beacuse the cif already exists', async () => {
    const response = await request(app).post('/providers').send( {
      name: "Eduardo Segredo",
      contact: "+34666666666",
      postalCode: "34556",
      cif: "D43549856",
    }).expect(400);
    expect(response.body.error).to.eql("CIF already exists");
  });

  it('Not Should successfully create a new user beacuse the invalid number phone', async () => {
    const response = await request(app).post('/providers').send({
      name: "Antonio Mendez",
      contact: "+84676686666",
      postalCode: "34556",
      cif: "47549859D",
    }).expect(500);
    expect(response.text).to.eql('{"errors":{"contact":{"name":"ValidatorError","message":"Invalid phone number","properties":{"message":"Invalid phone number","type":"user defined","path":"contact","value":"+84676686666"},"kind":"user defined","path":"contact","value":"+84676686666"}},"_message":"Provider validation failed","name":"ValidationError","message":"Provider validation failed: contact: Invalid phone number"}',);
  });
 
  
});


//###PATCH###//

describe("PATCH /providers", () => {

  it('Should successfully modify a provider', async () => {
    const response = await request(app).patch('/providers?cif=E47540859').send({
      name: "Alejandro Martinez",
      contact: "+34777345695",
      postalCode: "55555",
    }).expect(200);
    expect(response.body).to.include(
      {
        cif: "E47540859",
        name: "Alejandro Martinez",
        contact: "+34777345695",
        postalCode: "55555",
      });
  });
  it('Not should successfully modify a provider other atributes like _id', async () => {
    const response = await request(app).patch('/providers?cif=E47540859').send({
      _id : "00000000000000000000",
      name: "Alejandro Martinez",
      contact: "+34777345695",
      postalCode: "55555",
    }).expect(400);
    expect(response.body).to.include(
      {
        error : "Update is not permitted"
      });
  });

  it('Not should successfully modify a provider not exist', async () => {
    const response = await request(app).patch('/providers?cif=45549856A').send({
      name: "Eduardo Segredo",
      contact: "+34666666677",
      postalCode: "34556",
    }).expect(404);
    expect(response.body).to.include(
      {
        error: 'Provider not found'
      });
  });
});

describe("PATCH /providers/:id", () => {

  it('Should successfully modify a provider', async () => {
    const response = await request(app).patch('/providers/507f1f77bcf86cd799439011').send({
      name: "Alejandro Martinez Gonzalez",
      postalCode: "66666",
    }).expect(200);
    expect(response.body).to.include(
      {
        cif: "E47540859",
        name: "Alejandro Martinez Gonzalez",
        postalCode: "66666",
      });
  });
  it('Not should  modify a provider other atributes like _id', async () => {
    const response = await request(app).patch('/providers/507f1f77bcf86cd799439011').send({
      _id : "00000000000000000000",
      name: "Alejandro Martinez Gonzalez",
      postalCode: "66666",
    }).expect(400);
    expect(response.body).to.include(
      {
        error : "Update is not permitted"
      });
  });
  it('Not should  modify a provider, not found a provider', async () => {
    const response = await request(app).patch('/providers/997f1f77bcf86cd799439059').send({
      name: "Alejandro Martinez Gonzalez",
      postalCode: "77777",
    }).expect(404);
    expect(response.body).to.include(
      {
        error : "Provider not found"
      });
  });
});

//###DELETE###//
describe("DELETE /providers/:id", () => {

  it('Should successfully delete a provider', async () => {
    const response = await request(app).delete('/providers/507f1f77bcf86cd799439011').expect(200);
    expect(response.body).to.eql(
      {
        message: "Provider deleted"
      });
  });
  
  it('Not should delete a provider, not found a provider', async () => {
    const response = await request(app).patch('/providers/997f1f77bcf86cd799439059').expect(404);
    expect(response.body).to.eql(
      {
        error : "Provider not found"
      });
  });
});

describe("DELETE /providers", () => {

  it('Should successfully delete a provider', async () => {
    const response = await request(app).delete('/providers?cif=E47540859').expect(200);
    expect(response.body).to.eql(
      {
        message: "Provider deleted"
      });
  });
  
  it('Not should delete a provider, not found a provider', async () => {
    const response = await request(app).patch('/providers?cif=48888888A').expect(404);
    expect(response.body).to.eql(
      {
        error : "Provider not found"
      });
  });
  it('Not should delete a provider, not found the cif in the body', async () => {
    const response = await request(app).patch('/providers').expect(404);
    expect(response.body).to.eql(
      {
        error : "You must put cif in the body"
      });
  });
  
});