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
exports.apiService = void 0;
const middlewares_1 = require("./middlewares");
const user_api_1 = require("./api/user_api");
const machine_api_1 = require("./api/machine_api");
const io_server_1 = require("./io.server");
const links_api_1 = require("./api/links_api");
const screen_cast_api_1 = require("./api/screen_cast_api");
const apiService = (app) => __awaiter(void 0, void 0, void 0, function* () {
    io_server_1.io.on('connect', (Socket) => {
        console.log('Machine id : => [ ' + Socket.handshake.headers.id + ' ] is Connected with socket id: => [ ' + Socket.id + ' ]');
        Socket.emit('myid', { socketId: Socket.id, machineId: Socket.handshake.headers.id });
        (0, io_server_1.pushConnectedMachines)(Socket.handshake.headers, Socket.id, Socket);
        Socket.on('disconnect', (data) => __awaiter(void 0, void 0, void 0, function* () {
            Socket.removeAllListeners();
            console.log('user disconnected');
            yield (0, io_server_1.deleteMachineFormOnline)(Socket.id);
        }));
        Socket.on('error', () => {
            console.log('error');
        });
    });
    //user-api---------
    app.post('/login', user_api_1.login);
    app.post('/signup', user_api_1.signup);
    app.get('/profile', middlewares_1.isAuthenticated, user_api_1.profile);
    app.delete('/logout', middlewares_1.isAuthenticated, user_api_1.logout);
    //machine-api.........
    app.post('/machine', middlewares_1.isAuthenticated, machine_api_1.createMachine);
    app.get('/machine', middlewares_1.isAuthenticated, machine_api_1.getMachines);
    app.delete('/machine', middlewares_1.isAuthenticated, middlewares_1.checkMachineOwner, machine_api_1.delMachine);
    app.get('/read', middlewares_1.isAuthenticated, middlewares_1.checkMachineOwner, middlewares_1.ismachineOnline, middlewares_1.getSocketWithMachineId, machine_api_1.readDirs);
    app.delete('/delete', middlewares_1.isAuthenticated, middlewares_1.checkMachineOwner, middlewares_1.ismachineOnline, middlewares_1.getSocketWithMachineId, machine_api_1.deleteFiles);
    app.post('/upload', middlewares_1.isAuthenticated, middlewares_1.checkMachineOwner, middlewares_1.ismachineOnline, middlewares_1.getSocketWithMachineId, machine_api_1.uploadEntity);
    app.get('/download', middlewares_1.downloadAuthenticated, middlewares_1.checkMachineOwner, middlewares_1.ismachineOnline, middlewares_1.getSocketWithMachineId, machine_api_1.downloadEntity);
    app.post('/shared-link', middlewares_1.isAuthenticated, middlewares_1.checkMachineOwner, middlewares_1.ismachineOnline, middlewares_1.getSocketWithMachineId, links_api_1.createSharedLink);
    app.put('/shared-link', middlewares_1.isAuthenticated, links_api_1.updateSharedLinks);
    app.get('/shared-link', middlewares_1.isAuthenticated, middlewares_1.checkMachineOwner, middlewares_1.ismachineOnline, links_api_1.getSharedLinks);
    app.delete('/shared-link', middlewares_1.isAuthenticated, links_api_1.deleteSharedLinks);
    app.get('/public/download', machine_api_1.publicDownload);
    app.get('/get-sysdetails', middlewares_1.isAuthenticated, middlewares_1.checkMachineOwner, middlewares_1.ismachineOnline, middlewares_1.getSocketWithMachineId, machine_api_1.getSystemDetails);
    app.get('/login', middlewares_1.isAuthenticated, user_api_1.getLoginDevicesList);
    app.delete('/token', middlewares_1.isAuthenticated, user_api_1.logoutSingleDevice);
    app.delete('/token-all', middlewares_1.isAuthenticated, user_api_1.logoutAllDevices);
    //Upload links--------------
    app.get('/upload-links', middlewares_1.isAuthenticated, middlewares_1.checkMachineOwner, middlewares_1.ismachineOnline, links_api_1.getUploadLinks);
    app.post('/upload-links', middlewares_1.isAuthenticated, middlewares_1.checkMachineOwner, middlewares_1.ismachineOnline, links_api_1.createUploadLinks);
    app.delete('/upload-links', middlewares_1.isAuthenticated, middlewares_1.checkMachineOwner, middlewares_1.ismachineOnline, links_api_1.deleteUploadLinks);
    app.put('/upload-links', middlewares_1.isAuthenticated, middlewares_1.checkMachineOwner, middlewares_1.ismachineOnline, links_api_1.updateUploadLinks);
    app.post('/upload/public', machine_api_1.uploadPublic);
    app.get('/upload/public', links_api_1.validateUploadlinks);
    app.get('/screen-share', middlewares_1.isAuthenticated, middlewares_1.checkMachineOwner, middlewares_1.ismachineOnline, screen_cast_api_1.getScreenImage);
    app.post('/screen-share-links', middlewares_1.isAuthenticated, middlewares_1.checkMachineOwner, middlewares_1.ismachineOnline, screen_cast_api_1.createScreenCastLink);
    app.get('/screen-share-links', middlewares_1.isAuthenticated, middlewares_1.checkMachineOwner, middlewares_1.ismachineOnline, screen_cast_api_1.getScreenCastLinks);
    app.delete('/screen-share-links', middlewares_1.isAuthenticated, middlewares_1.checkMachineOwner, middlewares_1.ismachineOnline, screen_cast_api_1.deleteScreenCastLink);
    app.put('/screen-share-links', middlewares_1.isAuthenticated, middlewares_1.checkMachineOwner, middlewares_1.ismachineOnline, screen_cast_api_1.updateScreencastLinks);
    app.get('/public/screen-share-links', screen_cast_api_1.getPublicScreenImage);
    app.get('/public/screen-share-details', screen_cast_api_1.publicScreenCastDetails);
});
exports.apiService = apiService;
//# sourceMappingURL=api.js.map