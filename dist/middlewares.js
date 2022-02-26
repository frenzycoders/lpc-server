"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocketWithMachineId = exports.ismachineOnline = exports.checkMachineOwner = exports.comparePassword = exports.encryptPassword = exports.downloadAuthenticated = exports.isAuthenticated = exports.parseAuthorizationToken = exports.validateJwtToken = exports.generateJwtToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("./models");
const bcrypt_1 = require("bcrypt");
const io_server_1 = require("./io.server");
const jwtSecretKey = process.env.JWT_KEY || 'some text';
const generateJwtToken = (payload) => {
    const jwtToken = jsonwebtoken_1.default.sign(payload, jwtSecretKey, { expiresIn: 60 * 60 * 24 * 7 });
    return jwtToken;
};
exports.generateJwtToken = generateJwtToken;
const validateJwtToken = (token) => {
    const decoded = jsonwebtoken_1.default.verify(token, jwtSecretKey);
    return decoded;
};
exports.validateJwtToken = validateJwtToken;
const parseAuthorizationToken = (token) => {
    if (!token)
        throw new Error('authorizationToken not found');
    if (!token.includes('Bearer '))
        throw new Error('invalid token Bearer must be in token');
    return token.split('Bearer ')[1];
};
exports.parseAuthorizationToken = parseAuthorizationToken;
const isAuthenticated = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let headers = req.headers;
        const authorizationToken = (0, exports.parseAuthorizationToken)(headers.authorization);
        if (!authorizationToken)
            return res.status(400).send('authorization token not found');
        const decoded = (0, exports.validateJwtToken)(authorizationToken);
        const user = yield models_1.User.findById(decoded.id);
        if (!user)
            return res.status(404).send('your token is expired please login again.');
        if (!user.token.includes(authorizationToken))
            return res.status(400).send('invalid authorization token');
        req.user = user;
        req.token = headers.authorization;
        next();
    }
    catch (error) {
        return res.status(500).send(error.message);
    }
});
exports.isAuthenticated = isAuthenticated;
const downloadAuthenticated = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let headers = req.query;
        const authorizationToken = (0, exports.parseAuthorizationToken)(headers.authorization);
        if (!authorizationToken)
            return res.status(400).send('authorization token not found');
        const decoded = (0, exports.validateJwtToken)(authorizationToken);
        const user = yield models_1.User.findById(decoded.id);
        if (!user)
            return res.status(404).send('your token is expired please login again.');
        if (!user.token.includes(authorizationToken))
            return res.status(400).send('invalid authorization token');
        req.user = user;
        req.token = headers.authorization;
        next();
    }
    catch (error) {
        return res.status(500).send(error.message);
    }
});
exports.downloadAuthenticated = downloadAuthenticated;
const encryptPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, bcrypt_1.hash)(password, 10);
});
exports.encryptPassword = encryptPassword;
const comparePassword = (hash, password) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, bcrypt_1.compare)(hash, password);
});
exports.comparePassword = comparePassword;
const checkMachineOwner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let machine = yield models_1.MachineModel.findOne({ owner: req.user._id, _id: req.query.id });
        if (!machine)
            return res.status(404).send('this machin is not your');
        else {
            req.machine = machine;
            next();
        }
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.checkMachineOwner = checkMachineOwner;
const ismachineOnline = (req, res, next) => {
    if (!req.machine.status)
        return res.status(400).send('machine is offline');
    else
        next();
};
exports.ismachineOnline = ismachineOnline;
const getSocketWithMachineId = (req, res, next) => {
    let index = -1;
    io_server_1.connectedSockets.filter((value, i) => {
        if (value.id == req.machine._id) {
            index = i;
        }
    });
    console.log(index);
    if (index > -1) {
        console.log('here');
        req.channel = io_server_1.connectedSockets[index].socket;
        next();
    }
    else
        return res.status(404).send('this machine is not connected');
};
exports.getSocketWithMachineId = getSocketWithMachineId;
//# sourceMappingURL=middlewares.js.map