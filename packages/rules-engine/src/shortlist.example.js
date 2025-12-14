"use strict";
/**
 * @security-rat/rules-engine
 * Proof-of-concept shortlist generation
 *
 * This script demonstrates how to integrate the rules engine with standards data
 * to generate a shortlist of requirements based on questionnaire answers.
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SPVS_RULES = exports.ASVS_RULES = void 0;
exports.generateShortlist = generateShortlist;
var standards_1 = require("@security-rat/standards");
var index_1 = require("./index");
/**
 * Example rules for ASVS requirements
 */
var ASVS_RULES = [
    // V1: Inventory Management
    {
        id: 'asvs-v1-software-inventory',
        standard: 'ASVS',
        requirementId: 'v5.0.0-1.1.1',
        conditions: [
            {
                field: 'internetExposed',
                operator: 'equals',
                value: true,
            },
        ],
        rationale: 'Software inventory is required for internet-exposed applications to track authorized and unauthorized software ({internetExposed}).',
    },
    {
        id: 'asvs-v1-software-testing',
        standard: 'ASVS',
        requirementId: 'v5.0.0-1.1.2',
        conditions: [
            {
                field: 'internetExposed',
                operator: 'equals',
                value: true,
            },
        ],
        rationale: 'Testing for unauthorized software is required for internet-exposed applications ({internetExposed}).',
    },
    {
        id: 'asvs-v1-software-verification',
        standard: 'ASVS',
        requirementId: 'v5.0.0-1.1.3',
        conditions: [
            {
                field: 'recommendedASVSLevel',
                operator: 'equals',
                value: 'L2',
            },
        ],
        rationale: 'Regular verification of software inventory is required at ASVS level {recommendedASVSLevel}.',
    },
    // V2: Architecture and Design
    {
        id: 'asvs-v2-architecture-verification',
        standard: 'ASVS',
        requirementId: 'v5.0.0-2.1.1',
        conditions: [
            {
                field: 'internetExposed',
                operator: 'equals',
                value: true,
            },
        ],
        rationale: 'Architecture diagrams must be verified for internet-exposed applications ({internetExposed}).',
    },
    {
        id: 'asvs-v2-architecture-review',
        standard: 'ASVS',
        requirementId: 'v5.0.0-2.1.2',
        conditions: [
            {
                field: 'recommendedASVSLevel',
                operator: 'equals',
                value: 'L2',
            },
        ],
        rationale: 'Security architecture review is required at ASVS level {recommendedASVSLevel}.',
    },
    {
        id: 'asvs-v2-architecture-security',
        standard: 'ASVS',
        requirementId: 'v5.0.0-2.1.3',
        conditions: [
            {
                field: 'recommendedASVSLevel',
                operator: 'equals',
                value: 'L3',
            },
        ],
        rationale: 'Comprehensive security architecture verification is required at ASVS level {recommendedASVSLevel}.',
    },
    // V3: Authentication
    {
        id: 'asvs-v3-auth-verification',
        standard: 'ASVS',
        requirementId: 'v5.0.0-3.1.1',
        conditions: [
            {
                field: 'requiresAuth',
                operator: 'equals',
                value: true,
            },
        ],
        rationale: 'Authentication mechanism verification is required for applications with authentication ({requiresAuth}).',
    },
    {
        id: 'asvs-v3-auth-testing',
        standard: 'ASVS',
        requirementId: 'v5.0.0-3.1.2',
        conditions: [
            {
                field: 'requiresAuth',
                operator: 'equals',
                value: true,
            },
        ],
        rationale: 'Authentication mechanism testing is required for applications with authentication ({requiresAuth}).',
    },
    {
        id: 'asvs-v3-mfa',
        standard: 'ASVS',
        requirementId: 'v5.0.0-3.1.3',
        conditions: [
            {
                field: 'recommendedASVSLevel',
                operator: 'equals',
                value: 'L3',
            },
            {
                field: 'requiresAuth',
                operator: 'equals',
                value: true,
            },
        ],
        rationale: 'Multi-factor authentication is required at ASVS level {recommendedASVSLevel} for applications with authentication ({requiresAuth}).',
    },
    // V4: Authorization
    {
        id: 'asvs-v4-authz-verification',
        standard: 'ASVS',
        requirementId: 'v5.0.0-4.1.1',
        conditions: [
            {
                field: 'requiresAuth',
                operator: 'equals',
                value: true,
            },
        ],
        rationale: 'Authorization mechanism verification is required for applications with authentication ({requiresAuth}).',
    },
    {
        id: 'asvs-v4-authz-testing',
        standard: 'ASVS',
        requirementId: 'v5.0.0-4.1.2',
        conditions: [
            {
                field: 'requiresAuth',
                operator: 'equals',
                value: true,
            },
        ],
        rationale: 'Authorization mechanism testing is required for applications with authentication ({requiresAuth}).',
    },
    {
        id: 'asvs-v4-rbac',
        standard: 'ASVS',
        requirementId: 'v5.0.0-4.1.3',
        conditions: [
            {
                field: 'recommendedASVSLevel',
                operator: 'equals',
                value: 'L3',
            },
            {
                field: 'requiresAuth',
                operator: 'equals',
                value: true,
            },
        ],
        rationale: 'Role-based access control is required at ASVS level {recommendedASVSLevel} for applications with authentication ({requiresAuth}).',
    },
];
exports.ASVS_RULES = ASVS_RULES;
/**
 * Example rules for SPVS requirements
 */
