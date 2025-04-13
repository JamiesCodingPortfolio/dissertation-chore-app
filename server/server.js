require("dotenv").config({ path: "../.env" });

const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = {
    origin: "process.env.DOMAIN_NAME",
};

app.use(cors(corsOptions));

app.get("/api", (req, res) => {
    res.json({bruhs:["bruh", "bruhs"]});
});

app.listen(8080, () => {
    console.log("Server started active on port 8080");
});