"use strict";
/**
 * @security-rat/backend
 * Fastify API server
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
var fastify_1 = require("fastify");
var cors_1 = require("@fastify/cors");
var jwt_1 = require("@fastify/jwt");
var database_js_1 = require("./database.js");
var uuid_1 = require("uuid");
var bcryptjs_1 = require("bcryptjs");
var zod_1 = require("zod");
var server = (0, fastify_1.default)({
    logger: true,
});
// Initialize database
var db;
try {
    db = await (0, database_js_1.initializeDatabase)();
    server.decorate('db', db);
}
catch (error) {
    msg: error;
    'Failed to initialize database:', error;
    ;
    process.exit(1);
}
// Register plugins
await server.register(cors_1.default, {
    origin: true,
});
await server.register(jwt_1.default, {
    secret: process.env.JWT_SECRET || 'supersecret',
});
// Authentication hooks
server.addHook('onRequest', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var token, err_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                // Skip authentication for public routes
                if (request.url.startsWith('/health') || request.url.startsWith('/api/v1/auth')) {
                    return [2 /*return*/];
                }
                token = (_a = request.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
                if (!token) {
                    reply.code(401).send({ message: 'Unauthorized' });
                }
                return [4 /*yield*/, request.jwtVerify()];
            case 1:
                _b.sent();
                return [3 /*break*/, 3];
            case 2:
                err_1 = _b.sent();
                reply.code(401).send({ message: 'Invalid token' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Health check endpoint
server.get('/health', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, { status: 'ok', timestamp: new Date().toISOString() }];
    });
}); });
// Authentication routes
server.post('/api/v1/auth/register', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var schema, _a, name, email, password, role, existingUser, passwordHash, userId;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                schema = zod_1.z.object({
                    name: zod_1.z.string().min(1),
                    email: zod_1.z.string().email(),
                    password: zod_1.z.string().min(8),
                    role: zod_1.z.enum(['security-lead', 'developer', 'product-manager', 'auditor']).optional().default('developer'),
                });
                _a = schema.parse(request.body), name = _a.name, email = _a.email, password = _a.password, role = _a.role;
                return [4 /*yield*/, db.get('SELECT id FROM users WHERE email = ?', email)];
            case 1:
                existingUser = _b.sent();
                if (existingUser) {
                    return [2 /*return*/, reply.code(400).send({ message: 'User already exists' })];
                }
                return [4 /*yield*/, bcryptjs_1.default.hash(password, 10)];
            case 2:
                passwordHash = _b.sent();
                userId = (0, uuid_1.v4)();
                return [4 /*yield*/, db.run('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)', userId, name, email, passwordHash, role)];
            case 3:
                _b.sent();
                // Log audit
                return [4 /*yield*/, db.run('INSERT INTO audit_log (user_id, action, entity_type, entity_id, changes) VALUES (?, ?, ?, ?, ?)', userId, 'create', 'user', userId, JSON.stringify({ email: email, role: role }))];
            case 4:
                // Log audit
                _b.sent();
                return [2 /*return*/, { id: userId, name: name, email: email, role: role }];
        }
    });
}); });
server.post('/api/v1/auth/login', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var schema, _a, email, password, user, passwordValid, token;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                schema = zod_1.z.object({
                    email: zod_1.z.string().email(),
                    password: zod_1.z.string().min(1),
                });
                _a = schema.parse(request.body), email = _a.email, password = _a.password;
                return [4 /*yield*/, db.get('SELECT * FROM users WHERE email = ?', email)];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, reply.code(401).send({ message: 'Invalid credentials' })];
                }
                return [4 /*yield*/, bcryptjs_1.default.compare(password, user.password_hash)];
            case 2:
                passwordValid = _b.sent();
                if (!passwordValid) {
                    return [2 /*return*/, reply.code(401).send({ message: 'Invalid credentials' })];
                }
                token = server.jwt.sign({ userId: user.id, email: user.email, role: user.role }, { expiresIn: '7d' });
                // Log audit
                return [4 /*yield*/, db.run('INSERT INTO audit_log (user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?)', user.id, 'login', 'user', user.id)];
            case 3:
                // Log audit
                _b.sent();
                return [2 /*return*/, { token: token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }];
        }
    });
}); });
// Questionnaire endpoints
server.get('/api/v1/questionnaires', function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, questionnaires;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = request.user.id;
                return [4 /*yield*/, db.all('SELECT * FROM questionnaires WHERE created_by = ? ORDER BY created_at DESC', userId)];
            case 1:
                questionnaires = _a.sent();
                return [2 /*return*/, questionnaires];
        }
    });
}); });
server.post('/api/v1/questionnaires', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, schema, _a, name, description, isTemplate, questionnaireId;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                userId = request.user.id;
                schema = zod_1.z.object({
                    name: zod_1.z.string().min(1),
                    description: zod_1.z.string().optional(),
                    isTemplate: zod_1.z.boolean().optional().default(false),
                });
                _a = schema.parse(request.body), name = _a.name, description = _a.description, isTemplate = _a.isTemplate;
                questionnaireId = (0, uuid_1.v4)();
                return [4 /*yield*/, db.run('INSERT INTO questionnaires (id, name, description, created_by, is_template) VALUES (?, ?, ?, ?, ?)', questionnaireId, name, description || null, userId, isTemplate)];
            case 1:
                _b.sent();
                // Log audit
                return [4 /*yield*/, db.run('INSERT INTO audit_log (user_id, action, entity_type, entity_id, changes) VALUES (?, ?, ?, ?, ?)', userId, 'create', 'questionnaire', questionnaireId, JSON.stringify({ name: name, description: description, isTemplate: isTemplate }))];
            case 2:
                // Log audit
                _b.sent();
                return [2 /*return*/, reply.code(201).send({ id: questionnaireId, name: name, description: description, isTemplate: isTemplate })];
        }
    });
}); });
server.get('/api/v1/questionnaires/:id', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, questionnaire;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = request.params.id;
                userId = request.user.id;
                return [4 /*yield*/, db.get('SELECT * FROM questionnaires WHERE id = ? AND created_by = ?', id, userId)];
            case 1:
                questionnaire = _a.sent();
                if (!questionnaire) {
                    return [2 /*return*/, reply.code(404).send({ message: 'Questionnaire not found' })];
                }
                return [2 /*return*/, questionnaire];
        }
    });
}); });
// Questionnaire Answers endpoints
server.post('/api/v1/questionnaire-answers', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, schema, _a, questionnaireId, answers, version, questionnaire, answersId;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                userId = request.user.id;
                schema = zod_1.z.object({
                    questionnaireId: zod_1.z.string().uuid(),
                    answers: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
                    version: zod_1.z.string().optional().default('1.0'),
                });
                _a = schema.parse(request.body), questionnaireId = _a.questionnaireId, answers = _a.answers, version = _a.version;
                return [4 /*yield*/, db.get('SELECT id FROM questionnaires WHERE id = ? AND created_by = ?', questionnaireId, userId)];
            case 1:
                questionnaire = _b.sent();
                if (!questionnaire) {
                    return [2 /*return*/, reply.code(404).send({ message: 'Questionnaire not found' })];
                }
                answersId = (0, uuid_1.v4)();
                return [4 /*yield*/, db.run('INSERT INTO questionnaire_answers (id, questionnaire_id, answers, version, created_by) VALUES (?, ?, ?, ?, ?)', answersId, questionnaireId, JSON.stringify(answers), version, userId)];
            case 2:
                _b.sent();
                // Log audit
                return [4 /*yield*/, db.run('INSERT INTO audit_log (user_id, action, entity_type, entity_id, changes) VALUES (?, ?, ?, ?, ?)', userId, 'create', 'questionnaire_answers', answersId, JSON.stringify({ questionnaireId: questionnaireId, version: version }))];
            case 3:
                // Log audit
                _b.sent();
                return [2 /*return*/, reply.code(201).send({ id: answersId, questionnaireId: questionnaireId, version: version })];
        }
    });
}); });
server.get('/api/v1/questionnaire-answers', function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, answers;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = request.user.id;
                return [4 /*yield*/, db.all('SELECT qa.*, q.name as questionnaire_name FROM questionnaire_answers qa JOIN questionnaires q ON qa.questionnaire_id = q.id WHERE qa.created_by = ? ORDER BY qa.created_at DESC', userId)];
            case 1:
                answers = _a.sent();
                return [2 /*return*/, answers];
        }
    });
}); });
server.get('/api/v1/questionnaire-answers/:id', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, answers;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = request.params.id;
                userId = request.user.id;
                return [4 /*yield*/, db.get('SELECT * FROM questionnaire_answers WHERE id = ? AND created_by = ?', id, userId)];
            case 1:
                answers = _a.sent();
                if (!answers) {
                    return [2 /*return*/, reply.code(404).send({ message: 'Answers not found' })];
                }
                return [2 /*return*/, __assign(__assign({}, answers), { answers: JSON.parse(answers.answers) })];
        }
    });
}); });
// Shortlist endpoints
server.post('/api/v1/shortlist', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, schema, _a, questionnaireAnswersId, version, answers, generateShortlist, parsedAnswers, shortlist, shortlistId, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                userId = request.user.id;
                schema = zod_1.z.object({
                    questionnaireAnswersId: zod_1.z.string().uuid(),
                    version: zod_1.z.string().optional().default('1.0'),
                });
                _a = schema.parse(request.body), questionnaireAnswersId = _a.questionnaireAnswersId, version = _a.version;
                return [4 /*yield*/, db.get('SELECT * FROM questionnaire_answers WHERE id = ? AND created_by = ?', questionnaireAnswersId, userId)];
            case 1:
                answers = _b.sent();
                if (!answers) {
                    return [2 /*return*/, reply.code(404).send({ message: 'Questionnaire answers not found' })];
                }
                _b.label = 2;
            case 2:
                _b.trys.push([2, 7, , 8]);
                return [4 /*yield*/, Promise.resolve().then(function () { return require('@security-rat/rules-engine'); })];
            case 3:
                generateShortlist = (_b.sent()).generateShortlist;
                parsedAnswers = JSON.parse(answers.answers);
                return [4 /*yield*/, generateShortlist(parsedAnswers)];
            case 4:
                shortlist = _b.sent();
                shortlistId = (0, uuid_1.v4)();
                return [4 /*yield*/, db.run('INSERT INTO shortlists (id, questionnaire_answers_id, requirements, version) VALUES (?, ?, ?, ?)', shortlistId, questionnaireAnswersId, JSON.stringify(shortlist), version)];
            case 5:
                _b.sent();
                // Log audit
                return [4 /*yield*/, db.run('INSERT INTO audit_log (user_id, action, entity_type, entity_id, changes) VALUES (?, ?, ?, ?, ?)', userId, 'create', 'shortlist', shortlistId, JSON.stringify({ questionnaireAnswersId: questionnaireAnswersId, count: shortlist.length }))];
            case 6:
                // Log audit
                _b.sent();
                return [2 /*return*/, { id: shortlistId, requirements: shortlist, version: version }];
            case 7:
                error_1 = _b.sent();
                msg: error_1;
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
'Error generating shortlist:', error;
;
return reply.code(500).send({ message: 'Failed to generate shortlist' });
;
server.get('/api/v1/shortlist/:id', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, shortlist;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = request.params.id;
                userId = request.user.id;
                return [4 /*yield*/, db.get('SELECT s.*, qa.questionnaire_id FROM shortlists s JOIN questionnaire_answers qa ON s.questionnaire_answers_id = qa.id JOIN questionnaires q ON qa.questionnaire_id = q.id WHERE s.id = ? AND qa.created_by = ?', id, userId)];
            case 1:
                shortlist = _a.sent();
                if (!shortlist) {
                    return [2 /*return*/, reply.code(404).send({ message: 'Shortlist not found' })];
                }
                return [2 /*return*/, __assign(__assign({}, shortlist), { requirements: JSON.parse(shortlist.requirements) })];
        }
    });
}); });
// Start server
var start = function () { return __awaiter(void 0, void 0, void 0, function () {
    var port, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                port = Number(process.env.PORT) || 3000;
                return [4 /*yield*/, server.listen({ port: port, host: '0.0.0.0' })];
            case 1:
                _a.sent();
                console.log("Server running at http://localhost:".concat(port));
                return [3 /*break*/, 3];
            case 2:
                err_2 = _a.sent();
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }, msg, as, Error, err;
process.exit(1);
;
// Graceful shutdown
process.on('SIGINT', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('Shutting down server...');
                return [4 /*yield*/, server.close()];
            case 1:
                _a.sent();
                return [4 /*yield*/, (0, database_js_1.closeDatabase)(db)];
            case 2:
                _a.sent();
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); });
process.on('SIGTERM', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('Shutting down server...');
                return [4 /*yield*/, server.close()];
            case 1:
                _a.sent();
                return [4 /*yield*/, (0, database_js_1.closeDatabase)(db)];
            case 2:
                _a.sent();
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); });
start();
