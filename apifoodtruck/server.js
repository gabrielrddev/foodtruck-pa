const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./foodtruck_foods.db", (err) => {
  if (err) {
    console.log("Error to connection DB");
  } else {
    console.log("Connected to DB🚀");
  }
});

app.post("/menu", (req, res) => {
  const { foodType } = req.body;
  db.all("SELECT * FROM categorias WHERE nome = ?", foodType, (err, rows) => {
    if (err) {
      res.status(500).json({ error: "Erro ao buscar no banco" });
      return;
    }
    if (rows.length > 0) {
      db.all(
        "SELECT * FROM produtos WHERE categoria_id = ?",
        rows[0].id,
        (err, produtos) => {
          if (err) {
            res.status(500).json({ error: "Erro categoria dos alimentos" });
            return;
          } else {
            //console.log(produtos);
            res.status(200).json({ message: produtos });
          }
        }
      );
    } else {
      res.status(404).json({ message: "Nenhum item encontrado" });
    }
  });
});

app.post("/qrcode", (req, res) => {
  const { scanResult } = req.body;
  db.all(
    "SELECT * FROM qrusers WHERE password = ?",
    scanResult,
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: "usuario invalido" });
        return;
      }
      if (!rows || rows.length === 0) {
        res.status(404).json({ error: "usuario invalido" });
        return;
      }
      if (rows[0].password == scanResult) {
        res.status(200).json({ message: "valido" });
        //console.log(scanResult);
        return;
      }
    }
  );
});
app.post("/receivecart", (req, res) => {
  const { FoodName, FoodPrice, FoodDetails, FoodObservation, FoodTable } =
    req.body;
  db.run(
    `INSERT INTO foods (
      name, price, details, observation, numbertable
    ) VALUES (?, ?, ?, ?, ?)`,
    [FoodName, FoodPrice, FoodDetails, FoodObservation, FoodTable],
    function (err) {
      if (err) {
        return reject(err);
      }
      return "ok";
    }
  );
});

app.post("/loginadmin", (req, res) => {
  const { email, password } = req.body;
  db.all(
    "SELECT * FROM admin WHERE email = ? AND senha = ?",
    email,
    password,
    (err, rows) => {
      if (err) {
        res.status(500).json({ message: "invalido" });
        return;
      }
      if (!rows || rows.length === 0) {
        res.status(404).json({ message: "invalido" });
        return;
      }
      if (rows[0].email == email && rows[0].senha == password) {
        res.status(200).json({ message: "valido" });
        return;
      }
    }
  );
});

app.get("/infolist", (req, res) => {
  db.all("SELECT * FROM foods", (err, rows) => {
    if (err) {
      res.status(200).json({ message: "erro" + err });
      return;
    } else if (rows == 0 || rows == undefined || rows == null) {
      res.status(200).json({ message: "nao ah pedidos na fila" });
      return;
    }
    res.status(200).json({ message: rows });
  });
});

app.get("/tablelist", (req, res) => {
  db.all("SELECT * FROM finishedlist", (err, rows) => {
    if (err) {
      res.status(200).json({ message: "erro" + err });
      return;
    } else if (rows == 0 || rows == undefined || rows == null) {
      res.status(200).json({ message: "nao ah pedidos na fila" });
      return;
    }
    res.status(200).json({ message: rows });
  });
});

app.get("/qruserslist", (req, res) => {
  db.all("SELECT * FROM qrusers", (err, rows) => {
    if (err) {
      res.status(200).json({ message: "erro" + err });
      return;
    } else if (rows == 0 || rows == undefined || rows == null) {
      res.status(200).json({ message: "nao ah garcom cadastrados" });
      return;
    }
    res.status(200).json({ message: rows });
  });
});

app.post("/deleteqruser", (req, res) => {
  const id = req.body;
  db.run(`DELETE FROM qrusers WHERE id = ?`, id.id, (err) => {
    if (err) {
      return res.status(500).json({ message: "erro" + err });
    }
    if (this.changes === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }
    res.status(200).json({ message: "item deletado" });
  });
});

app.post("/deletelist", (req, res) => {
  const id = req.body;
  db.run(`DELETE FROM foods WHERE id = ?`, id.id, (err) => {
    if (err) {
      return res.status(500).json({ message: "erro" + err });
    }
    if (this.changes === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }
    res.status(200).json({ message: "item deletado" });
  });
});

app.post("/deletelisttable", (req, res) => {
  const id = req.body;
  db.run(`DELETE FROM finishedlist WHERE id = ?`, id.id, (err) => {
    if (err) {
      return res.status(500).json({ message: "erro" + err });
    }
    if (this.changes === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }
    res.status(200).json({ message: "item deletado" });
  });
});

app.post("/finishedlist", (req, res) => {
  const { id, FoodName, FoodPrice, FoodDetails, FoodObservation, FoodTable } =
    req.body;
  db.run(
    `INSERT INTO finishedlist (
        id, name, price, details, observation, numbertable
      ) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, FoodName, FoodPrice, FoodDetails, FoodObservation, FoodTable],
    function (err) {
      if (err) {
        return console.log("deu red familia");
      }
      console.log("ok");
    }
  );

  db.run(`DELETE FROM foods WHERE id = ?`, id, (err) => {
    if (err) {
      return res.status(500).json({ message: "erro" + err });
    }
    if (this.changes === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }
    res.status(200).json({ message: "item deletado" });
  });
});

app.listen(port, () => {
  console.log(`App de exemplo esta rodando na porta ${port}`);
});
