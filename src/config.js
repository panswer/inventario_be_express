const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const { warningText } = require("./utils/color");

const fileEnv = path.resolve(__dirname, "../.env");

if (fs.existsSync(fileEnv)) {
  dotenv.config({
    path: fileEnv,
  });
} else {
  console.log(warningText(".env not found"));
}
