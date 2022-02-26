import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { MachineModel, User } from './models';
import { hash, compare } from 'bcrypt';
import { Socket } from 'socket.io';
import { connectedSockets } from './io.server';

const jwtSecretKey: string = process.env.JWT_KEY || 'some text';

export const generateJwtToken = (payload: any) => {
    const jwtToken = jwt.sign(payload, jwtSecretKey, { expiresIn: 60 * 60 * 24 * 7 })
    return jwtToken
}

export const validateJwtToken = (token: string) => {
    const decoded = jwt.verify(token, jwtSecretKey)
    return decoded
}


export const parseAuthorizationToken = (token: string) => {
    if (!token) throw new Error('authorizationToken not found')
    if (!token.includes('Bearer ')) throw new Error('invalid token Bearer must be in token')
    return token.split('Bearer ')[1]
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    try {

        let headers: any = req.headers;

        const authorizationToken = parseAuthorizationToken(headers.authorization);
        if (!authorizationToken) return res.status(400).send('authorization token not found')

        const decoded: any = validateJwtToken(authorizationToken)
        const user = await User.findById(decoded.id);

        if (!user) return res.status(404).send('your token is expired please login again.')
        if (!user.token.includes(authorizationToken)) return res.status(400).send('invalid authorization token')
        req.user = user;
        req.token = headers.authorization;
        next()
    } catch (error: any) {
        return res.status(500).send(error.message)
    }
}
export const downloadAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    try {

        let headers: any = req.query;

        const authorizationToken = parseAuthorizationToken(headers.authorization);
        if (!authorizationToken) return res.status(400).send('authorization token not found')

        const decoded: any = validateJwtToken(authorizationToken)
        const user = await User.findById(decoded.id);

        if (!user) return res.status(404).send('your token is expired please login again.')
        if (!user.token.includes(authorizationToken)) return res.status(400).send('invalid authorization token')
        req.user = user;
        req.token = headers.authorization;
        next()
    } catch (error: any) {
        return res.status(500).send(error.message)
    }
}
export const encryptPassword = async (password: string) => {
    return await hash(password, 10)
}

export const comparePassword = async (hash: string, password: string) => {
    return await compare(hash, password)
}


export const checkMachineOwner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let machine = await MachineModel.findOne({ owner: req.user._id, _id: req.query.id });
        if (!machine) return res.status(404).send('this machin is not your');
        else {
            req.machine = machine;
            next();
        }
    } catch (error: any) {
        res.status(500).send(error.message);
    }
}


export const ismachineOnline = (req: Request, res: Response, next: NextFunction) => {
    if (!req.machine.status) return res.status(400).send('machine is offline');
    else next();
}

export const getSocketWithMachineId = (req: Request, res: Response, next: NextFunction) => {
    let index: number = -1;
    connectedSockets.filter((value, i) => {
        if (value.id == req.machine._id) {
            index = i;
        }
    });
    console.log(index);

    if (index > -1) {
        console.log('here')
        req.channel = connectedSockets[index].socket;
        next();
    } else return res.status(404).send('this machine is not connected');
}

