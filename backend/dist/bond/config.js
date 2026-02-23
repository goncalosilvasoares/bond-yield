"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YTM_TOLERANCE = exports.MAX_ITERATIONS = exports.MAX_BRACKET_ATTEMPTS = exports.HIGH_RATE_LIMIT = void 0;
exports.HIGH_RATE_LIMIT = Number(process.env.HIGH_RATE_LIMIT) || 100;
exports.MAX_BRACKET_ATTEMPTS = Number(process.env.MAX_BRACKET_ATTEMPTS) || 100;
exports.MAX_ITERATIONS = Number(process.env.MAX_ITERATIONS) || 200;
exports.YTM_TOLERANCE = Number(process.env.YTM_TOLERANCE) || 1e-8;
//# sourceMappingURL=config.js.map