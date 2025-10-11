"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const MooriSense_logo_png_1 = require("../assets/MooriSense_logo.png");
require("../App.css");
// statusText를 props로 받아 표시하도록 수정
function LoadingScreen({ statusText }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "loading-wrapper", children: [(0, jsx_runtime_1.jsx)("img", { src: MooriSense_logo_png_1.default, className: "main-logo", alt: "MooriSense Logo" }), (0, jsx_runtime_1.jsx)("p", { className: "loading-text", children: "Loading..." }), (0, jsx_runtime_1.jsx)("p", { className: "status-text", children: statusText })] }));
}
exports.default = LoadingScreen;
