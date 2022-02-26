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
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutAllDevices = exports.logoutSingleDevice = exports.getLoginDevicesList = exports.logout = exports.profile = exports.signup = exports.login = void 0;
const middlewares_1 = require("../middlewares");
const models_1 = require("../models");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const user = yield models_1.User.findOne({ $or: [{ username }, { email: username }] }).select(['-token']);
        if (!user)
            return res.status(404).send('username or email invalid');
        if (!(0, middlewares_1.comparePassword)(user.password, password))
            return res.status(400).send('invalid credentials');
        const jwtToken = (0, middlewares_1.generateJwtToken)({ id: user._id });
        yield models_1.User.findByIdAndUpdate(user._id, { $addToSet: { token: jwtToken } });
        return res.send({ jwtToken, user });
    }
    catch (error) {
        return res.status(500).send(error.message);
    }
});
exports.login = login;
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, username, email, password } = req.body;
    try {
        const isUserExists = yield models_1.User.findOne({ $or: [{ username }, { email }] });
        if (isUserExists)
            return res.status(400).send('user with username or email already exists');
        const encryptedPassword = yield (0, middlewares_1.encryptPassword)(password);
        const user = yield models_1.User.create({ name, username, email, password: encryptedPassword, token: [] });
        const jwtToken = (0, middlewares_1.generateJwtToken)({ id: user._id });
        user.token.push(jwtToken);
        yield user.save();
        return res.status(201).send({ jwtToken, user });
    }
    catch (error) {
        yield models_1.User.findOneAndRemove({ username });
        return res.status(500).send(error.message);
    }
});
exports.signup = signup;
const profile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).send({ user: req.user });
});
exports.profile = profile;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield models_1.User.findById(req.user._id);
        let headers = req.headers;
        const token = (0, middlewares_1.parseAuthorizationToken)(headers.authorization);
        const isAllSession = req.query.allSession;
        if (isAllSession)
            user.token = [];
        else
            user.token = user.token.filter((t) => t !== token);
        yield user.save();
        return res.send('logged out');
    }
    catch (error) {
        return res.status(500).send(error.message);
    }
});
exports.logout = logout;
const getLoginDevicesList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).send({ token: req.user.token, length: req.user.token.length });
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.getLoginDevicesList = getLoginDevicesList;
const logoutSingleDevice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { token } = req.body;
        if (!req.user.token.includes(token))
            return res.status(404).send("this is not your token");
        else {
            let tok = [];
            req.user.token.forEach((e) => {
                if (e != token)
                    tok.push(e);
            });
            req.user.token = tok;
            yield req.user.save();
            return res.status(200).send("Device removed");
        }
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.logoutSingleDevice = logoutSingleDevice;
const logoutAllDevices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let nTok = [];
        req.user.token.forEach((e) => {
            if (e == req.token)
                nTok.push(e);
        });
        req.user.token = nTok;
        yield req.user.save();
        return res.status(200).send("logged out all session");
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.logoutAllDevices = logoutAllDevices;
//# sourceMappingURL=user_api.js.map