var SPVS_RULES = [
    // V1: Plan
    {
        id: 'spvs-v1-security-requirements',
        standard: 'SPVS',
        requirementId: 'V1.1.1',
        conditions: [
            {
                field: 'recommendedSPVSLevel',
                operator: 'equals',
                value: 'L1',
            },
        ],
        rationale: 'Security requirements for the pipeline must be defined at SPVS level {recommendedSPVSLevel}.',
    },
    {
        id: 'spvs-v1-pipeline-architecture',
        standard: 'SPVS',
        requirementId: 'V1.1.2',
        conditions: [
            {
                field: 'recommendedSPVSLevel',
                operator: 'equals',
                value: 'L1',
            },
        ],
        rationale: 'Pipeline architecture must be defined at SPVS level {recommendedSPVSLevel}.',
    },
    {
        id: 'spvs-v1-security-controls',
        standard: 'SPVS',
        requirementId: 'V1.1.3',
        conditions: [
            {
                field: 'recommendedSPVSLevel',
                operator: 'equals',
                value: 'L2',
            },
        ],
        rationale: 'Pipeline security controls must be defined at SPVS level {recommendedSPVSLevel}.',
    },
    // V2: Develop
    {
        id: 'spvs-v2-secure-coding',
        standard: 'SPVS',
        requirementId: 'V2.1.1',
        conditions: [
            {
                field: 'recommendedSPVSLevel',
                operator: 'equals',
                value: 'L1',
            },
        ],
        rationale: 'Secure coding standards must be implemented at SPVS level {recommendedSPVSLevel}.',
    },
    {
        id: 'spvs-v2-static-analysis',
        standard: 'SPVS',
        requirementId: 'V2.1.2',
        conditions: [
            {
                field: 'recommendedSPVSLevel',
                operator: 'equals',
                value: 'L1',
            },
        ],
        rationale: 'Static analysis must be implemented at SPVS level {recommendedSPVSLevel}.',
    },
    {
        id: 'spvs-v2-dynamic-analysis',
        standard: 'SPVS',
        requirementId: 'V2.1.3',
        conditions: [
            {
                field: 'recommendedSPVSLevel',
                operator: 'equals',
                value: 'L2',
            },
        ],
        rationale: 'Dynamic analysis must be implemented at SPVS level {recommendedSPVSLevel}.',
    },
    // V3: Integrate
    {
        id: 'spvs-v3-build-verification',
        standard: 'SPVS',
        requirementId: 'V3.1.1',
        conditions: [
            {
                field: 'recommendedSPVSLevel',
                operator: 'equals',
                value: 'L1',
            },
        ],
        rationale: 'Build verification must be implemented at SPVS level {recommendedSPVSLevel}.',
    },
    {
        id: 'spvs-v3-build-signing',
        standard: 'SPVS',
        requirementId: 'V3.1.2',
        conditions: [
            {
                field: 'recommendedSPVSLevel',
                operator: 'equals',
                value: 'L2',
            },
        ],
        rationale: 'Build artifact signing must be implemented at SPVS level {recommendedSPVSLevel}.',
    },
    {
        id: 'spvs-v3-build-verification-advanced',
        standard: 'SPVS',
        requirementId: 'V3.1.3',
        conditions: [
            {
                field: 'recommendedSPVSLevel',
                operator: 'equals',
                value: 'L3',
            },
        ],
        rationale: 'Advanced build artifact verification must be implemented at SPVS level {recommendedSPVSLevel}.',
    },
];
exports.SPVS_RULES = SPVS_RULES;
/**
 * Generate a shortlist based on questionnaire answers
 *
 * @param answers - Questionnaire answers
 * @returns Shortlisted requirements
 */
