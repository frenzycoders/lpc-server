import { Request, Response } from "express";
import { io } from "../io.server";
import { ScreenStream } from "../models";

export const getScreenImage = async (req: Request, res: Response) => {
    try {
        let time = Date.now();
        let cb = 'RESPONSE_SCREEN_SHOT' + time;
        io.to(req.machine.socketId).emit('REQUEST_FROM_SCREEN_SHOT', { id: cb });
        req.channel.once(cb, (data) => {
            return res.status(200).send(data);
        })
    } catch (error: any) {
        console.log(error);
        res.status(500).send(error.message);
    }
}

export const createScreenCastLink = async (req: Request, res: Response) => {
    try {
        let { title } = req.body;
        let screen = await ScreenStream.create({ mid: req.machine._id, userId: req.user._id, title, });
        req.user.streamLinks.push(screen._id);
        await req.user.save();
        res.status(200).send(screen);
    } catch (error: any) {
        res.status(500).send(error.message);
    }
}

export const getScreenCastLinks = async (req: Request, res: Response) => {
    try {
        let screens = await ScreenStream.find({ mid: req.machine._id, userId: req.user._id });
        res.status(200).send({ screens, length: screens.length });
    } catch (error: any) {
        res.status(500).send(error.message)
    }
}

export const deleteScreenCastLink = async (req: Request, res: Response) => {
    try {
        let { screen } = req.query;
        if (!screen) return res.status(404).send("screen id not found in query");
        if (!req.user.streamLinks.includes(screen)) return res.status(404).send("This link is not yours");
        await ScreenStream.findByIdAndDelete(screen);
        req.user.streamLinks.pop(screen);
        await req.user.save();
        res.status(200).send("Screen share link was deleted");
    } catch (error: any) {
        res.status(500).send(error.message);
    }
}

export const updateScreencastLinks = async (req: Request, res: Response) => {
    try {
        let { screen } = req.query;
        if (!screen) return res.status(404).send("screen id not found in query");
        if (!req.user.streamLinks.includes(screen)) return res.status(404).send("this screen share link is not yours");
        let src = await ScreenStream.findByIdAndUpdate(screen, req.body, { new: true });
        res.status(200).send({ screen: src });
    } catch (error: any) {
        res.status(500).send(error.message);
    }
}

export const getPublicScreenImage = async (req: Request, res: Response) => {
    try {
        let { screen } = req.query;
        let src = await ScreenStream.findById(screen).populate("mid");
        if (!src) return res.status(404).send("Invalid screen id in query");
        if (!src.status) return res.status(400).send("Link is deactivated by owner");
        if (src.mid.status == false) return res.status(400).send("Machine is offline please try again");

        let time = Date.now();
        let cb = 'RESPONSE_SCREEN_SHOT' + time;
        io.to(src.mid.socketId).emit('REQUEST_FROM_SCREEN_SHOT', { id: cb });
        req.channel.once(cb, (data) => {
            return res.status(200).send(data);
        })

    } catch (error: any) {
        res.status(500).send(error.message);
    }
}

export const publicScreenCastDetails = async (req: Request, res: Response) => {
    try {
        let { screen } = req.query;
        let src = await ScreenStream.findById(screen).populate("mid");
        console.log(src)
        if (!src) return res.status(404).send("Invalid screen id in query");
        if (!src.status) return res.status(400).send("Link is deactivated by owner");
        if (src.mid.status == false) return res.status(400).send("Machine is offline please try again");
        res.status(200).send(src);
    } catch (error: any) {
        res.status(500).send(error.message)
    }
}