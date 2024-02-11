const express = require("express");
const router = express.Router();
const exampleSchema = require("../validators/exampleSchema");
const sudo = require("sudo-js");
const { helper } = require("./helper");

sudo.setPassword(process.env.SUDO_PASSWORD);

router.use((req, res, next) => {
    const { token } = req.body;
    if (helper.validateToken(token)) {
        helper.invalidateToken();
        return next();
    }
    req.flash("messages", {
        type: "alert-danger",
        info: "Your token has expired, please repeat the action",
    });
    return res.redirect("/");
});

router.get("/", (req, res) => {
    res.json({
        message: "You're on api route!",
    });
});

router.post("/shutdown", (req, res) => {
    sudo.exec(["shutdown", "-h", "now"], (err, pid, result) => {
        console.log(result);
    });
    res.redirect("/message?type=shutdown");
});

router.post("/suspend", (req, res) => {
    sudo.exec(["systemctl", "restart"], (err, pid, result) => {
        console.log(result);
    });
    res.redirect("/message?type=suspend");
});

router.post("/reboot", (req, res) => {
    sudo.exec(["systemctl", "reboot"], (err, pid, result) => {
        console.log(result);
    });
    res.redirect("/message?type=reboot");
});

router.post("/example", async (req, res, next) => {
    const { name, age } = req.body;
    try {
        const user = {
            name,
            age,
            createdAt: Date(),
            updatedAt: Date(),
        };
        await exampleSchema.validate(user);
        res.json({
            message: "post request success",
            user,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
