/* 
    Load config
*/
const { uploadTempDir, maxFileSize, uploadDir } = require("./src/config");

const express = require("express");
const { errorText } = require("./src/utils/color");
const { connectDb } = require("./src/database");
const cors = require("cors");
const requestLogger = require("./src/middlewares/requestLogger");
const fileUpload = require("express-fileupload");

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
    Request Logger
*/
app.use(requestLogger);

/* 
    CORS
*/
app.use(cors());

/* 
    Static files (uploads)
*/
app.use("/uploads", express.static(uploadDir));

/* 
    File Upload
*/
app.use(fileUpload({
  limits: { fileSize: maxFileSize },
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: uploadTempDir,
}));

/* 
    APIs
*/
app.use("/api", require("./src/routes/index"));

/**
 * Middleware to catch general error
 */
app.use(require("./src/middlewares/errorManager"));

/*
    Start listen server
*/
app.listen(port, async (err) => {
  if (err) {
    console.log(errorText(`can't start server on port ${port}`));
    process.exit(1);
  }

  console.log(`Server on port ${port}`);
  try {
    connectDb();
  } catch (e) { }
});
