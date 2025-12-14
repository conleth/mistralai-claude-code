"use strict";
/**
 * Database connection and migration utility
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
exports.initializeDatabase = initializeDatabase;
exports.closeDatabase = closeDatabase;
var sqlite3_1 = require("sqlite3");
var sqlite_1 = require("sqlite");
var path_1 = require("path");
var fs_1 = require("fs");
// Database configuration
var DB_PATH = path_1.default.join(process.cwd(), 'data', 'security-rat.db');
var MIGRATIONS_DIR = path_1.default.join(__dirname, 'migrations');
// Ensure data directory exists
if (!fs_1.default.existsSync(path_1.default.dirname(DB_PATH))) {
    fs_1.default.mkdirSync(path_1.default.dirname(DB_PATH), { recursive: true });
}
/**
 * Initialize database and run migrations
 */
function initializeDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Initializing database at ".concat(DB_PATH));
                    return [4 /*yield*/, (0, sqlite_1.open)({
                            filename: DB_PATH,
                            driver: sqlite3_1.Database,
                            mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
                        })];
                case 1:
                    db = _a.sent();
                    // Run migrations
                    return [4 /*yield*/, runMigrations(db)];
                case 2:
                    // Run migrations
                    _a.sent();
                    console.log('Database initialized successfully');
                    return [2 /*return*/, db];
            }
        });
    });
}
/**
 * Run all pending migrations
 */
function runMigrations(db) {
    return __awaiter(this, void 0, void 0, function () {
        var result, appliedMigrations, migrationFiles, _loop_1, _i, migrationFiles_1, file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Running migrations...');
                    return [4 /*yield*/, db.get('SELECT name FROM sqlite_master WHERE type=\'table\' AND name=\'migrations\'')];
                case 1:
                    result = _a.sent();
                    if (!!result) return [3 /*break*/, 3];
                    // Create migrations table
                    return [4 /*yield*/, db.exec("CREATE TABLE migrations (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        name TEXT UNIQUE,\n        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n      )")];
                case 2:
                    // Create migrations table
                    _a.sent();
                    _a.label = 3;
                case 3: return [4 /*yield*/, db.all('SELECT name FROM migrations ORDER BY id')];
                case 4:
                    appliedMigrations = _a.sent();
                    migrationFiles = fs_1.default.readdirSync(MIGRATIONS_DIR)
                        .filter(function (file) { return file.endsWith('.sql'); })
                        .sort();
                    _loop_1 = function (file) {
                        var migrationName, migrationPath, sql;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    migrationName = path_1.default.basename(file, '.sql');
                                    if (!!appliedMigrations.some(function (m) { return m.name === migrationName; })) return [3 /*break*/, 3];
                                    console.log("Applying migration: ".concat(migrationName));
                                    migrationPath = path_1.default.join(MIGRATIONS_DIR, file);
                                    sql = fs_1.default.readFileSync(migrationPath, 'utf-8');
                                    return [4 /*yield*/, db.exec(sql)];
                                case 1:
                                    _b.sent();
                                    // Mark migration as applied
                                    return [4 /*yield*/, db.run('INSERT INTO migrations (name) VALUES (?)', migrationName)];
                                case 2:
                                    // Mark migration as applied
                                    _b.sent();
                                    _b.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, migrationFiles_1 = migrationFiles;
                    _a.label = 5;
                case 5:
                    if (!(_i < migrationFiles_1.length)) return [3 /*break*/, 8];
                    file = migrationFiles_1[_i];
                    return [5 /*yield**/, _loop_1(file)];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8:
                    console.log('Migrations completed');
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Close database connection
 */
function closeDatabase(db) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.close()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
