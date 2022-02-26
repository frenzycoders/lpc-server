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
exports.getSystemDetails = exports.uploadPublic = exports.publicDownload = exports.downloadEntity = exports.uploadEntity = exports.deleteFiles = exports.readDirs = exports.delMachine = exports.getMachines = exports.createMachine = void 0;
const io_server_1 = require("../io.server");
const models_1 = require("../models");
const fs_1 = require("fs");
const createMachine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { name } = req.body;
        let machine = yield models_1.MachineModel.create({ name, owner: req.user._id });
        res.status(200).send(machine);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.createMachine = createMachine;
const getMachines = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { id } = req.query;
        let machine;
        if (id)
            machine = yield models_1.MachineModel.find({ _id: id });
        else
            machine = yield models_1.MachineModel.find({ owner: req.user._id });
        res.status(200).send({ machine: machine });
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.getMachines = getMachines;
const delMachine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield models_1.MachineModel.deleteOne({ _id: req.machine._id });
        res.status(200).send('Machine Deleted successfully');
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.delMachine = delMachine;
const readDirs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let path = req.query.path || '/';
        let time = Date.now();
        io_server_1.io.to(req.machine.socketId).emit('READ_DIR', { path, mid: req.machine._id + time, hidden: req.query.hidden || false });
        req.channel.once(req.machine._id + time, (data) => {
            if (data.status)
                return res.status(200).send(data);
            else
                return res.status(400).send(data.message);
        });
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.readDirs = readDirs;
const deleteFiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { path } = req.query;
        let time = Date.now();
        let callBack = 'DELETE_RESPONSE' + time;
        io_server_1.io.to(req.machine.socketId).emit('DELETE_FILE_REQUEST', { cb: callBack, path });
        req.channel.once(callBack, ({ status, path, message }) => __awaiter(void 0, void 0, void 0, function* () {
            if (status == false)
                return res.status(400).send(message + " [ " + path + " ]");
            else
                return res.status(200).send(message + " [ " + path + " ]");
        }));
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.deleteFiles = deleteFiles;
const uploadEntity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let path = req.query.path || '/';
        let time = Date.now();
        let cb = 'RESPONSE_FROM_FILE_UPLOAD' + time + req.user._id;
        let crSTream = 'CREATED_READ_STREAM' + time + req.user._id;
        if (!req.files)
            return res.status(404).send('Please attach files');
        let f = req.files.file;
        fs_1.promises.mkdir('./upload' + time, { recursive: true });
        f.mv('./upload' + time + '/' + f.name);
        io_server_1.io.to(req.machine.socketId).emit('RECIEVE_FILES', { filename: f.name, cb: crSTream, resId: cb, path: path });
        req.channel.once(crSTream, ({ id }) => __awaiter(void 0, void 0, void 0, function* () {
            let stream = (0, fs_1.createReadStream)('./upload' + time + '/' + f.name);
            stream.on('data', (data) => {
                io_server_1.io.to(req.machine.socketId).emit(id, { data: data, cb });
            });
            stream.on('close', () => {
                stream.close();
                io_server_1.io.to(req.machine.socketId).emit(id, { status: true, cb });
            });
            stream.on('error', (error) => {
                console.log('error');
                io_server_1.io.to(req.machine.socketId).emit(id, { status: false, cb, error: error });
            });
        }));
        req.channel.once(cb, ({ status, path, filename, message }) => __awaiter(void 0, void 0, void 0, function* () {
            yield fs_1.promises.rm('./upload' + time, { recursive: true });
            if (status)
                return res.status(200).send(message);
            else
                return res.status(400).send(message);
        }));
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.uploadEntity = uploadEntity;
const downloadEntity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let time = Date.now();
        let fileStream;
        if (!req.query.path)
            return res.status(404).send('pleas add file path');
        req.channel.once('CREATE_WRITE_STREAM' + time, (data) => __awaiter(void 0, void 0, void 0, function* () {
            console.log('Created wite stream');
            yield fs_1.promises.mkdir('./' + time);
            fileStream = (0, fs_1.createWriteStream)(`./${time}/${data.filename}`);
            io_server_1.io.to(req.machine.socketId).emit('START' + data.data.mid, data.data);
        }));
        io_server_1.io.to(req.machine.socketId).emit('DOWNLOAD_FILE_REQUEST', { mid: req.machine._id + time, wid: 'CREATE_WRITE_STREAM' + time, path: req.query.path });
        req.channel.on(req.machine._id + time, (data) => {
            console.log(data);
            if (data.error) {
                fileStream.close();
                return res.status(400).send(data.errorData.toString());
            }
            else if (data.end) {
                fileStream.close();
                console.log('executed');
                return res.download('./' + time + '/' + data.filename, (err) => __awaiter(void 0, void 0, void 0, function* () {
                    req.channel.removeAllListeners(req.machine._id + time);
                    try {
                        yield fs_1.promises.rm(`./${time}`, {
                            recursive: true,
                        });
                    }
                    catch (error) {
                        console.log('error');
                    }
                }));
            }
            else if (!data.status) {
                return res.status(404).send('File not found');
            }
            else {
                fileStream.write(data.data);
            }
        });
    }
    catch (error) {
        res.status(500).send('server error');
    }
});
exports.downloadEntity = downloadEntity;
const publicDownload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sid } = req.query;
        if (!sid)
            return res.status(404).send("Shared link id not found in query");
        else {
            let s = yield models_1.SharedLink.findById(sid);
            let machine = yield models_1.MachineModel.findById(s.mid);
            if (!machine)
                return res.status(200).send("Machine not found");
            if (!machine.status)
                return res.status(400).send("Machine is offline try again");
            if (!s.status)
                return res.status(200).send("This link is deactivated by owner");
            else {
                let channel;
                let index = -1;
                io_server_1.connectedSockets.filter((value, i) => {
                    if (value.id == machine._id) {
                        index = i;
                    }
                });
                if (index > -1) {
                    console.log('here');
                    channel = io_server_1.connectedSockets[index].socket;
                }
                else
                    return res.status(404).send('this machine is not connected');
                let time = Date.now();
                let fileStream;
                channel.once('CREATE_WRITE_STREAM' + time, (data) => __awaiter(void 0, void 0, void 0, function* () {
                    console.log('Created wite stream');
                    yield fs_1.promises.mkdir('./' + time);
                    fileStream = (0, fs_1.createWriteStream)(`./${time}/${data.filename}`);
                    io_server_1.io.to(machine.socketId).emit('START' + data.data.mid, data.data);
                }));
                io_server_1.io.to(channel.id).emit('DOWNLOAD_FILE_REQUEST', { mid: machine._id + time, wid: 'CREATE_WRITE_STREAM' + time, path: s.contentPath });
                channel.on(machine._id + time, (data) => {
                    console.log(data);
                    if (data.error) {
                        fileStream.close();
                        return res.status(400).send(data.errorData.toString());
                    }
                    else if (data.end) {
                        fileStream.close();
                        console.log('executed');
                        return res.download('./' + time + '/' + data.filename, (err) => __awaiter(void 0, void 0, void 0, function* () {
                            channel.removeAllListeners(machine._id + time);
                            try {
                                yield fs_1.promises.rm(`./${time}`, {
                                    recursive: true,
                                });
                            }
                            catch (error) {
                                console.log('error');
                            }
                        }));
                    }
                    else if (!data.status) {
                        return res.status(404).send('File not found');
                    }
                    else {
                        fileStream.write(data.data);
                    }
                });
            }
        }
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.publicDownload = publicDownload;
const uploadPublic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { uid } = req.query;
        if (!uid)
            return res.status(404).send("uid not found in query");
        let uLinks = yield models_1.UploadLink.findById(uid).populate("mid");
        if (!uLinks)
            return res.status(404).send("Upload link not found");
        if (!uLinks.status)
            return res.status(400).send("Upload link was deactivate by user");
        if (!uLinks.mid.status)
            return res.status(400).send("Machine is offline");
        let channel;
        let index = -1;
        io_server_1.connectedSockets.filter((value, i) => {
            if (value.id == uLinks.mid._id) {
                index = i;
            }
        });
        if (index > -1) {
            console.log('here');
            channel = io_server_1.connectedSockets[index].socket;
        }
        else
            return res.status(404).send('this machine is not connected');
        let path = uLinks.contentPath;
        let time = Date.now();
        let cb = 'RESPONSE_FROM_FILE_UPLOAD' + time + uLinks._id;
        let crSTream = 'CREATED_READ_STREAM' + time + uLinks._id;
        if (!req.files)
            return res.status(404).send('Please attach files');
        let f = req.files.file;
        if (f.size / (1024 * 1024) > parseInt(uLinks.fileSize.split(' ')[0]))
            return res.status(400).send("this file is greater then expacted file size");
        fs_1.promises.mkdir('./upload' + time, { recursive: true });
        f.mv('./upload' + time + '/' + f.name);
        io_server_1.io.to(uLinks.mid.socketId).emit('RECIEVE_FILES', { filename: f.name, cb: crSTream, resId: cb, path: path });
        channel.once(crSTream, ({ id }) => __awaiter(void 0, void 0, void 0, function* () {
            let stream = (0, fs_1.createReadStream)('./upload' + time + '/' + f.name);
            stream.on('data', (data) => {
                io_server_1.io.to(uLinks.mid.socketId).emit(id, { data: data, cb });
            });
            stream.on('close', () => {
                stream.close();
                io_server_1.io.to(uLinks.mid.socketId).emit(id, { status: true, cb });
            });
            stream.on('error', (error) => {
                console.log('error');
                io_server_1.io.to(uLinks.mid.socketId).emit(id, { status: false, cb, error: error });
            });
        }));
        channel.once(cb, ({ status, path, filename, message }) => __awaiter(void 0, void 0, void 0, function* () {
            yield fs_1.promises.rm('./upload' + time, { recursive: true });
            if (status) {
                uLinks.uploadedFileName = f.name;
                if (uLinks.oneUse) {
                    uLinks.status = false;
                }
                yield uLinks.save();
                return res.status(200).send(message);
            }
            else
                return res.status(400).send(message);
        }));
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.uploadPublic = uploadPublic;
const getSystemDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let time = Date.now();
        io_server_1.io.to(req.machine.socketId).emit('SYSTEM_DETAILS', req.machine._id + time);
        req.channel.once(req.machine.id + time, (data) => {
            res.status(200).send(data);
        });
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.getSystemDetails = getSystemDetails;
//# sourceMappingURL=machine_api.js.map