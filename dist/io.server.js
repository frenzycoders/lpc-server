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
exports.deleteMachineFormOnline = exports.getConnectedMachineWithUsername = exports.getConnectedMachine = exports.pushConnectedMachines = exports.connectedSockets = exports.io = exports.app = void 0;
const socket_io_1 = require("socket.io");
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
const http_1 = require("http");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const api_1 = require("./api");
const mongoose_1 = __importDefault(require("mongoose"));
const models_1 = require("./models");
const express_fileupload_1 = __importDefault(require("express-fileupload"));
(0, dotenv_1.config)({ path: path_1.default.join(__dirname + '/.env') });
exports.app = (0, express_1.default)();
const server = (0, http_1.createServer)(exports.app);
exports.app.use((0, express_fileupload_1.default)());
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json({ limit: '300mb' }));
exports.app.use(express_1.default.urlencoded({ extended: true }));
const PORT = 4321;
const API_SERVER_PORT = 5432;
exports.io = new socket_io_1.Server({ maxHttpBufferSize: 4e+8 });
exports.connectedSockets = [];
const pushConnectedMachines = (headers, socketId, socket) => __awaiter(void 0, void 0, void 0, function* () {
    if (headers.usertype == "Machine" && headers.id != 'empty' && mongoose_1.default.Types.ObjectId.isValid(headers.id)) {
        exports.connectedSockets.push({ id: headers.id, socket: socket, socketId: socketId });
        // console.log(connectedSockets);
        let machine = yield models_1.MachineModel.findOneAndUpdate({ _id: headers.id }, {
            socketId: socketId,
            status: true,
        }, {
            new: true
        });
        // console.log("from line 45: ", machine);
    }
});
exports.pushConnectedMachines = pushConnectedMachines;
const getConnectedMachine = (socketId) => __awaiter(void 0, void 0, void 0, function* () {
    let machine = yield models_1.MachineModel.findOne({ socketId });
    if (machine)
        return { status: true, machine };
    else
        return { status: false, machine: null };
});
exports.getConnectedMachine = getConnectedMachine;
const getConnectedMachineWithUsername = (id) => __awaiter(void 0, void 0, void 0, function* () {
    let machine = yield models_1.MachineModel.findById(id);
    if (machine)
        return { status: true, machine };
    else
        return { status: false, machine: null };
});
exports.getConnectedMachineWithUsername = getConnectedMachineWithUsername;
const deleteMachineFormOnline = (socketid) => __awaiter(void 0, void 0, void 0, function* () {
    exports.connectedSockets = exports.connectedSockets.filter((value) => {
        if (value.socketId != socketid)
            return value;
    });
    // console.log(connectedSockets.length);
    let data = yield models_1.MachineModel.findOneAndUpdate({ socketId: socketid }, { status: false }, { new: true });
    return data;
});
exports.deleteMachineFormOnline = deleteMachineFormOnline;
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect('mongodb://localhost/other');
        console.log('database connection status : true');
        exports.io.listen(PORT);
        console.log('io server is up and running on port : ' + PORT);
        server.listen(API_SERVER_PORT, () => {
            console.log('api server is up and running on port : ' + API_SERVER_PORT);
        });
        yield (0, api_1.apiService)(exports.app);
    }
    catch (error) {
        console.log('database connection error ', error);
        process.exit(0);
    }
});
main();
//# sourceMappingURL=io.server.js.map