const fs = require("fs");
const { nanoid } = require("nanoid");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const sudo = require("sudo-js");
const moment = require("moment-timezone");

sudo.setPassword(process.env.SUDO_PASSWORD);
dotenv.config();

shutdown_timer = process.env.SHUTDOWN_TIMER_CRON;
shutdown_delay = Number(process.env.SHUTDOWN_DELAY_MINUTES);

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

var mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.DESTINATION_EMAIL_USER,
    subject: "[Optiplex Power Management] - Auto Shutdown Alert",
    text: `This is an automated alert\nOptiplex Server will shutdown ${shutdown_delay} minutes from now. If you wish to continue using the server, please click the Snooze button on http://power.local/`,
};

const shutDown = () => {
    let now = new Date();
    now.setMinutes(now.getMinutes() + shutdown_delay);
    now = new Date(now);
    now = moment.tz(now, "Asia/Jakarta").format("HH:mm:ss");
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
    console.log(now);
    const fd = fs.openSync(__dirname + "/autoShutdown.json", "w");
    fs.writeSync(
        fd,
        JSON.stringify({
            armed: true,
            shutDownDate: now,
        })
    );
    setTimeout(() => {
        if (helper.isArmed()) {
            console.log("Shut Down", Date());
            sudo.exec(["shutdown", "-h", "now"], (err, pid, result) => {
                console.log(result);
            });
        }
        helper.rearm();
    }, 1000 * 60 * shutdown_delay);
};

const helper = {
    rearm() {
        const fd = fs.openSync(__dirname + "/autoShutdown.json", "w");
        fs.writeSync(
            fd,
            JSON.stringify({
                armed: true,
                shutDownDate: null,
            })
        );
    },

    disarm() {
        const fd = fs.openSync(__dirname + "/autoShutdown.json", "w");
        fs.writeSync(
            fd,
            JSON.stringify({
                armed: false,
            })
        );
    },

    isArmed() {
        const config = JSON.parse(
            fs.readFileSync(__dirname + "/autoShutdown.json", {
                encoding: "utf-8",
                flag: "r",
            })
        );

        return config.armed;
    },

    generateToken() {
        const token = nanoid(50);

        const fd = fs.openSync(__dirname + "/token.dat", "w");
        fs.writeSync(fd, token);

        return token;
    },

    validateToken(userToken) {
        const token = fs.readFileSync(__dirname + "/token.dat", {
            encoding: "utf-8",
            flag: "r",
        });

        return userToken === token;
    },

    invalidateToken() {
        const fd = fs.openSync(__dirname + "/token.dat", "w");
    },

    startCronJob() {
        console.log("Started Cron Job", Date());
        this.rearm();
        cron.schedule(shutdown_timer, () => {
            shutDown();
        });
    },
};

module.exports = { helper };
