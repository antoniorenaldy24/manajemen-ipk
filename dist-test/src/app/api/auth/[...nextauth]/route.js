"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runtime = exports.POST = exports.GET = exports.dynamic = void 0;
const auth_1 = require("@/auth");
exports.dynamic = 'force-dynamic';
exports.GET = auth_1.handlers.GET, exports.POST = auth_1.handlers.POST;
exports.runtime = "nodejs";
