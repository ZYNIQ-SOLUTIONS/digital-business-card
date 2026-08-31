"use strict";
/**
 * Zavatar: Modular Avatar Microservice & Compositing Engine
 * Entrypoint exporting all types, adapters, utilities and registry.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./types"), exports);
__exportStar(require("./adapters/TemplateAdapter"), exports);
__exportStar(require("./adapters/MetaPersonAdapter"), exports);
__exportStar(require("./adapters/AdapterRegistry"), exports);
__exportStar(require("./utils/svgBuilder"), exports);
__exportStar(require("./utils/faceDetection"), exports);
//# sourceMappingURL=index.js.map