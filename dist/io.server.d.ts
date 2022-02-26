import { Server, Socket } from "socket.io";
import { Machine, userSocket } from "./types";
declare global {
    namespace Express {
        interface Request {
            user: any;
            machine: any;
            file: any;
            token: string;
            channel: Socket;
        }
    }
}
export declare const app: import("express-serve-static-core").Express;
export declare const io: Server<import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, any>;
export declare let connectedSockets: userSocket[];
export declare const pushConnectedMachines: (headers: any, socketId: string, socket: Socket) => Promise<void>;
export declare const getConnectedMachine: (socketId: string) => Promise<{
    status: boolean;
    machine: Machine;
} | {
    status: boolean;
    machine: null;
}>;
export declare const getConnectedMachineWithUsername: (id: string) => Promise<{
    status: boolean;
    machine: Machine;
} | {
    status: boolean;
    machine: null;
}>;
export declare const deleteMachineFormOnline: (socketid: string) => Promise<Machine>;
