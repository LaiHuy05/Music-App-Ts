"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.catalogData = exports.description = exports.catalogSlug = void 0;
const convertToSlug_1 = require("./convertToSlug");
const http_1 = require("./http");
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const catalogSlug = (title, id) => `${(0, convertToSlug_1.convertToSlug)(title).toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 100) || "item"}-${id.slice(-8)}`;
exports.catalogSlug = catalogSlug;
const description = (value) => (0, sanitize_html_1.default)((0, http_1.text)(value, 50000), {
    allowedTags: [...sanitize_html_1.default.defaults.allowedTags, "img"],
    allowedAttributes: { ...sanitize_html_1.default.defaults.allowedAttributes, img: ["src", "alt", "title", "width", "height"] },
    allowedSchemes: ["http", "https"], allowProtocolRelative: false
});
exports.description = description;
const catalogData = (body, nameField) => {
    const data = { [nameField]: (0, http_1.requiredText)(body[nameField], nameField === "title" ? "tiêu đề" : "tên ca sĩ", 200), description: (0, exports.description)(body.description), status: (0, http_1.status)(body.status) };
    const avatar = Array.isArray(body.avatar) ? body.avatar[0] : body.avatarUrl;
    if (avatar)
        data.avatar = (0, http_1.mediaUrl)(avatar);
    return data;
};
exports.catalogData = catalogData;
