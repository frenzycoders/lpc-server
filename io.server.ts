import { Server, Socket } from "socket.io";
import { config } from "dotenv";
import path from "path";
import { Machine, User, userSocket } from "./types";
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { apiService } from "./api";
import mongoose from 'mongoose';
import { MachineModel } from "./models";
import upload from 'express-fileupload';


declare global {
    namespace Express {
        interface Request {
            user: any,
            machine: any
            file: any,
            token: string,
            channel: Socket
        }
    }
}

config({ path: path.join(__dirname + '/.env') });
export const app = express();
const server = createServer(app);

app.use(upload());
app.use(cors());
app.use(express.json({ limit: '300mb' }));
app.use(express.urlencoded({ extended: true }));

const PORT = 4321
const API_SERVER_PORT = 5432;

export const io = new Server({ maxHttpBufferSize: 4e+8 });

export let connectedSockets: userSocket[] = [];

export const pushConnectedMachines = async (headers: any, socketId: string, socket: Socket) => {
    if (headers.usertype == "Machine" && headers.id != 'empty' && mongoose.Types.ObjectId.isValid(headers.id)) {
        connectedSockets.push({ id: headers.id, socket: socket, socketId: socketId });
        // console.log(connectedSockets);

        let machine: Machine = await MachineModel.findOneAndUpdate({ _id: headers.id }, {
            socketId: socketId,
            status: true,
        }, {
            new: true
        });
        // console.log("from line 45: ", machine);
    }
}

export const getConnectedMachine = async (socketId: string) => {
    let machine: Machine = await MachineModel.findOne({ socketId });
    if (machine) return { status: true, machine };
    else return { status: false, machine: null };
}

export const getConnectedMachineWithUsername = async (id: string) => {
    let machine: Machine = await MachineModel.findById(id);
    if (machine) return { status: true, machine };
    else return { status: false, machine: null };
}

export const deleteMachineFormOnline = async (socketid: string) => {
    connectedSockets = connectedSockets.filter((value) => {
        if (value.socketId != socketid) return value;
    })
    // console.log(connectedSockets.length);
    let data: Machine = await MachineModel.findOneAndUpdate({ socketId: socketid }, { status: false }, { new: true });
    return data;
}



const main = async () => {
    try {
        await mongoose.connect('mongodb://localhost/other');
        console.log('database connection status : true');
        io.listen(PORT);
        console.log('io server is up and running on port : ' + PORT);
        server.listen(API_SERVER_PORT, () => {
            console.log('api server is up and running on port : ' + API_SERVER_PORT);
        })

        await apiService(app);
    } catch (error) {
        console.log('database connection error ', error);
        process.exit(0);
    }
}


main();

