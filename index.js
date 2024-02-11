const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const app = express();
const { helper } = require("./src/routes/helper");

// Uncoment 3 lines below to use database connection with sequelize
// db.authenticate()
//   .then(() => console.log("Database connected!"))
//   .catch((err) => console.log(err));
// App setup
dotenv.config();
app.set("view engine", "ejs");
app.use(cookieParser(process.env.SECRET));
app.use(
    session({
        secret: process.env.SECRET,
        cookie: { maxAge: 60000 },
        resave: true,
        saveUninitialized: true,
    })
);
app.use(flash());
app.use(express.static(__dirname + "/public"));
app.set("views", __dirname + "/public/views");
app.use(express.json()); // JSON Parser
app.use(express.urlencoded({ extended: true })); // URL Encoded Parser (Form Data)

// Routes
app.use("/api", require("./src/routes/api"));

app.get("/", (req, res) => {
    const token = helper.generateToken();
    res.render("starter", { token, messages: req.flash("messages") });
});

app.get("/message", (req, res) => {
    const { type } = req.query;
    console.log(type);
    res.render("message", { type });
});

// Error handler
// app.use((error, req, res, next) => {
//     error.code ? res.status(error.code) : res.status(400);
//     res.json({
//         error: error.message,
//     });
// });

app.listen(process.env.PORT, () => {
    console.log(`App is listening on http://localhost:${process.env.PORT}`);
});
