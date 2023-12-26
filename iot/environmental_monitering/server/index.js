const express = require("express");
const mqtt = require("mqtt");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

const cors = require("cors");
const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Connect to db mysql
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

db.connect((err) => {
  if (err) {
    console.error("Error to connect to db:", err);
  } else {
    console.log("Connect to database successfully");
  }
});

// Kết nối đến MQTT broker
const mqttClient = mqtt.connect(`mqtt://${process.env.MQTT_BROKER}`);

mqttClient.on("connect", () => {
  console.log("Connect to MQTT broker successfully");
  mqttClient.subscribe("sensorRealtime");
  mqttClient.subscribe("saveDB");
});

mqttClient.on("message", (topic, message) => {
  // if topic to saveDB
  if (topic === "saveDB") {
    const data = JSON.parse(message.toString());

    if (
      data.humidity !== null &&
      data.temperature !== null &&
      data.light !== null &&
      data.rain !== null &&
      data.gas !== null
    ) {
      const sqlQuery =
        "INSERT INTO sensor_data (humidity, temperature, light, rain, gas, timestamp) VALUES (?, ?, ?, ?, ?, NOW())";

      const values = [
        data.humidity,
        data.temperature,
        data.light,
        data.rain,
        data.gas,
      ];

      db.query(sqlQuery, values, (err, result) => {
        if (err) {
          console.error("Error when save data to db:", err);
        } else {
          console.log("Save data to db successfully");
        }
      });
    } else {
      console.error("Not Permission when save to db, data: NULL");
    }
  }

  if (topic === "sensorRealtime") {
    const data = JSON.parse(message.toString());

    sendDataToClient(data);
  }
});

// start create socket to send to client

// Tạo HTTP server
const server = http.createServer(app);

// Tạo WebSocket server
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Your custom event emitter function
function sendDataToClient(data) {
  io.emit("dataRealtime", data);
}
//end create socket to send to client

/* ------------------------ Some route api publish ------------------------------------- */

// route control led
app.get("/control/led", (req, res) => {
  const state = req.query.state;

  if (state === "0" || state === "1") {
    mqttClient.publish("changeLed", state === "1" ? "on" : "off");

    res.json({
      success: true,
      message: `Changed all led to ${state ? "On" : "off"}`,
    });
  } else {
    res.status(400).json({ success: false, message: "Invalid led state" });
  }
});

// route pagination table
app.get("/history", (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = limit * (Number(page) - 1);
  const date = req.query.date;

  let queryTotal = "";

  if (date) {
    queryTotal = `SELECT * FROM sensor_data WHERE DATE(timestamp) = '${date}'`;
  } else {
    queryTotal = "SELECT * FROM sensor_data";
  }

  db.query(queryTotal, (err, result) => {
    if (err) {
      console.error("Some thing went wrong", err);
      res
        .status(500)
        .json({ success: false, message: "Some thing went wrong" });
    } else {
      const all_sensor_data = result;
      const total = all_sensor_data.length;

      let queryPage = "";

      if (date) {
        queryPage = `SELECT * FROM sensor_data WHERE DATE(timestamp) = '${date}' ORDER BY timestamp DESC LIMIT ${limit} OFFSET ${skip}`;
      } else {
        queryPage = `SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT ${limit} OFFSET ${skip}`;
      }

      db.query(queryPage, (err, dataPage) => {
        if (err) {
          console.error("Some thing went wrong", err);
          res
            .status(500)
            .json({ success: false, message: "Some thing went wrong" });
        } else {
          res.json({
            success: true,
            data: dataPage,
            limit: Number(limit),
            total,
          });
        }
      });
    }
  });
});

// route for chart data, select 20 record new least
app.get("/chart-data", (req, res) => {
  const sqlQuery = "SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 11";

  db.query(sqlQuery, (err, result) => {
    if (err) {
      console.error("Error when query data:", err);
      res.status(500).json({ success: false, message: "Something when wrong" });
    } else {
      const sensorData = result;

      res.status(200).json({ success: true, sensorData });
    }
  });
});

// report
app.get("/report/humidity/max", async (req, res) => {
  const maxHumidityQuery =
    "SELECT * FROM sensor_data ORDER BY humidity DESC LIMIT 1";

  db.query(maxHumidityQuery, (err, result) => {
    if (err) {
      res.status(500).json({ success: false, message: "Something when wrong" });
    } else {
      res.status(200).json({ success: true, data: result[0].humidity });
    }
  });
});

app.get("/report/humidity/min", async (req, res) => {
  const minHumidityQuery =
    "SELECT * FROM sensor_data ORDER BY humidity ASC LIMIT 1";

  db.query(minHumidityQuery, (err, result) => {
    if (err) {
      res.status(500).json({ success: false, message: "Something when wrong" });
    } else {
      res.status(200).json({ success: true, data: result[0].humidity });
    }
  });
});

app.get("/report/temperature/max", async (req, res) => {
  const maxTemperatureQuery =
    "SELECT * FROM sensor_data ORDER BY temperature DESC LIMIT 1";

  db.query(maxTemperatureQuery, (err, result) => {
    if (err) {
      res.status(500).json({ success: false, message: "Something when wrong" });
    } else {
      res.status(200).json({ success: true, data: result[0].temperature });
    }
  });
});

app.get("/report/temperature/min", async (req, res) => {
  const minTemperatureQuery =
    "SELECT * FROM sensor_data ORDER BY temperature ASC LIMIT 1";

  db.query(minTemperatureQuery, (err, result) => {
    if (err) {
      res.status(500).json({ success: false, message: "Something when wrong" });
    } else {
      res.status(200).json({ success: true, data: result[0].temperature });
    }
  });
});

app.get("/report/gas/max", async (req, res) => {
  const maxGasQuery = "SELECT * FROM sensor_data ORDER BY gas DESC LIMIT 1";

  db.query(maxGasQuery, (err, result) => {
    if (err) {
      res.status(500).json({ success: false, message: "Something when wrong" });
    } else {
      res.status(200).json({ success: true, data: result[0].gas });
    }
  });
});

app.get("/report/gas/min", async (req, res) => {
  const minTemperatureQuery =
    "SELECT * FROM sensor_data ORDER BY gas ASC LIMIT 1";

  db.query(minTemperatureQuery, (err, result) => {
    if (err) {
      res.status(500).json({ success: false, message: "Something when wrong" });
    } else {
      res.status(200).json({ success: true, data: result[0].gas });
    }
  });
});

server.listen(port, () => {
  console.log(`App listening on port: ${port}`);
});
