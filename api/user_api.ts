import { Request, Response } from "express";
import { comparePassword, encryptPassword, generateJwtToken, parseAuthorizationToken } from "../middlewares";
import { User } from "../models";

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body
        const user = await User.findOne({ $or: [{ username }, { email: username }] }).select(['-token'])

        if (!user) return res.status(404).send('username or email invalid')
        if (!comparePassword(user.password, password)) return res.status(400).send('invalid credentials')

        const jwtToken = generateJwtToken({ id: user._id })

        await User.findByIdAndUpdate(user._id, { $addToSet: { token: jwtToken } })

        return res.send({ jwtToken, user })
    } catch (error: any) {
        return res.status(500).send(error.message)
    }
}

export const signup = async (req: Request, res: Response) => {
    const { name, username, email, password } = req.body
    try {
        const isUserExists = await User.findOne({ $or: [{ username }, { email }] })
        if (isUserExists) return res.status(400).send('user with username or email already exists')

        const encryptedPassword = await encryptPassword(password)
        const user = await User.create({ name, username, email, password: encryptedPassword, token: [] })

        const jwtToken = generateJwtToken({ id: user._id })

        user.token.push(jwtToken)
        await user.save()

        return res.status(201).send({ jwtToken, user })
    } catch (error: any) {
        await User.findOneAndRemove({ username })
        return res.status(500).send(error.message)
    }
}

export const profile = async (req: Request, res: Response) => {
    res.status(200).send({ user: req.user });
}

export const logout = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user._id)
        let headers: any = req.headers;
        const token = parseAuthorizationToken(headers.authorization);
        const isAllSession = req.query.allSession

        if (isAllSession)
            user.token = []
        else
            user.token = user.token.filter((t: string) => t !== token)

        await user.save()

        return res.send('logged out');
    } catch (error: any) {
        return res.status(500).send(error.message)
    }
}

export const getLoginDevicesList = async (req: Request, res: Response) => {
    try {
        res.status(200).send({ token: req.user.token, length: req.user.token.length });
    } catch (error: any) {
        res.status(500).send(error.message);
    }
}

export const logoutSingleDevice = async (req: Request, res: Response) => {
    try {
        let { token } = req.body;
        if (!req.user.token.includes(token)) return res.status(404).send("this is not your token");
        else {
            let tok: string[] = [];
            req.user.token.forEach((e: string) => {
                if (e != token) tok.push(e);
            })
            req.user.token = tok;
            await req.user.save();
            return res.status(200).send("Device removed");
        }
    } catch (error: any) {
        res.status(500).send(error.message);
    }
}

export const logoutAllDevices = async (req: Request, res: Response) => {
    try {
        let nTok: string[] = [];
        req.user.token.forEach((e: string) => {
            if (e == req.token) nTok.push(e);
        });
        req.user.token = nTok;
        await req.user.save();
        return res.status(200).send("logged out all session");
    } catch (error: any) {
        res.status(500).send(error.message);
    }
}