import { Socket } from 'socket.io';
export declare type Machine = {
    socketId: string;
    username: any;
    name: any;
    password: any;
    status: Boolean;
};
export declare type User = {
    socketId: string;
    name: any;
    musername: string;
};
export declare type SysDetails = {
    operatingSys: string;
    hostName: string;
    platform: string;
    ostype: string;
    release: string;
    arch: string;
    homeDir: string;
    version: string;
};
export declare type userSocket = {
    id: string;
    socket: Socket;
    socketId: string;
};
