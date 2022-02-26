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
exports.validateUploadlinks = exports.updateUploadLinks = exports.deleteUploadLinks = exports.getUploadLinks = exports.createUploadLinks = exports.deleteSharedLinks = exports.getSharedLinks = exports.updateSharedLinks = exports.createSharedLink = void 0;
const models_1 = require("../models");
const createSharedLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { contentPath } = req.query;
        if (!contentPath)
            return res.status(404).send("Please add contentPath ");
        else {
            let sharedLink = yield models_1.SharedLink.create({ mid: req.machine._id, userId: req.user._id, contentPath, });
            req.user.publicLinks.push(sharedLink._id);
            yield req.user.save();
            return res.status(200).send(sharedLink);
        }
    }
    catch (error) {
        res.status(500).send(error.message.toString());
    }
});
exports.createSharedLink = createSharedLink;
const updateSharedLinks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { status, sid } = req.body;
        if (!sid)
            return res.status(404).send("link id and status not found in body");
        let s = yield models_1.SharedLink.findById(sid);
        if (req.user._id.toString() == s.userId.toString()) {
            s.status = status;
            yield s.save();
            return res.status(200).send(s);
        }
        else
            res.status(400).send("this link is not your");
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.updateSharedLinks = updateSharedLinks;
const getSharedLinks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let sharedLinks = yield models_1.SharedLink.find({ mid: req.machine._id });
        res.status(200).send(sharedLinks);
    }
    catch (error) {
        res.status(500).send(error.message.toString());
    }
});
exports.getSharedLinks = getSharedLinks;
const deleteSharedLinks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sid } = req.query;
        if (!sid)
            return res.status(404).send("Shared link id not found in query");
        else {
            if (req.user.publicLinks.includes(sid)) {
                yield models_1.SharedLink.findByIdAndDelete(sid);
                req.user.publicLinks.pop(sid);
                yield req.user.save();
                return res.status(200).send("Deleted");
            }
            return res.status(400).send("This shared link is not your");
        }
    }
    catch (error) {
        res.status(500).send(error.message.toString());
    }
});
exports.deleteSharedLinks = deleteSharedLinks;
const createUploadLinks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { title, contentPath, oneUse, fileSize, } = req.body;
        let link = yield models_1.UploadLink.create({ mid: req.machine._id, userId: req.user._id, title, contentPath, oneUse, fileSize });
        req.user.uploadLinks.push(link._id);
        yield req.user.save();
        res.status(200).send(link);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.createUploadLinks = createUploadLinks;
const getUploadLinks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.user);
        let links = yield models_1.UploadLink.find({ mid: req.machine._id });
        res.status(200).send({ links, length: links.length });
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.getUploadLinks = getUploadLinks;
const deleteUploadLinks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { uid } = req.query;
        if (!uid)
            return res.status(404).send("uid not found in query");
        if (!req.user.uploadLinks.includes(uid))
            return res.status(404).send("This link is not yours");
        yield models_1.UploadLink.deleteOne({ _id: uid, mid: req.machine._id });
        req.user.uploadLinks.pop(uid);
        yield req.user.save();
        res.status(200).send("upload link was Deleted");
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.deleteUploadLinks = deleteUploadLinks;
const updateUploadLinks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { uid } = req.query;
        if (!uid)
            return res.status(404).send("uid not found in query");
        if (!req.user.uploadLinks.includes(uid))
            return res.status(404).send("This upload link is not yours");
        let link = yield models_1.UploadLink.findByIdAndUpdate(uid, req.body, { new: true });
        res.status(200).send(link);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.updateUploadLinks = updateUploadLinks;
const validateUploadlinks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { uid } = req.query;
        if (!uid)
            return res.status(404).send("uid not found in query");
        let Ulink = yield models_1.UploadLink.findById(uid).populate('mid');
        if (!Ulink)
            return res.status(404).send("This link was expire");
        if (!Ulink.status)
            return res.status(400).send("This link was deactivate by owner");
        if (Ulink.mid.status == false)
            return res.status(404).send("Machine is not online please try again");
        res.status(200).send({ uLink: Ulink });
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.validateUploadlinks = validateUploadlinks;
//# sourceMappingURL=links_api.js.map