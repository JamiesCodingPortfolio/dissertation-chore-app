require("dotenv").config({ path: "../.env" });
var fs  = require("fs");
var http = require("http");
var https = require("https");


const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = {
    origin: "0.0.0.0",
};

app.use(cors(corsOptions));

app.get("/api", (req, res) => {
    res.json({bruhs:["bruh", "bruhs"]});
});

app.listen(443, () => {
    console.log("Server started active on port 443");
});