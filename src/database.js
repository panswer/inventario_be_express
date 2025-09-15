const mongoose = require("mongoose");
const { errorText } = require("./utils/color");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.DB_HOST, {
      dbName: process.env.DB_NAME
    });
  } catch (error) {
    console.log(errorText("No se pudo iniciar la conexión a la base de datos"));
    process.exit(1);
  }

  console.log("Database connected");
};

module.exports = {
  connectDb
}