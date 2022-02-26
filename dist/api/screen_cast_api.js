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
exports.publicScreenCastDetails = exports.getPublicScreenImage = exports.updateScreencastLinks = exports.deleteScreenCastLink = exports.getScreenCastLinks = exports.createScreenCastLink = exports.getScreenImage = void 0;
const io_server_1 = require("../io.server");
const models_1 = require("../models");
const getScreenImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let time = Date.now();
        let cb = 'RESPONSE_SCREEN_SHOT' + time;
        io_server_1.io.to(req.machine.socketId).emit('REQUEST_FROM_SCREEN_SHOT', { id: cb });
        req.channel.once(cb, (data) => {
            return res.status(200).send(data);
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
});
exports.getScreenImage = getScreenImage;
const createScreenCastLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { title } = req.body;
        let screen = yield models_1.ScreenStream.create({ mid: req.machine._id, userId: req.user._id, title, });
        req.user.streamLinks.push(screen._id);
        yield req.user.save();
        res.status(200).send(screen);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.createScreenCastLink = createScreenCastLink;
const getScreenCastLinks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let screens = yield models_1.ScreenStream.find({ mid: req.machine._id, userId: req.user._id });
        res.status(200).send({ screens, length: screens.length });
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.getScreenCastLinks = getScreenCastLinks;
const deleteScreenCastLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { screen } = req.query;
        if (!screen)
            return res.status(404).send("screen id not found in query");
        if (!req.user.streamLinks.includes(screen))
            return res.status(404).send("This link is not yours");
        yield models_1.ScreenStream.findByIdAndDelete(screen);
        req.user.streamLinks.pop(screen);
        yield req.user.save();
        res.status(200).send("Screen share link was deleted");
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.deleteScreenCastLink = deleteScreenCastLink;
const updateScreencastLinks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { screen } = req.query;
        if (!screen)
            return res.status(404).send("screen id not found in query");
        if (!req.user.streamLinks.includes(screen))
            return res.status(404).send("this screen share link is not yours");
        let src = yield models_1.ScreenStream.findByIdAndUpdate(screen, req.body, { new: true });
        res.status(200).send({ screen: src });
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.updateScreencastLinks = updateScreencastLinks;
const getPublicScreenImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { screen } = req.query;
        let src = yield models_1.ScreenStream.findById(screen).populate("mid");
        if (!src)
            return res.status(404).send("Invalid screen id in query");
        if (!src.status)
            return res.status(400).send("Link is deactivated by owner");
        if (src.mid.status == false)
            return res.status(400).send("Machine is offline please try again");
        let time = Date.now();
        let cb = 'RESPONSE_SCREEN_SHOT' + time;
        io_server_1.io.to(src.mid.socketId).emit('REQUEST_FROM_SCREEN_SHOT', { id: cb });
        req.channel.once(cb, (data) => {
            return res.status(200).send(data);
        });
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.getPublicScreenImage = getPublicScreenImage;
const publicScreenCastDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { screen } = req.query;
        let src = yield models_1.ScreenStream.findById(screen).populate("mid");
        console.log(src);
        if (!src)
            return res.status(404).send("Invalid screen id in query");
        if (!src.status)
            return res.status(400).send("Link is deactivated by owner");
        if (src.mid.status == false)
            return res.status(400).send("Machine is offline please try again");
        res.status(200).send(src);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.publicScreenCastDetails = publicScreenCastDetails;
//# sourceMappingURL=screen_cast_api.js.map