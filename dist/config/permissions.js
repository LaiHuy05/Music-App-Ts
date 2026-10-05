"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allPermissions = exports.permissionLabels = exports.permissionGroups = void 0;
exports.permissionGroups = [
    { key: "dashboard", title: "Tổng quan", actions: ["view"] },
    { key: "topics", title: "Chủ đề", actions: ["view", "create", "edit", "delete"] },
    { key: "songs", title: "Bài hát", actions: ["view", "create", "edit", "delete"] },
    { key: "singers", title: "Ca sĩ", actions: ["view", "create", "edit", "delete"] },
    { key: "accounts", title: "Tài khoản admin", actions: ["view", "create", "edit", "delete"] },
    { key: "users", title: "Tài khoản user", actions: ["view", "create", "edit", "delete"] },
    { key: "roles", title: "Nhóm quyền", actions: ["view", "create", "edit", "delete"] },
    { key: "settings", title: "Cài đặt chung", actions: ["view", "edit"] }
];
exports.permissionLabels = { view: "Xem", create: "Thêm", edit: "Sửa", delete: "Xóa" };
exports.allPermissions = exports.permissionGroups.flatMap(group => group.actions.map(action => `${group.key}_${action}`));
