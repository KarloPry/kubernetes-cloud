const express = require("express");
const app = express();
const Morgan = require("morgan");
const mysql = require("mysql2");

app.use(Morgan("dev"));
app.get("/", (req, res) => {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST || "mysql.default.svc.cluster.local",
    user: process.env.DB_USER || "root",
    password: process.env.MYSQL_ROOT_PASSWORD || "password",
  });
  //Query to create database
  connection.query(
    "CREATE DATABASE IF NOT EXISTS test",
    function (err, result) {
      if (err) throw err;
      console.log("Database created");
    }
  );
  //Query to create table
  connection.query("USE test", function (err, result) {
    if (err) throw err;
    console.log("Database selected");
  });
  connection.query(
    "CREATE TABLE IF NOT EXISTS test (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))",
    function (err, result) {
      if (err) throw err;
      console.log("Table created");
    }
  );
  //Query to insert data
  connection.query(
    "INSERT INTO test (name) VALUES ('Docker')",
    function (err, result) {
      if (err) throw err;
      console.log("Data inserted");
    }
  );
  //Query to select data
  connection.query("SELECT * FROM test", function (err, result) {
    if (err) throw err;
    console.log("Data selected");
  });
  //Return the result
  connection.query("SELECT * FROM test", function (err, result) {
    if (err) throw err;
    res.send(result);
  });
  connection.end();
});
app.listen(3000, "0.0.0.0", () => {
  console.log("Server is running on port 3000");
});
