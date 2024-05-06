import { Document, connect, model, Schema } from "mongoose";

connect("mongodb://127.0.0.1:27017/customers")
  .then(() => {
    console.log("Connected to the customers database");
  })
  .catch(() => {
    console.log(
      "Something went wrong when conecting to the customers database",
    );
  });

interface ICustomer extends Document {
  name: string;
  contact: string;
  email: string;
  address: string;
  dni: string;
}

export const customerSchema: Schema = new Schema<ICustomer>({
  name: { type: String, required: true },
  contact: { type: String, required: true , validate: (value: string) => {
      if(!value.match(/^\d{3} \d{3} \d{3}$/)){
        throw new Error("Invalid phone number");
      }
    }
  },
  email: { type: String, required: true, validate:(value: string) => {
      if(!value.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)){
        throw new Error("Invalid email");
      }
    }
  },
  address: { type: String, required: true, validate: (value: string) => {
      // Comprobar esta y las demas regexps
      if(!value.match(/^\d{1,5} \w{3,}\s\w{3,}\s\w{3,}$/)){
        throw new Error("Invalid address");
      }
    }
  },
  dni: { type: String, required: true, validate: (value: string) => {
      if(!value.match(/^\d{8}[A-Z]$/)){
        throw new Error("Invalid DNI");
      }
  }
}
});

export default model<ICustomer>("Customer", customerSchema);