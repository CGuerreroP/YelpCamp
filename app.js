const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("This will be the landing page");
})


app.listen(process.env.PORT, process.env.IP, () => {
    console.log("The YelpCamp Server Has Started");
})