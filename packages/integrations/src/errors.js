"use strict";
/**
 * Integration errors
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MappingError = exports.ApiError = exports.AuthenticationError = exports.IntegrationError = void 0;
var IntegrationError = /** @class */ (function (_super) {
    __extends(IntegrationError, _super);
    function IntegrationError(message, code, details) {
        if (code === void 0) { code = 'INTEGRATION_ERROR'; }
        var _this = _super.call(this, message) || this;
        _this.code = code;
        _this.details = details;
        _this.name = 'IntegrationError';
        return _this;
    }
    return IntegrationError;
}(Error));
exports.IntegrationError = IntegrationError;
var AuthenticationError = /** @class */ (function (_super) {
    __extends(AuthenticationError, _super);
    function AuthenticationError(message, credentials) {
        var _this = _super.call(this, message, 'AUTHENTICATION_ERROR') || this;
        _this.credentials = credentials;
        _this.name = 'AuthenticationError';
        return _this;
    }
    return AuthenticationError;
}(IntegrationError));
exports.AuthenticationError = AuthenticationError;
var ApiError = /** @class */ (function (_super) {
    __extends(ApiError, _super);
    function ApiError(message, statusCode, response) {
        var _this = _super.call(this, message, 'API_ERROR') || this;
        _this.statusCode = statusCode;
        _this.response = response;
        _this.name = 'ApiError';
        return _this;
    }
    return ApiError;
}(IntegrationError));
exports.ApiError = ApiError;
var MappingError = /** @class */ (function (_super) {
    __extends(MappingError, _super);
    function MappingError(message, field) {
        var _this = _super.call(this, message, 'MAPPING_ERROR') || this;
        _this.field = field;
        _this.name = 'MappingError';
        return _this;
    }
    return MappingError;
}(IntegrationError));
exports.MappingError = MappingError;
