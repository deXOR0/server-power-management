const fs = require("fs");
const { nanoid } = require("nanoid");

const helper = {
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
};

module.exports = { helper };
