"use strict";
/**
 * Rally integration adapter
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
exports.RallyAdapter = void 0;
var axios_1 = require("axios");
var errors_1 = require("./errors");
/**
 * Field mappings for Rally
 */
var DEFAULT_FIELD_MAPPINGS = {
    'security-requirement-id': 'c_RequirementID',
    'security-requirement-title': 'Name',
    'security-requirement-description': 'Description',
    'security-requirement-level': 'c_Level',
    'security-requirement-category': 'c_Category',
    'security-requirement-standard': 'c_Standard',
    'security-requirement-rationale': 'c_Rationale',
    'security-requirement-status': 'State',
};
/**
 * Rally adapter
 */
var RallyAdapter = /** @class */ (function () {
    /**
     * Create a new Rally adapter
     */
    function RallyAdapter(config) {
        this.credentials = config.credentials;
        this.fieldMappings = __assign(__assign({}, DEFAULT_FIELD_MAPPINGS), config.fieldMappings);
        this.workspace = config.credentials.workspace || 'Default Workspace';
        this.project = config.credentials.project || 'Default Project';
        this.client = axios_1.default.create({
            baseURL: this.credentials.serverUrl,
            headers: {
                'ZSESSIONID': this.credentials.apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
        // Add response interceptor for error handling
        this.client.interceptors.response.use(function (response) { return response; }, function (error) {
            if (error.response) {
                throw new errors_1.ApiError("Rally API error: ".concat(error.response.status, " ").concat(error.response.statusText), error.response.status, error.response.data);
            }
            throw new errors_1.IntegrationError("Rally API request failed: ".concat(error.message), 'RALLY_REQUEST_FAILED', { error: error.message });
        });
    }
    /**
     * Authenticate with Rally API
     */
    RallyAdapter.prototype.authenticate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // Test authentication by making a simple query
                        return [4 /*yield*/, this.client.get('/slm/webservices/v2.0/defect')];
                    case 1:
                        // Test authentication by making a simple query
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        throw new errors_1.AuthenticationError('Failed to authenticate with Rally', this.credentials);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create Rally tickets from shortlisted requirements
     */
    RallyAdapter.prototype.createTickets = function (shortlist_1) {
        return __awaiter(this, arguments, void 0, function (shortlist, options) {
            var _a, prefix, projectOverride, workspaceOverride, project, workspace, createdTickets, _i, shortlist_2, requirement, ticket;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = options.prefix, prefix = _a === void 0 ? 'SEC-' : _a, projectOverride = options.project, workspaceOverride = options.workspace;
                        project = projectOverride || this.project;
                        workspace = workspaceOverride || this.workspace;
                        if (!project) {
                            throw new errors_1.IntegrationError('Project is required for creating Rally tickets', 'MISSING_PROJECT');
                        }
                        createdTickets = [];
                        _i = 0, shortlist_2 = shortlist;
                        _b.label = 1;
                    case 1:
                        if (!(_i < shortlist_2.length)) return [3 /*break*/, 4];
                        requirement = shortlist_2[_i];
                        return [4 /*yield*/, this.createTicketFromRequirement(requirement, { prefix: prefix, project: project, workspace: workspace })];
                    case 2:
                        ticket = _b.sent();
                        createdTickets.push(ticket);
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, createdTickets];
                }
            });
        });
    };
    /**
     * Create a single Rally ticket from a requirement
     */
    RallyAdapter.prototype.createTicketFromRequirement = function (requirement, options) {
        return __awaiter(this, void 0, void 0, function () {
            var prefix, project, workspace, ticketData, response, ticketRef, ticket, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prefix = options.prefix, project = options.project, workspace = options.workspace;
                        ticketData = this.mapRequirementToRallyTicket(requirement, { prefix: prefix, project: project, workspace: workspace });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.client.post('/slm/webservices/v2.0/defect', ticketData)];
                    case 2:
                        response = _a.sent();
                        ticketRef = response.data._ref;
                        return [4 /*yield*/, this.getTicketByRef(ticketRef)];
                    case 3:
                        ticket = _a.sent();
                        return [2 /*return*/, ticket];
                    case 4:
                        error_2 = _a.sent();
                        if (error_2 instanceof errors_1.ApiError) {
                            throw new errors_1.IntegrationError("Failed to create Rally ticket for requirement ".concat(requirement.requirementId, ": ").concat(error_2.message), 'TICKET_CREATION_FAILED', { requirementId: requirement.requirementId, error: error_2.details });
                        }
                        throw error_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Map a requirement to Rally ticket data
     */
    RallyAdapter.prototype.mapRequirementToRallyTicket = function (requirement, options) {
        var prefix = options.prefix, project = options.project, workspace = options.workspace;
        var ticketName = "".concat(prefix).concat(requirement.requirementId, ": ").concat(requirement.title);
        return {
            'Name': ticketName,
            'Description': this.buildTicketDescription(requirement),
            'Project': { _ref: "/project/".concat(project) },
            'Workspace': { _ref: "/workspace/".concat(workspace) },
            'State': 'Defined', // Default state
            'ScheduleState': 'Defined',
            'c_RequirementID': requirement.requirementId,
            'c_Level': requirement.level,
            'c_Category': requirement.category,
            'c_Standard': requirement.standard,
            'c_Rationale': requirement.rationale,
            'c_SecurityRequirement': true,
        };
    };
    /**
     * Build detailed ticket description
     */
    RallyAdapter.prototype.buildTicketDescription = function (requirement) {
        return "## Security Requirement\n\n**ID**: ".concat(requirement.requirementId, "\n**Standard**: ").concat(requirement.standard.toUpperCase(), " ").concat(requirement.standardVersion, "\n**Level**: ").concat(requirement.level, "\n**Category**: ").concat(requirement.category, "\n\n## Description\n").concat(requirement.description, "\n\n## Rationale\n").concat(requirement.rationale, "\n\n---\n*Generated by Security RAT Modern*\n");
    };
    /**
     * Get a Rally ticket by reference
     */
    RallyAdapter.prototype.getTicketByRef = function (ref) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.get(ref)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, this.mapRallyResponseToTicket(response.data)];
                    case 2:
                        error_3 = _a.sent();
                        throw new errors_1.IntegrationError("Failed to get Rally ticket by ref ".concat(ref), 'TICKET_FETCH_FAILED', { ref: ref });
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get a Rally ticket by ID
     */
    RallyAdapter.prototype.getTicketById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.get("/slm/webservices/v2.0/defect/".concat(id))];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, this.mapRallyResponseToTicket(response.data)];
                    case 2:
                        error_4 = _a.sent();
                        throw new errors_1.IntegrationError("Failed to get Rally ticket by ID ".concat(id), 'TICKET_FETCH_FAILED', { id: id });
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update Rally ticket status
     */
    RallyAdapter.prototype.updateStatus = function (ticketId, status) {
        return __awaiter(this, void 0, void 0, function () {
            var stateMap, rallyState, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        stateMap = {
                            'pending': 'Defined',
                            'inProgress': 'In Progress',
                            'completed': 'Completed',
                            'notApplicable': 'Obsolete',
                        };
                        rallyState = stateMap[status] || 'Defined';
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.client.put("/slm/webservices/v2.0/defect/".concat(ticketId), {
                                'State': rallyState,
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, this.getTicketById(ticketId)];
                    case 3:
                        error_5 = _a.sent();
                        throw new errors_1.IntegrationError("Failed to update Rally ticket ".concat(ticketId, " status to ").concat(status), 'TICKET_UPDATE_FAILED', { ticketId: ticketId, status: status });
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Link Rally tickets to a shortlist
     */
    RallyAdapter.prototype.linkTickets = function (shortlistId_1, ticketIds_1) {
        return __awaiter(this, arguments, void 0, function (shortlistId, ticketIds, options) {
            var _a, linkType, _b, description, parentTask, _i, ticketIds_2, ticketId, error_6;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = options.linkType, linkType = _a === void 0 ? 'Depends On' : _a, _b = options.description, description = _b === void 0 ? "Linked to shortlist ".concat(shortlistId) : _b;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, this.client.post('/slm/webservices/v2.0/task', {
                                'Name': "Shortlist: ".concat(shortlistId),
                                'Description': description,
                                'Project': { _ref: "/project/".concat(this.project) },
                                'Workspace': { _ref: "/workspace/".concat(this.workspace) },
                                'State': 'Defined',
                            })];
                    case 2:
                        parentTask = _c.sent();
                        _i = 0, ticketIds_2 = ticketIds;
                        _c.label = 3;
                    case 3:
                        if (!(_i < ticketIds_2.length)) return [3 /*break*/, 6];
                        ticketId = ticketIds_2[_i];
                        return [4 /*yield*/, this.client.post("/slm/webservices/v2.0/defect/".concat(ticketId, "/Updates"), {
                                'Updates': {
                                    '_rallyAPIMajor': '2',
                                    '_rallyAPIMinor': '0',
                                    'Revision': {
                                        '_ref': "/defect/".concat(ticketId),
                                    },
                                    'ChangeNotes': {
                                        'content': "Linked to shortlist ".concat(shortlistId),
                                    },
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
                        throw new errors_1.IntegrationError("Failed to link Rally tickets to shortlist ".concat(shortlistId), 'TICKET_LINK_FAILED', { shortlistId: shortlistId, ticketIds: ticketIds });
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Search for Rally tickets
     */
    RallyAdapter.prototype.searchTickets = function (query_1) {
        return __awaiter(this, arguments, void 0, function (query, limit) {
            var response, error_7;
            var _this = this;
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.get('/slm/webservices/v2.0/defect', {
                                params: {
                                    query: query,
                                    fetch: 'true',
                                    pagesize: limit,
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.Results.map(function (item) { return _this.mapRallyResponseToTicket(item); })];
                    case 2:
                        error_7 = _a.sent();
                        throw new errors_1.IntegrationError("Failed to search Rally tickets: ".concat(query), 'TICKET_SEARCH_FAILED', { query: query });
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Map Rally API response to internal ticket format
     */
    RallyAdapter.prototype.mapRallyResponseToTicket = function (data) {
        var _a;
        return {
            ref: data._ref,
            id: data.ObjectID,
            name: data.Name,
            description: data.Description || '',
            state: data.State || 'Defined',
            project: ((_a = data.Project) === null || _a === void 0 ? void 0 : _a._ref) || '',
            createdAt: data.CreationDate || new Date().toISOString(),
            updatedAt: data.LastUpdateDate || new Date().toISOString(),
            url: "".concat(this.credentials.serverUrl, "/#/defect detail/").concat(data.ObjectID),
            customFields: {
                requirementId: data.c_RequirementID,
                level: data.c_Level,
                category: data.c_Category,
                standard: data.c_Standard,
                rationale: data.c_Rationale,
            },
        };
    };
    /**
     * Get available projects
     */
    RallyAdapter.prototype.getProjects = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.get('/slm/webservices/v2.0/project')];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.Results.map(function (item) { return ({
                                id: item.ObjectID,
                                name: item.Name,
                            }); })];
                    case 2:
                        error_8 = _a.sent();
                        throw new errors_1.IntegrationError('Failed to fetch Rally projects', 'PROJECT_FETCH_FAILED');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get available workspaces
     */
    RallyAdapter.prototype.getWorkspaces = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.get('/slm/webservices/v2.0/workspace')];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.Results.map(function (item) { return ({
                                id: item.ObjectID,
                                name: item.Name,
                            }); })];
                    case 2:
                        error_9 = _a.sent();
                        throw new errors_1.IntegrationError('Failed to fetch Rally workspaces', 'WORKSPACE_FETCH_FAILED');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Test connection to Rally
     */
    RallyAdapter.prototype.testConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.authenticate()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2:
                        error_10 = _a.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return RallyAdapter;
}());
exports.RallyAdapter = RallyAdapter;
