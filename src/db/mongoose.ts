import { connect } from "mongoose";

/**
 * Connects to the MongoDB database using the provided URL.
 *
 * @param {string} process.env.MONGODB_URL - The URL of the MongoDB database.
 * @returns {Promise<void>} A promise that resolves when the connection is successful.
 * @throws {Error} If there is an error connecting to the database.
 */
connect(process.env.MONGODB_URL!)
  .then(() => {
    console.log("Connected to the database");
  })
  .catch(() => {
    console.log("Something went wrong when conecting to the database");
    process.exit(-1);
  });
