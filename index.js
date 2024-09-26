const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const userMoneyFile = path.join(__dirname, "userMoney.json");

const initializeUserMoneyFile = () => {
  if (!fs.existsSync(userMoneyFile)) {
    fs.writeFileSync(userMoneyFile, JSON.stringify({}));
  }
};

initializeUserMoneyFile();

const readUserMoney = () => {
  return JSON.parse(fs.readFileSync(userMoneyFile, "utf8"));
};

const writeUserMoney = (data) => {
  fs.writeFileSync(userMoneyFile, JSON.stringify(data, null, 2));
};

app.post("/register", (req, res) => {
  const { userID, userName } = req.body;
  const usersMoney = readUserMoney();

  if (usersMoney[userID]) {
    return res.status(400).json({ error: "User already registered." });
  }

  usersMoney[userID] = { balance: 1000, name: userName };
  writeUserMoney(usersMoney);
  res.json({ userID, balance: usersMoney[userID].balance, name: userName });
});

const updateUserBalance = (req, res, operation) => {
  const { userID, amount } = req.query;
  const usersMoney = readUserMoney();

  if (!usersMoney[userID]) {
    return res.status(400).json({ error: "User not found." });
  }

  const parsedAmount = parseInt(amount, 10);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: "Invalid amount." });
  }

  if (operation === "add") {
    usersMoney[userID].balance += parsedAmount;
  } else {
    if (usersMoney[userID].balance < parsedAmount) {
      return res.status(400).json({ error: "Insufficient funds." });
    }
    usersMoney[userID].balance -= parsedAmount;
  }

  writeUserMoney(usersMoney);
  res.json({ userID, totalMoney: usersMoney[userID].balance });
};

app.get("/save-money", (req, res) => updateUserBalance(req, res, "add"));
app.get("/deduct-money", (req, res) => updateUserBalance(req, res, "deduct"));

app.get("/check-user", (req, res) => {
  const { userID } = req.query;
  const usersMoney = readUserMoney();
  const exists = !!usersMoney[userID];
  const balance = exists ? usersMoney[userID].balance : 0;

  res.json({ exists, balance });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
