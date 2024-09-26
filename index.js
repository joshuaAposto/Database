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
  const { userID } = req.body;
  const usersMoney = readUserMoney();

  if (usersMoney[userID]) {
    return res.status(400).json({ error: "User already registered." });
  }

  usersMoney[userID] = { balance: 1000, banned: false };
  writeUserMoney(usersMoney);
  res.json({ userID, balance: usersMoney[userID].balance });
});

app.post("/manage-user", (req, res) => {
  const { adminID, userID, action } = req.body;
  
  if (adminID !== "100088690249020") {
    return res.status(403).json({ error: "You are not authorized to perform this action." });
  }

  const usersMoney = readUserMoney();

  if (!usersMoney[userID]) {
    return res.status(400).json({ error: "User not found." });
  }

  if (action === "ban") {
    usersMoney[userID].banned = true;
    writeUserMoney(usersMoney);
    return res.json({ message: `User ${userID} has been banned.` });
  } else if (action === "unban") {
    usersMoney[userID].banned = false;
    writeUserMoney(usersMoney);
    return res.json({ message: `User ${userID} has been unbanned.` });
  } else {
    return res.status(400).json({ error: "Invalid action. Use 'ban' or 'unban'." });
  }
});

const checkUserStatus = (userID) => {
  const usersMoney = readUserMoney();
  return usersMoney[userID] ? usersMoney[userID].banned : false;
};

const updateUserBalance = (req, res, operation) => {
  const { userID, amount } = req.query;
  const usersMoney = readUserMoney();

  if (!usersMoney[userID]) {
    return res.status(400).json({ error: "User not found." });
  }

  if (checkUserStatus(userID)) {
    return res.status(403).json({ error: "User is banned." });
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
  const isBanned = exists && checkUserStatus(userID);
  const balance = exists ? usersMoney[userID].balance : 0;

  res.json({ exists, balance, isBanned });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
