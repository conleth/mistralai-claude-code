"use strict";
/**
 * @security-rat/standards
 * OWASP ASVS & SPVS data ingestion and management
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadStandard = loadStandard;
exports.getRequirement = getRequirement;
exports.validateRequirementId = validateRequirementId;
exports.getAllRequirements = getAllRequirements;
exports.getRequirementsByLevel = getRequirementsByLevel;
exports.getRequirementsByCategory = getRequirementsByCategory;
exports.clearCache = clearCache;
var promises_1 = require("node:fs/promises");
var node_path_1 = require("node:path");
// In-memory cache for loaded standards
var standardsCache = new Map();
/**
 * Load a standard from JSON file
 *
 * @param standard - The standard to load (ASVS or SPVS)
 * @param version - The version of the standard
 * @returns Array of requirements
 */
function loadStandard(standard, version) {
    return __awaiter(this, void 0, void 0, function () {
        var cacheKey, filePath, fileContent, data_1, requirements, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cacheKey = "".concat(standard, ":").concat(version);
                    // Return from cache if available
                    if (standardsCache.has(cacheKey)) {
                        return [2 /*return*/, standardsCache.get(cacheKey)];
                    }
                    if (standard === 'ASVS') {
                        filePath = (0, node_path_1.resolve)(__dirname, '../data', "asvs-".concat(version, ".json"));
                    }
                    else {
                        filePath = (0, node_path_1.resolve)(__dirname, '../data', "spvs-".concat(version, ".json"));
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readFile)(filePath, 'utf-8')];
                case 2:
                    fileContent = _a.sent();
                    data_1 = JSON.parse(fileContent);
                    // Validate the data structure
                    if (!data_1.requirements || !Array.isArray(data_1.requirements)) {
                        throw new Error("Invalid data structure in ".concat(filePath));
                    }
                    requirements = data_1.requirements.map(function (req) { return ({
                        id: req.id,
                        standard: standard,
                        version: data_1.version || version,
                        title: req.title,
                        description: req.description,
                        level: req.level,
                        category: req.category,
                        tags: req.tags || [],
                        metadata: req.metadata || {},
                    }); });
                    // Validate all requirements
                    requirements.forEach(function (req) {
                        validateRequirementId(standard, req.id);
                    });
                    // Cache the loaded requirements
                    standardsCache.set(cacheKey, requirements);
                    return [2 /*return*/, requirements];
                case 3:
                    error_1 = _a.sent();
                    if (error_1.code === 'ENOENT') {
                        throw new Error("Standard file not found: ".concat(filePath));
                    }
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get a specific requirement by ID
 *
 * @param standard - The standard (ASVS or SPVS)
 * @param requirementId - The canonical requirement ID
 * @returns The requirement or null if not found
 */
function getRequirement(standard, requirementId) {
    return __awaiter(this, void 0, void 0, function () {
        var requirements;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadStandard(standard, getVersionFromId(requirementId))];
                case 1:
                    requirements = _a.sent();
                    return [2 /*return*/, requirements.find(function (req) { return req.id === requirementId; }) || null];
            }
        });
    });
}
/**
 * Validate a requirement ID format
 *
 * @param standard - The standard (ASVS or SPVS)
 * @param requirementId - The requirement ID to validate
 * @returns True if valid, false otherwise
 */
function validateRequirementId(standard, requirementId) {
    if (standard === 'ASVS') {
        // ASVS format: v5.0.0-<chapter>.<section>.<requirement>
        // Example: v5.0.0-1.1.1
        var pattern = /^v\d+\.\d+\.\d+-\d+\.\d+\.\d+$/;
        return pattern.test(requirementId);
    }
    else {
        // SPVS format: V#.#.# (category.subcategory.requirement)
        // Example: V1.1.1
        var pattern = /^V\d+\.\d+\.\d+$/;
        return pattern.test(requirementId);
    }
}
/**
 * Get version from a requirement ID
 *
 * @param requirementId - The requirement ID
 * @returns The version extracted from the ID
 */
function getVersionFromId(requirementId) {
    if (requirementId.startsWith('v')) {
        // ASVS format
        var match = requirementId.match(/^v(\d+\.\d+\.\d+)-/);
        return match ? match[1] : '5.0.0';
    }
    else if (requirementId.startsWith('V')) {
        // SPVS format - no version in ID, use default
        return '1.0';
    }
    return '5.0.0';
}
/**
 * Get all requirements for a standard
 *
 * @param standard - The standard (ASVS or SPVS)
 * @param version - The version (optional, defaults to latest)
 * @returns Array of all requirements
 */
function getAllRequirements(standard_1) {
    return __awaiter(this, arguments, void 0, function (standard, version) {
        if (version === void 0) { version = '5.0.0'; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadStandard(standard, version)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Get requirements by level
 *
 * @param standard - The standard (ASVS or SPVS)
 * @param version - The version
 * @param level - The level filter (L1, L2, or L3)
 * @returns Array of requirements matching the level
 */
function getRequirementsByLevel(standard, version, level) {
    return __awaiter(this, void 0, void 0, function () {
        var requirements;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadStandard(standard, version)];
                case 1:
                    requirements = _a.sent();
                    return [2 /*return*/, requirements.filter(function (req) { return req.level === level; })];
            }
        });
    });
}
/**
 * Get requirements by category
 *
 * @param standard - The standard (ASVS or SPVS)
 * @param version - The version
 * @param category - The category filter
 * @returns Array of requirements matching the category
 */
function getRequirementsByCategory(standard, version, category) {
    return __awaiter(this, void 0, void 0, function () {
        var requirements;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadStandard(standard, version)];
                case 1:
                    requirements = _a.sent();
                    return [2 /*return*/, requirements.filter(function (req) { return req.category === category; })];
            }
        });
    });
}
/**
 * Clear the standards cache (useful for testing)
 */
function clearCache() {
    standardsCache.clear();
}
