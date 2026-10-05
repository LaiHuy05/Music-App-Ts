"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountData = void 0;
const http_1 = require("./http");
const auth_1 = require("./auth");
const accountData = async (body, creating = false) => {
    const data = {
        fullName: (0, http_1.requiredText)(body.fullName, "họ tên", 100),
        email: (0, http_1.email)(body.email), phone: (0, http_1.text)(body.phone, 30),
        avatar: (0, http_1.mediaUrl)(body.avatar), status: (0, http_1.status)(body.status)
    };
    if (creating || body.password)
        data.password = await (0, auth_1.hashPassword)((0, http_1.password)(body.password));
    return data;
};
exports.accountData = accountData;