function generateShortlist(answers) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, asvsRequirements, spvsRequirements, allRequirements, allRules, shortlist;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        (0, standards_1.loadStandard)('ASVS', '5.0.0'),
                        (0, standards_1.loadStandard)('SPVS', '1.0'),
                    ])];
                case 1:
                    _a = _b.sent(), asvsRequirements = _a[0], spvsRequirements = _a[1];
                    allRequirements = __spreadArray(__spreadArray([], asvsRequirements, true), spvsRequirements, true);
                    allRules = __spreadArray(__spreadArray([], ASVS_RULES, true), SPVS_RULES, true);
                    shortlist = (0, index_1.applyRules)(allRequirements, allRules, answers);
                    return [2 /*return*/, shortlist];
            }
        });
    });
}
/**
 * Example usage
 */
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var webAppAnswers, webAppShortlist, internalToolAnswers, internalToolShortlist, mobileAppAnswers, mobileAppShortlist, result1, result2, isDeterministic;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('=== Security RAT - Shortlist Generation Demo ===\n');
                    // Example 1: Public web app with authentication
                    console.log('Example 1: Public Web App with Authentication');
                    console.log('-----------------------------------------------');
                    webAppAnswers = {
                        'app-type': 'web',
                        'auth-type': 'oauth',
                        'data-sensitivity': 'confidential',
                        'internet-exposed': 'public',
                        'hosting-model': 'cloud',
                        'pipeline-maturity': 'intermediate',
                    };
                    return [4 /*yield*/, generateShortlist(webAppAnswers)];
                case 1:
                    webAppShortlist = _a.sent();
                    console.log("Generated ".concat(webAppShortlist.length, " requirements"));
                    console.log('\nTop 5 requirements:');
                    webAppShortlist.slice(0, 5).forEach(function (req) {
                        console.log("  - ".concat(req.requirementId, ": ").concat(req.title));
                        console.log("    Level: ".concat(req.level, ", Category: ").concat(req.category));
                        console.log("    Rationale: ".concat(req.rationale));
                        console.log('');
                    });
                    // Example 2: Internal tool without authentication
                    console.log('\nExample 2: Internal Tool without Authentication');
                    console.log('------------------------------------------------');
                    internalToolAnswers = {
                        'app-type': 'internal',
                        'auth-type': 'none',
                        'data-sensitivity': 'internal',
                        'internet-exposed': 'private',
                        'hosting-model': 'on-prem',
                        'pipeline-maturity': 'basic',
                    };
                    return [4 /*yield*/, generateShortlist(internalToolAnswers)];
                case 2:
                    internalToolShortlist = _a.sent();
                    console.log("Generated ".concat(internalToolShortlist.length, " requirements"));
                    console.log('\nTop 5 requirements:');
                    internalToolShortlist.slice(0, 5).forEach(function (req) {
                        console.log("  - ".concat(req.requirementId, ": ").concat(req.title));
                        console.log("    Level: ".concat(req.level, ", Category: ").concat(req.category));
                        console.log("    Rationale: ".concat(req.rationale));
                        console.log('');
                    });
                    // Example 3: Mobile app with high security
                    console.log('\nExample 3: Mobile App with High Security');
                    console.log('----------------------------------------');
                    mobileAppAnswers = {
                        'app-type': 'mobile',
                        'auth-type': 'oauth',
                        'data-sensitivity': 'regulated',
                        'internet-exposed': 'public',
                        'hosting-model': 'cloud',
                        'pipeline-maturity': 'advanced',
                    };
                    return [4 /*yield*/, generateShortlist(mobileAppAnswers)];
                case 3:
                    mobileAppShortlist = _a.sent();
                    console.log("Generated ".concat(mobileAppShortlist.length, " requirements"));
                    console.log('\nTop 5 requirements:');
                    mobileAppShortlist.slice(0, 5).forEach(function (req) {
                        console.log("  - ".concat(req.requirementId, ": ").concat(req.title));
                        console.log("    Level: ".concat(req.level, ", Category: ").concat(req.category));
                        console.log("    Rationale: ".concat(req.rationale));
                        console.log('');
                    });
                    // Verify determinism
                    console.log('\nVerifying Determinism...');
                    console.log('----------------------------');
                    return [4 /*yield*/, generateShortlist(webAppAnswers)];
                case 4:
                    result1 = _a.sent();
                    return [4 /*yield*/, generateShortlist(webAppAnswers)];
                case 5:
                    result2 = _a.sent();
                    isDeterministic = JSON.stringify(result1) === JSON.stringify(result2);
                    console.log("Deterministic: ".concat(isDeterministic ? '✓ PASS' : '✗ FAIL'));
                    console.log('\n=== Demo Complete ===');
                    return [2 /*return*/];
            }
        });
    });
}
// Run the demo if this file is executed directly
if (import.meta.vitest) {
    // This is being run by Vitest
    // Note: generateShortlist is imported from index.ts, not defined here
}
else {
    main().catch(console.error);
}
