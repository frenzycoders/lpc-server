import { Request, Response } from "express";
import { connectedSockets, io } from "../io.server";
import { MachineModel, SharedLink, UploadLink } from "../models";
import { createWriteStream, promises as fs, createReadStream } from 'fs'
import { SysDetails } from "../types";
import { Socket } from "socket.io";

export const createMachine = async (req: Request, res: Response) => {
    try {
        let { name } = req.body;
        let machine = await MachineModel.create({ name, owner: req.user._id });
        res.status(200).send(machine);
    } catch (error: any) {
        res.status(500).send(error.message);
    }
}

export const getMachines = async (req: Request, res: Response) => {
    try {
        let { id } = req.query;
        let machine: any;
        if (id) machine = await MachineModel.find({ _id: id });
        else machine = await MachineModel.find({ owner: req.user._id });
        res.status(200).send({ machine: machine });
    } catch (error: any) {
        res.status(500).send(error.message);
    }
}

export const delMachine = async (req: Request, res: Response) => {
    try {
        await MachineModel.deleteOne({ _id: req.machine._id });
        res.status(200).send('Machine Deleted successfully');
    } catch (error: any) {
        res.status(500).send(error.message);
    }
}


export const readDirs = async (req: Request, res: Response) => {
    try {
        let path = req.query.path || '/';
        let time = Date.now();

        io.to(req.machine.socketId).emit('READ_DIR', { path, mid: req.machine._id + time, hidden: req.query.hidden || false });
        req.channel.once(req.machine._id + time, (data: any) => {
            if (data.status) return res.status(200).send(data);
            else return res.status(400).send(data.message);
        })
    } catch (error: any) {
        res.status(500).send(error.message)
    }
}

export const deleteFiles = async (req: Request, res: Response) => {
    try {
        let { path } = req.query;
        let time = Date.now();
        let callBack = 'DELETE_RESPONSE' + time;
        io.to(req.machine.socketId).emit('DELETE_FILE_REQUEST', { cb: callBack, path });
        req.channel.once(callBack, async ({ status, path, message }) => {
            if (status == false) return res.status(400).send(message + " [ " + path + " ]")
            else return res.status(200).send(message + " [ " + path + " ]");
        })
    } catch (error: any) {
        res.status(500).send(error.message)
    }
}

export const uploadEntity = async (req: Request, res: Response) => {
    try {

        let path = req.query.path || '/';
        let time = Date.now();

        let cb = 'RESPONSE_FROM_FILE_UPLOAD' + time + req.user._id;
        let crSTream = 'CREATED_READ_STREAM' + time + req.user._id;

        if (!req.files) return res.status(404).send('Please attach files');
        let f: any = req.files.file;
        fs.mkdir('./upload' + time, { recursive: true });
        f.mv('./upload' + time + '/' + f.name);

        io.to(req.machine.socketId).emit('RECIEVE_FILES', { filename: f.name, cb: crSTream, resId: cb, path: path });
        req.channel.once(crSTream, async ({ id }) => {

            let stream = createReadStream('./upload' + time + '/' + f.name);
            stream.on('data', (data) => {
                io.to(req.machine.socketId).emit(id, { data: data, cb });
            });
            stream.on('close', () => {
                stream.close();
                io.to(req.machine.socketId).emit(id, { status: true, cb });
            })
            stream.on('error', (error) => {
                console.log('error');
                io.to(req.machine.socketId).emit(id, { status: false, cb, error: error });
            });
        });

        req.channel.once(cb, async ({ status, path, filename, message }) => {

            await fs.rm('./upload' + time, { recursive: true });
            if (status) return res.status(200).send(message);
            else return res.status(400).send(message);
        });
    } catch (error: any) {

        res.status(500).send(error.message);
    }
}

export const downloadEntity = async (req: Request, res: Response) => {
    try {
        let time = Date.now();
        let fileStream: any;


        if (!req.query.path) return res.status(404).send('pleas add file path');

        req.channel.once('CREATE_WRITE_STREAM' + time, async (data) => {
            console.log('Created wite stream');
            await fs.mkdir('./' + time);
            fileStream = createWriteStream(`./${time}/${data.filename}`);
            io.to(req.machine.socketId).emit('START' + data.data.mid, data.data);
        });

        io.to(req.machine.socketId).emit('DOWNLOAD_FILE_REQUEST', { mid: req.machine._id + time, wid: 'CREATE_WRITE_STREAM' + time, path: req.query.path });


        req.channel.on(req.machine._id + time, (data: any) => {
            console.log(data);
            if (data.error) {
                fileStream.close();
                return res.status(400).send(data.errorData.toString());
            }
            else if (data.end) {
                fileStream.close();
                console.log('executed');
                return res.download('./' + time + '/' + data.filename, async (err) => {
                    req.channel.removeAllListeners(req.machine._id + time);
                    try {
                        await fs.rm(`./${time}`, {
                            recursive: true,
                        });
                    } catch (error) {
                        console.log('error');
                    }
                });
            } else if (!data.status) {
                return res.status(404).send('File not found');
            } else {
                fileStream.write(data.data)
            }
        });
    } catch (error) {
        res.status(500).send('server error');
    }
}


