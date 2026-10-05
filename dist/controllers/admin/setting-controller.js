"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalPatch = exports.general = void 0;
const setting_general_model_1 = __importDefault(require("../../models/setting-general.model"));
const http_1 = require("../../helpers/http");
const config_1 = require("../../config/config");
const general = (_req, res) => res.render("admin/pages/settings/general", { pageTitle: "Cài đặt chung" });
exports.general = general;
const generalPatch = async (req, res) => {
    const data = {
        websiteName: (0, http_1.requiredText)(req.body.websiteName, "tên website", 100),
        logo: (0, http_1.mediaUrl)(req.body.logo) || "/images/logo.png",
        description: (0, http_1.text)(req.body.description, 1000),
        email: req.body.email ? (0, http_1.email)(req.body.email) : "",
        phone: (0, http_1.text)(req.body.phone, 30), address: (0, http_1.text)(req.body.address, 500), copyright: (0, http_1.text)(req.body.copyright, 300)
    };
    await setting_general_model_1.default.findOneAndUpdate({ key: "general" }, { $set: data }, { upsert: true, runValidators: true });
    (0, http_1.success)(res, `/${config_1.systemconfig.prefixAdmin}/settings/general`);
};
exports.generalPatch = generalPatch;
