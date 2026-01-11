"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const next_auth_1 = __importDefault(require("next-auth"));
const auth_config_1 = require("./auth.config");
exports.default = (0, next_auth_1.default)(auth_config_1.authConfig).auth;
exports.config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
