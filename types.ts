import { Socket } from 'socket.io';

export type Machine = { socketId: string; username: any; name: any; password: any; status: Boolean };
export type User = { socketId: string; name: any; musername: string };
export type SysDetails = {
    operatingSys: string;
    hostName: string;
    platform: string;
    ostype: string;
    release: string;
    arch: string;
    homeDir: string;
    version: string;
}

export type userSocket = {
    id: string;
    socket: Socket;
    socketId: string;
}

