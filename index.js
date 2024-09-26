const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

let users = {};

app.use(bodyParser.json());

app.post("/register", (req, res) => {
  const { userID } = req.body;

  if (users[userID]) {
    return res.status(400).json({ message: "User already registered" });
  }

  users[userID] = 1000;
  res.json({ balance: users[userID] });
});

app.get("/save-money", (req, res) => {
  const { userID, amount } = req.query;

  if (!users[userID]) {
    return res.status(404).json({ message: "User not found" });
  }

  users[userID] += parseInt(amount, 10);
  res.json({ totalMoney: users[userID] });
});

app.get("/deduct-money", (req, res) => {
  const { userID, amount } = req.query;

  if (!users[userID]) {
    return res.status(404).json({ message: "User not found" });
  }

  users[userID] -= parseInt(amount, 10);
  res.json({ totalMoney: users[userID] });
});

app.get("/check-user", (req, res) => {
  const { userID } = req.query;
  const usersMoney = readUserMoney();
  const exists = !!usersMoney[userID];
  const balance = exists ? usersMoney[userID] : 0;

  res.json({ exists, balance });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
