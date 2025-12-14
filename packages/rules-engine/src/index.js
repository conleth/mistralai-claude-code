"use strict";
/**
 * @security-rat/rules-engine
 * Deterministic requirement filtering engine
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
exports.computeDerivedAttributes = computeDerivedAttributes;
exports.evaluateRules = evaluateRules;
exports.generateShortlist = generateShortlist;
exports.generateRationale = generateRationale;
exports.applyRules = applyRules;
/**
 * Compute derived attributes from questionnaire answers
 *
 * This function determines security characteristics based on user answers
 * to enable deterministic requirement filtering.
 */
function computeDerivedAttributes(answers) {
    // Extract answers with type safety
    var appType = answers['app-type'];
    var authType = answers['auth-type'];
    var dataSensitivity = answers['data-sensitivity'];
    var internetExposed = answers['internet-exposed'];
    var hostingModel = answers['hosting-model'];
    var pipelineMaturity = answers['pipeline-maturity'];
    // Determine if internet exposed
    var isInternetExposed = internetExposed === 'public';
    // Determine if authentication is required
    var hasAuth = authType !== 'none';
    // Determine if regulated data is handled
    var isRegulatedData = dataSensitivity === 'regulated' || dataSensitivity === 'confidential';
    // Determine if mobile client is used
    var hasMobileClient = appType === 'mobile';
    // Determine recommended ASVS level
    var recommendedASVSLevel = 'L1';
    if (isInternetExposed && hasAuth && isRegulatedData) {
        recommendedASVSLevel = 'L3';
    }
    else if (isInternetExposed && hasAuth) {
        recommendedASVSLevel = 'L2';
    }
    else if (isInternetExposed) {
        recommendedASVSLevel = 'L2';
    }
    // Determine recommended SPVS level
    var recommendedSPVSLevel = 'L1';
    if (pipelineMaturity === 'advanced') {
        recommendedSPVSLevel = 'L3';
    }
    else if (pipelineMaturity === 'intermediate') {
        recommendedSPVSLevel = 'L2';
    }
    // Determine applicable ASVS categories based on app type
    var applicableASVSCategories = [];
    if (appType === 'web' || appType === 'api') {
        applicableASVSCategories.push('V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14');
    }
    if (appType === 'mobile') {
        applicableASVSCategories.push('V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14');
    }
    if (appType === 'internal') {
        applicableASVSCategories.push('V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13');
    }
    // Determine applicable SPVS stages
    var applicableSPVSStages = ['V1', 'V2', 'V3', 'V4', 'V5'];
    return {
        internetExposed: isInternetExposed,
        requiresAuth: hasAuth,
        handlesRegulatedData: isRegulatedData,
        usesMobileClient: hasMobileClient,
        recommendedASVSLevel: recommendedASVSLevel,
        recommendedSPVSLevel: recommendedSPVSLevel,
        applicableASVSCategories: applicableASVSCategories,
        applicableSPVSStages: applicableSPVSStages,
    };
}
/**
 * Evaluate rules against requirements
 *
 * Returns requirements that match the rules based on derived attributes
 */
function evaluateRules(requirements, rules, derivedAttributes, questionnaireAnswers) {
    var shortlisted = [];
    // Create a map of rules by requirement ID for quick lookup
    var rulesMap = new Map();
    rules.forEach(function (rule) {
        var key = "".concat(rule.standard, ":").concat(rule.requirementId);
        if (!rulesMap.has(key)) {
            rulesMap.set(key, []);
        }
        rulesMap.get(key).push(rule);
    });
    // Evaluate each requirement against its rules
    for (var _i = 0, requirements_1 = requirements; _i < requirements_1.length; _i++) {
        var requirement = requirements_1[_i];
        var key = "".concat(requirement.standard, ":").concat(requirement.id);
        var matchingRules = rulesMap.get(key);
        if (matchingRules && matchingRules.length > 0) {
            // Check if any rule matches
            var matchedRules = matchingRules.filter(function (rule) {
                return evaluateRule(rule, derivedAttributes);
            });
            if (matchedRules.length > 0) {
                // Generate rationale from the first matching rule
                var rationale = generateRationale(matchedRules[0], derivedAttributes);
                shortlisted.push({
                    standard: requirement.standard,
                    standardVersion: requirement.version,
                    requirementId: requirement.id,
                    title: requirement.title,
                    description: requirement.description,
                    level: requirement.level,
                    category: requirement.category,
                    tags: requirement.tags,
                    rationale: rationale,
                    derivedFrom: {
                        questionnaireAnswers: Object.fromEntries(Object.entries(questionnaireAnswers).map(function (_a) {
                            var key = _a[0], value = _a[1];
                            return [key, Array.isArray(value) ? value.join(',') : value];
                        })),
                        ruleIds: matchedRules.map(function (r) { return r.id; }),
                    },
                    status: 'pending',
                });
            }
        }
    }
    return shortlisted;
}
/**
 * Generate a shortlist from questionnaire answers
 *
 * This is a convenience wrapper around applyRules that loads the default rules
 * and returns a promise for easier use in async contexts.
 */
