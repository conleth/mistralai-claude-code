"use strict";
/**
 * Jira integration adapter
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.JiraAdapter = void 0;
var axios_1 = require("axios");
var errors_1 = require("./errors");
/**
 * Field mappings for Jira
 */
var DEFAULT_FIELD_MAPPINGS = {
    'security-requirement-id': 'customfield_10000',
    'security-requirement-title': 'summary',
    'security-requirement-description': 'description',
    'security-requirement-level': 'customfield_10001',
    'security-requirement-category': 'customfield_10002',
    'security-requirement-standard': 'customfield_10003',
    'security-requirement-rationale': 'customfield_10004',
    'security-requirement-status': 'status',
};
/**
 * Jira adapter
 */
var JiraAdapter = /** @class */ (function () {
    /**
     * Create a new Jira adapter
     */
    function JiraAdapter(config) {
        this.credentials = config.credentials;
        this.fieldMappings = __assign(__assign({}, DEFAULT_FIELD_MAPPINGS), config.fieldMappings);
        this.projectKey = config.credentials.projectKey || 'SEC';
        this.issueType = config.credentials.issueType || 'Task';
        var auth = Buffer.from("".concat(this.credentials.email, ":").concat(this.credentials.apiToken)).toString('base64');
        this.client = axios_1.default.create({
            baseURL: this.credentials.serverUrl,
            headers: {
                'Authorization': "Basic ".concat(auth),
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
        // Add response interceptor for error handling
        this.client.interceptors.response.use(function (response) { return response; }, function (error) {
            if (error.response) {
                throw new errors_1.ApiError("Jira API error: ".concat(error.response.status, " ").concat(error.response.statusText), error.response.status, error.response.data);
            }
            throw new errors_1.IntegrationError("Jira API request failed: ".concat(error.message), 'JIRA_REQUEST_FAILED', { error: error.message });
        });
    }
    /**
     * Authenticate with Jira API
     */
    JiraAdapter.prototype.authenticate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // Test authentication by making a simple query
                        return [4 /*yield*/, this.client.get('/rest/api/2/myself')];
                    case 1:
                        // Test authentication by making a simple query
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        throw new errors_1.AuthenticationError('Failed to authenticate with Jira', this.credentials);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create Jira issues from shortlisted requirements
     */
    JiraAdapter.prototype.createIssues = function (shortlist_1) {
        return __awaiter(this, arguments, void 0, function (shortlist, options) {
            var _a, prefix, projectOverride, issueTypeOverride, projectKey, issueType, createdIssues, _i, shortlist_2, requirement, issue;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = options.prefix, prefix = _a === void 0 ? '' : _a, projectOverride = options.projectKey, issueTypeOverride = options.issueType;
                        projectKey = projectOverride || this.projectKey;
                        issueType = issueTypeOverride || this.issueType;
                        if (!projectKey) {
                            throw new errors_1.IntegrationError('Project key is required for creating Jira issues', 'MISSING_PROJECT_KEY');
                        }
                        createdIssues = [];
                        _i = 0, shortlist_2 = shortlist;
                        _b.label = 1;
                    case 1:
                        if (!(_i < shortlist_2.length)) return [3 /*break*/, 4];
                        requirement = shortlist_2[_i];
                        return [4 /*yield*/, this.createIssueFromRequirement(requirement, { prefix: prefix, projectKey: projectKey, issueType: issueType })];
                    case 2:
                        issue = _b.sent();
                        createdIssues.push(issue);
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, createdIssues];
                }
            });
        });
    };
    /**
     * Create a single Jira issue from a requirement
     */
    JiraAdapter.prototype.createIssueFromRequirement = function (requirement, options) {
        return __awaiter(this, void 0, void 0, function () {
            var prefix, projectKey, issueType, issueData, response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prefix = options.prefix, projectKey = options.projectKey, issueType = options.issueType;
                        issueData = this.mapRequirementToJiraIssue(requirement, { prefix: prefix, projectKey: projectKey, issueType: issueType });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.client.post('/rest/api/2/issue', issueData)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        error_2 = _a.sent();
                        if (error_2 instanceof errors_1.ApiError) {
                            throw new errors_1.IntegrationError("Failed to create Jira issue for requirement ".concat(requirement.requirementId, ": ").concat(error_2.message), 'ISSUE_CREATION_FAILED', { requirementId: requirement.requirementId, error: error_2.details });
                        }
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Map a requirement to Jira issue data
     */
    JiraAdapter.prototype.mapRequirementToJiraIssue = function (requirement, options) {
        var prefix = options.prefix, projectKey = options.projectKey, issueType = options.issueType;
        var issueSummary = "".concat(prefix).concat(requirement.requirementId, ": ").concat(requirement.title);
        return {
            'fields': {
                'project': {
                    'key': projectKey,
                },
                'summary': issueSummary,
                'description': this.buildIssueDescription(requirement),
                'issuetype': {
                    'name': issueType,
                },
                'priority': {
                    'name': this.mapLevelToPriority(requirement.level),
                },
                'customfield_10000': requirement.requirementId, // Security Requirement ID
                'customfield_10001': requirement.level, // Level
                'customfield_10002': requirement.category, // Category
                'customfield_10003': requirement.standard, // Standard
                'customfield_10004': requirement.rationale, // Rationale
                'customfield_10005': true, // Is Security Requirement
            },
        };
    };
    /**
     * Map requirement level to Jira priority
     */
    JiraAdapter.prototype.mapLevelToPriority = function (level) {
        switch (level) {
            case 'L1':
                return 'Low';
            case 'L2':
                return 'Medium';
            case 'L3':
                return 'High';
            default:
                return 'Low';
        }
    };
    /**
     * Build detailed issue description
     */
    JiraAdapter.prototype.buildIssueDescription = function (requirement) {
        return "h2. Security Requirement\n\n*ID*: ".concat(requirement.requirementId, "\n*Standard*: ").concat(requirement.standard.toUpperCase(), " ").concat(requirement.standardVersion, "\n*Level*: ").concat(requirement.level, "\n*Category*: ").concat(requirement.category, "\n\nh2. Description\n").concat(requirement.description, "\n\nh2. Rationale\n").concat(requirement.rationale, "\n\nhr\n*Generated by Security RAT Modern*\n");
    };
    /**
     * Get a Jira issue by key
     */
    JiraAdapter.prototype.getIssueByKey = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.get("/rest/api/2/issue/".concat(key))];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_3 = _a.sent();
                        throw new errors_1.IntegrationError("Failed to get Jira issue by key ".concat(key), 'ISSUE_FETCH_FAILED', { key: key });
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get a Jira issue by ID
     */
    JiraAdapter.prototype.getIssueById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.get("/rest/api/2/issue/".concat(id))];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_4 = _a.sent();
                        throw new errors_1.IntegrationError("Failed to get Jira issue by ID ".concat(id), 'ISSUE_FETCH_FAILED', { id: id });
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update Jira issue status
     */
    JiraAdapter.prototype.updateStatus = function (issueId, status) {
        return __awaiter(this, void 0, void 0, function () {
            var statusMap, jiraStatus, response, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        statusMap = {
                            'pending': 'To Do',
                            'inProgress': 'In Progress',
                            'completed': 'Done',
                            'notApplicable': 'Won\'t Do',
                        };
                        jiraStatus = statusMap[status] || 'To Do';
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.client.put("/rest/api/2/issue/".concat(issueId, "/transitions"), {
                                'transition': {
                                    'name': jiraStatus,
                                },
                            })];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, this.getIssueById(issueId)];
                    case 3:
                        error_5 = _a.sent();
                        throw new errors_1.IntegrationError("Failed to update Jira issue ".concat(issueId, " status to ").concat(status), 'ISSUE_UPDATE_FAILED', { issueId: issueId, status: status });
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Link Jira issues to a shortlist
     */
    JiraAdapter.prototype.linkIssues = function (shortlistId_1, issueKeys_1) {
        return __awaiter(this, arguments, void 0, function (shortlistId, issueKeys, options) {
            var _a, linkType, _b, description, parentIssue, parentKey, _i, issueKeys_2, issueKey, error_6;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = options.linkType, linkType = _a === void 0 ? 'Depends on' : _a, _b = options.description, description = _b === void 0 ? "Linked to shortlist ".concat(shortlistId) : _b;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, this.client.post('/rest/api/2/issue', {
                                'fields': {
                                    'project': {
                                        'key': this.projectKey,
                                    },
                                    'summary': "Shortlist: ".concat(shortlistId),
                                    'description': description,
                                    'issuetype': {
                                        'name': 'Task',
                                    },
                                },
                            })];
                    case 2:
                        parentIssue = _c.sent();
                        parentKey = parentIssue.data.key;
                        _i = 0, issueKeys_2 = issueKeys;
                        _c.label = 3;
                    case 3:
                        if (!(_i < issueKeys_2.length)) return [3 /*break*/, 6];
                        issueKey = issueKeys_2[_i];
                        return [4 /*yield*/, this.client.post('/rest/api/2/issueLink', {
                                'type': {
                                    'name': linkType,
                                },
                                'inwardIssue': {
                                    'key': parentKey,
                                },
                                'outwardIssue': {
                                    'key': issueKey,
                                },
                            })];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_6 = _c.sent();
                        throw new errors_1.IntegrationError("Failed to link Jira issues to shortlist ".concat(shortlistId), 'ISSUE_LINK_FAILED', { shortlistId: shortlistId, issueKeys: issueKeys });
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Search for Jira issues using JQL
     */
    JiraAdapter.prototype.queryIssues = function (jql_1) {
        return __awaiter(this, arguments, void 0, function (jql, options) {
            var _a, limit, _b, fields, response, error_7;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = options.limit, limit = _a === void 0 ? 50 : _a, _b = options.fields, fields = _b === void 0 ? ['*all'] : _b;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.client.get('/rest/api/2/search', {
                                params: {
                                    jql: jql,
                                    maxResults: limit,
                                    fields: fields.join(','),
                                },
                            })];
                    case 2:
                        response = _c.sent();
                        return [2 /*return*/, response.data.issues];
                    case 3:
                        error_7 = _c.sent();
                        throw new errors_1.IntegrationError("Failed to query Jira issues with JQL: ".concat(jql), 'ISSUE_QUERY_FAILED', { jql: jql });
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get available projects
     */
    JiraAdapter.prototype.getProjects = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.get('/rest/api/2/project')];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.map(function (item) { return ({
                                key: item.key,
                                name: item.name,
                            }); })];
                    case 2:
                        error_8 = _a.sent();
                        throw new errors_1.IntegrationError('Failed to fetch Jira projects', 'PROJECT_FETCH_FAILED');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get available issue types
     */
    JiraAdapter.prototype.getIssueTypes = function () {
        return __awaiter(this, arguments, void 0, function (projectKey) {
            var response, issueTypes, _i, _a, _b, key, value, error_9;
            if (projectKey === void 0) { projectKey = this.projectKey; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.get("/rest/api/2/issue/createmeta?projectKeys=".concat(projectKey))];
                    case 1:
                        response = _c.sent();
                        issueTypes = [];
                        for (_i = 0, _a = Object.entries(response.data.issuetypes || {}); _i < _a.length; _i++) {
                            _b = _a[_i], key = _b[0], value = _b[1];
                            issueTypes.push({
                                id: key,
                                name: value.name,
                            });
                        }
                        return [2 /*return*/, issueTypes];
                    case 2:
                        error_9 = _c.sent();
                        throw new errors_1.IntegrationError("Failed to fetch Jira issue types for project ".concat(projectKey), 'ISSUE_TYPE_FETCH_FAILED');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get available statuses
     */
    JiraAdapter.prototype.getStatuses = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.get('/rest/api/2/status')];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.map(function (item) { return ({
                                name: item.name,
                            }); })];
                    case 2:
                        error_10 = _a.sent();
                        throw new errors_1.IntegrationError('Failed to fetch Jira statuses', 'STATUS_FETCH_FAILED');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Test connection to Jira
     */
    JiraAdapter.prototype.testConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.authenticate()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2:
                        error_11 = _a.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Bulk create issues
     */
    JiraAdapter.prototype.bulkCreateIssues = function (shortlist_1) {
        return __awaiter(this, arguments, void 0, function (shortlist, options) {
            var _a, prefix, projectOverride, issueTypeOverride, _b, batchSize, projectKey, issueType, createdIssues, batches, i, _i, batches_1, batch, batchResults;
            var _this = this;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = options.prefix, prefix = _a === void 0 ? '' : _a, projectOverride = options.projectKey, issueTypeOverride = options.issueType, _b = options.batchSize, batchSize = _b === void 0 ? 50 : _b;
                        projectKey = projectOverride || this.projectKey;
                        issueType = issueTypeOverride || this.issueType;
                        if (!projectKey) {
                            throw new errors_1.IntegrationError('Project key is required for bulk creating Jira issues', 'MISSING_PROJECT_KEY');
                        }
                        createdIssues = [];
                        batches = [];
                        // Split into batches
                        for (i = 0; i < shortlist.length; i += batchSize) {
                            batches.push(shortlist.slice(i, i + batchSize));
                        }
                        _i = 0, batches_1 = batches;
                        _c.label = 1;
                    case 1:
                        if (!(_i < batches_1.length)) return [3 /*break*/, 4];
                        batch = batches_1[_i];
                        return [4 /*yield*/, Promise.all(batch.map(function (requirement) {
                                return _this.createIssueFromRequirement(requirement, { prefix: prefix, projectKey: projectKey, issueType: issueType });
                            }))];
                    case 2:
                        batchResults = _c.sent();
                        createdIssues.push.apply(createdIssues, batchResults);
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, createdIssues];
                }
            });
        });
    };
    return JiraAdapter;
}());
exports.JiraAdapter = JiraAdapter;
