import { Application } from 'express'
import { checkMachineOwner, downloadAuthenticated,getSocketWithMachineId, isAuthenticated, ismachineOnline } from './middlewares';
import { getLoginDevicesList, login, logout, logoutAllDevices, logoutSingleDevice, profile, signup } from './api/user_api';
import { createMachine, deleteFiles, delMachine, downloadEntity, getMachines, getSystemDetails, publicDownload, readDirs, uploadEntity, uploadPublic } from './api/machine_api';
import { deleteMachineFormOnline, io, pushConnectedMachines } from './io.server';
import { createSharedLink, createUploadLinks, deleteSharedLinks, deleteUploadLinks, getSharedLinks, getUploadLinks, updateSharedLinks, updateUploadLinks, validateUploadlinks } from './api/links_api';
import { createScreenCastLink, deleteScreenCastLink, getPublicScreenImage, getScreenCastLinks, getScreenImage, publicScreenCastDetails, updateScreencastLinks } from './api/screen_cast_api';

export const apiService = async (app: Application) => {
    io.on('connect', (Socket) => {
        console.log('Machine id : => [ ' + Socket.handshake.headers.id + ' ] is Connected with socket id: => [ ' + Socket.id + ' ]');

        Socket.emit('myid', { socketId: Socket.id, machineId: Socket.handshake.headers.id });
        pushConnectedMachines(Socket.handshake.headers, Socket.id, Socket);
        Socket.on('disconnect', async (data: any) => {
            Socket.removeAllListeners();
            console.log('user disconnected');
            await deleteMachineFormOnline(Socket.id)
        })
        Socket.on('error', () => {
            console.log('error');
        })
    })

    //user-api---------
    app.post('/login', login);
    app.post('/signup', signup);
    app.get('/profile', isAuthenticated, profile);
    app.delete('/logout', isAuthenticated, logout);

    //machine-api.........
    app.post('/machine', isAuthenticated, createMachine);
    app.get('/machine', isAuthenticated, getMachines);
    app.delete('/machine', isAuthenticated, checkMachineOwner, delMachine);

    app.get('/read', isAuthenticated, checkMachineOwner, ismachineOnline, getSocketWithMachineId, readDirs);
    app.delete('/delete', isAuthenticated, checkMachineOwner, ismachineOnline, getSocketWithMachineId, deleteFiles);
    app.post('/upload', isAuthenticated, checkMachineOwner, ismachineOnline, getSocketWithMachineId, uploadEntity);
    app.get('/download', downloadAuthenticated, checkMachineOwner, ismachineOnline, getSocketWithMachineId, downloadEntity);
    app.post('/shared-link', isAuthenticated, checkMachineOwner, ismachineOnline, getSocketWithMachineId, createSharedLink);
    app.put('/shared-link', isAuthenticated, updateSharedLinks);
    app.get('/shared-link', isAuthenticated, checkMachineOwner, ismachineOnline, getSharedLinks);
    app.delete('/shared-link', isAuthenticated, deleteSharedLinks);
    app.get('/public/download', publicDownload);
    app.get('/get-sysdetails', isAuthenticated, checkMachineOwner, ismachineOnline, getSocketWithMachineId, getSystemDetails);



    app.get('/login', isAuthenticated, getLoginDevicesList);
    app.delete('/token', isAuthenticated, logoutSingleDevice);
    app.delete('/token-all', isAuthenticated, logoutAllDevices);


    //Upload links--------------
    app.get('/upload-links', isAuthenticated, checkMachineOwner, ismachineOnline, getUploadLinks);
    app.post('/upload-links', isAuthenticated, checkMachineOwner, ismachineOnline, createUploadLinks);
    app.delete('/upload-links', isAuthenticated, checkMachineOwner, ismachineOnline, deleteUploadLinks);
    app.put('/upload-links', isAuthenticated, checkMachineOwner, ismachineOnline, updateUploadLinks);
    app.post('/upload/public', uploadPublic);
    app.get('/upload/public', validateUploadlinks);
    app.get('/screen-share', isAuthenticated, checkMachineOwner, ismachineOnline, getScreenImage);
    app.post('/screen-share-links', isAuthenticated, checkMachineOwner, ismachineOnline, createScreenCastLink);
    app.get('/screen-share-links', isAuthenticated, checkMachineOwner, ismachineOnline, getScreenCastLinks)
    app.delete('/screen-share-links', isAuthenticated, checkMachineOwner, ismachineOnline, deleteScreenCastLink);
    app.put('/screen-share-links', isAuthenticated, checkMachineOwner, ismachineOnline, updateScreencastLinks);
    app.get('/public/screen-share-links', getPublicScreenImage);
    app.get('/public/screen-share-details', publicScreenCastDetails);
}