function generateShortlist(questionnaireAnswers) {
    return __awaiter(this, void 0, void 0, function () {
        var loadStandard, asvsRequirements, rules;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('@security-rat/standards'); })];
                case 1:
                    loadStandard = (_a.sent()).loadStandard;
                    return [4 /*yield*/, loadStandard('ASVS', '5.0')];
                case 2:
                    asvsRequirements = _a.sent();
                    rules = [
                        {
                            id: 'asvs-level',
                            standard: 'ASVS',
                            requirementId: '*', // Apply to all requirements
                            conditions: [
                                {
                                    field: 'recommendedASVSLevel',
                                    operator: 'equals',
                                    value: Array.isArray(questionnaireAnswers['recommendedASVSLevel'])
                                        ? questionnaireAnswers['recommendedASVSLevel'][0] || 'L1'
                                        : (questionnaireAnswers['recommendedASVSLevel'] || 'L1'),
                                },
                            ],
                            rationale: 'Selected based on application security requirements',
                        },
                    ];
                    return [2 /*return*/, applyRules(asvsRequirements, rules, questionnaireAnswers)];
            }
        });
    });
}
/**
 * Evaluate a single rule against derived attributes
 */
function evaluateRule(rule, derivedAttributes) {
    return rule.conditions.every(function (condition) {
        var fieldValue = getFieldValue(condition.field, derivedAttributes);
        switch (condition.operator) {
            case 'equals':
                return fieldValue === condition.value;
            case 'includes':
                if (Array.isArray(fieldValue)) {
                    return fieldValue.includes(condition.value);
                }
                return String(fieldValue).includes(String(condition.value));
            case 'greaterThan':
                return fieldValue > condition.value;
            case 'lessThan':
                return fieldValue < condition.value;
            default:
                return false;
        }
    });
}
/**
 * Get value from derived attributes by field name
 */
function getFieldValue(field, derivedAttributes) {
    // Handle nested properties if needed
    if (field in derivedAttributes) {
        return derivedAttributes[field];
    }
    // Handle special cases
    if (field === 'level') {
        return derivedAttributes.recommendedASVSLevel;
    }
    throw new Error("Field ".concat(field, " not found in derived attributes"));
}
/**
 * Generate rationale string from rule template
 *
 * Replaces placeholders like {field} with actual values from derived attributes
 */
function generateRationale(rule, derivedAttributes) {
    var rationale = rule.rationale;
    // Replace field placeholders
    rule.conditions.forEach(function (condition) {
        var fieldValue = getFieldValue(condition.field, derivedAttributes);
        var placeholder = "{".concat(condition.field, "}");
        rationale = rationale.replace(placeholder, String(fieldValue));
    });
    return rationale;
}
/**
 * Apply all rules to generate a shortlist
 *
 * This is the main entry point for the rules engine
 */
function applyRules(requirements, rules, questionnaireAnswers) {
    // Step 1: Compute derived attributes
    var derivedAttributes = computeDerivedAttributes(questionnaireAnswers);
    // Step 2: Evaluate rules
    var shortlisted = evaluateRules(requirements, rules, derivedAttributes, questionnaireAnswers);
    return shortlisted;
}
