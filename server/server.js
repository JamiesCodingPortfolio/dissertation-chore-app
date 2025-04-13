const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = {
    origin: "http://localhost:443",
};

app.use(cors(corsOptions));

app.get("/api", (req, res) => {
    res.json({bruhs:["bruh", "bruhs"]});
});

app.listen(8080, () => {
    console.log("Server started active on port 8080");
});