export const publicDownload = async (req: Request, res: Response) => {
    try {
        const { sid } = req.query;
        if (!sid) return res.status(404).send("Shared link id not found in query");
        else {
            let s = await SharedLink.findById(sid);
            let machine = await MachineModel.findById(s.mid);
            if (!machine) return res.status(200).send("Machine not found");
            if (!machine.status) return res.status(400).send("Machine is offline try again");
            if (!s.status) return res.status(200).send("This link is deactivated by owner");
            else {
                let channel: Socket;
                let index: number = -1;
                connectedSockets.filter((value, i) => {
                    if (value.id == machine._id) {
                        index = i;
                    }
                });
                if (index > -1) {
                    console.log('here')
                    channel = connectedSockets[index].socket;
                } else return res.status(404).send('this machine is not connected');

                let time = Date.now();
                let fileStream: any;

                channel.once('CREATE_WRITE_STREAM' + time, async (data) => {
                    console.log('Created wite stream');
                    await fs.mkdir('./' + time);
                    fileStream = createWriteStream(`./${time}/${data.filename}`);
                    io.to(machine.socketId).emit('START' + data.data.mid, data.data);
                });
                io.to(channel.id).emit('DOWNLOAD_FILE_REQUEST', { mid: machine._id + time, wid: 'CREATE_WRITE_STREAM' + time, path: s.contentPath });


                channel.on(machine._id + time, (data: any) => {
                    console.log(data);
                    if (data.error) {
                        fileStream.close();
                        return res.status(400).send(data.errorData.toString());
                    }
                    else if (data.end) {
                        fileStream.close();
                        console.log('executed');
                        return res.download('./' + time + '/' + data.filename, async (err) => {
                            channel.removeAllListeners(machine._id + time);
                            try {
                                await fs.rm(`./${time}`, {
                                    recursive: true,
                                });
                            } catch (error) {
                                console.log('error');
                            }
                        });
                    } else if (!data.status) {
                        return res.status(404).send('File not found');
                    } else {
                        fileStream.write(data.data)
                    }
                });
            }
        }
    } catch (error: any) {
        res.status(500).send(error.message);
    }
}

export const uploadPublic = async (req: Request, res: Response) => {
    try {
        let { uid } = req.query;
        if (!uid) return res.status(404).send("uid not found in query");
        let uLinks = await UploadLink.findById(uid).populate("mid");
        if (!uLinks) return res.status(404).send("Upload link not found");
        if (!uLinks.status) return res.status(400).send("Upload link was deactivate by user");
        if (!uLinks.mid.status) return res.status(400).send("Machine is offline");
        let channel: Socket;
        let index: number = -1;
        connectedSockets.filter((value, i) => {
            if (value.id == uLinks.mid._id) {
                index = i;
            }
        });
        if (index > -1) {
            console.log('here')
            channel = connectedSockets[index].socket;
        } else return res.status(404).send('this machine is not connected');

        let path = uLinks.contentPath;
        let time = Date.now();

        let cb = 'RESPONSE_FROM_FILE_UPLOAD' + time + uLinks._id;
        let crSTream = 'CREATED_READ_STREAM' + time + uLinks._id;

        if (!req.files) return res.status(404).send('Please attach files');
        let f: any = req.files.file;

        if (f.size / (1024 * 1024) > parseInt(uLinks.fileSize.split(' ')[0])) return res.status(400).send("this file is greater then expacted file size");

        fs.mkdir('./upload' + time, { recursive: true });
        f.mv('./upload' + time + '/' + f.name);

        io.to(uLinks.mid.socketId).emit('RECIEVE_FILES', { filename: f.name, cb: crSTream, resId: cb, path: path });
        channel.once(crSTream, async ({ id }) => {
            let stream = createReadStream('./upload' + time + '/' + f.name);
            stream.on('data', (data) => {
                io.to(uLinks.mid.socketId).emit(id, { data: data, cb });
            });
            stream.on('close', () => {
                stream.close();
                io.to(uLinks.mid.socketId).emit(id, { status: true, cb });
            })
            stream.on('error', (error) => {
                console.log('error');
                io.to(uLinks.mid.socketId).emit(id, { status: false, cb, error: error });
            });
        });

        channel.once(cb, async ({ status, path, filename, message }) => {

            await fs.rm('./upload' + time, { recursive: true });
            if (status) {
                uLinks.uploadedFileName = f.name;
                if (uLinks.oneUse) {
                    uLinks.status = false;
                }
                await uLinks.save();
                return res.status(200).send(message);
            }
            else return res.status(400).send(message);
        })

    } catch (error: any) {
        res.status(500).send(error.message)
    }
}

export const getSystemDetails = async (req: Request, res: Response) => {
    try {
        let time = Date.now();
        io.to(req.machine.socketId).emit('SYSTEM_DETAILS', req.machine._id + time);
        req.channel.once(req.machine.id + time, (data: SysDetails) => {
            res.status(200).send(data);
        })
    } catch (error: any) {
        res.status(500).send(error.message)
    }
}
