/* 
    Load config
*/
require("./src/config");

const express = require("express");
const { errorText } = require("./src/utils/color");
const { connectDb } = require("./src/database");
const cors = require("cors");

const app = express();

/* 
    Server port
*/
const port = process.env.SERVER_PORT || 3000;

/* 
    Limit request to 10mb
*/
app.use(
  express.json({
    limit: "10mb",
  })
);

/* 
    CORS
*/
app.use(cors());

/* 
    APIs
*/
app.use("/api", require("./src/routes/index"));

/* 
    Start listen server
*/
app.listen(port, async (err) => {
  if (err) {
    console.lo(errorText(`can't start server on port ${port}`));
    process.exit(1);
  }

  console.log(`Server on port ${port}`);
  try {
    connectDb();
  } catch (e) {}
});
