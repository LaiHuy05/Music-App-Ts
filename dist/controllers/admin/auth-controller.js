"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.loginPost = exports.login = void 0;
const account_model_1 = __importDefault(require("../../models/account.model"));
const config_1 = require("../../config/config");
const md5_1 = __importDefault(require("md5"));
const login = (req, res) => {
    if (req.cookies.token) {
        return res.redirect(`/${config_1.systemconfig.prefixAdmin}/dashboard`);
    }
    res.render("admin/pages/auth/login", {
        pageTitle: "Đăng nhập",
    });
};
exports.login = login;
const loginPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield account_model_1.default.findOne({
        email: email,
        deleted: false
    });
    if (!user || (0, md5_1.default)(password) !== user.password || user.status === "inactive") {
        return res.redirect("back");
    }
    res.cookie("token", user.token);
    res.redirect(`/${config_1.systemconfig.prefixAdmin}/dashboard`);
});
exports.loginPost = loginPost;
const logout = (req, res) => {
    res.clearCookie("token");
    res.redirect(`/${config_1.systemconfig.prefixAdmin}/auth/login`);
};
exports.logout = logout;
