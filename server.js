const express = require("express");
const products = require("./products/controller");
const users = require("./users/controller");
const orders = require("./orders/controller");
const email = require("./email/controller");
const cors = require("cors");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");

const app = express();

const port = 3001;

app.use(express.static("public"));

app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());

app.use(fileUpload());

app.get("/", (req, res) => {
    res.send(`Server running on ${port}`)
});

app.use("/api/v1/products", products);
app.use("/api/v1/users", users);
app.use("/api/v1/orders", orders);
app.use("/api/v1/email", email);

app.listen(port, () => {
    console.log(`Server running on ${port}`)
})