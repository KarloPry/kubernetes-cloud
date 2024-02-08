const express = require("express");
const app = express();
const Morgan = require("morgan");

app.use(Morgan("dev"));
app.get("/", (req, res) => {
  res.status(200).send("Hello World");
});
app.listen(3000, "0.0.0.0", () => {
  console.log("Server is running on port 3000");
});
