import { Request, Response } from "express";
import { SharedLink, UploadLink } from "../models";

export const createSharedLink = async (req: Request, res: Response) => {
    try {
        const { contentPath } = req.query;
        if (!contentPath) return res.status(404).send("Please add contentPath ");
        else {
            let sharedLink = await SharedLink.create({ mid: req.machine._id, userId: req.user._id, contentPath, });
            req.user.publicLinks.push(sharedLink._id);
            await req.user.save();
            return res.status(200).send(sharedLink);
        }
    } catch (error: any) {
        res.status(500).send(error.message.toString())
    }
}

export const updateSharedLinks = async (req: Request, res: Response) => {
    try {
        let { status, sid } = req.body;
        if (!sid) return res.status(404).send("link id and status not found in body");
        let s = await SharedLink.findById(sid);

        if (req.user._id.toString() == s.userId.toString()) {
            s.status = status;
            await s.save();
            return res.status(200).send(s);
        } else res.status(400).send("this link is not your");
    } catch (error: any) {
        res.status(500).send(error.message)
    }
}

export const getSharedLinks = async (req: Request, res: Response) => {
    try {
        let sharedLinks = await SharedLink.find({ mid: req.machine._id });
        res.status(200).send(sharedLinks);
    } catch (error: any) {
        res.status(500).send(error.message.toString());
    }
}

export const deleteSharedLinks = async (req: Request, res: Response) => {
    try {
        const { sid } = req.query;
        if (!sid) return res.status(404).send("Shared link id not found in query");
        else {
            if (req.user.publicLinks.includes(sid)) {
                await SharedLink.findByIdAndDelete(sid);
                req.user.publicLinks.pop(sid);
                await req.user.save();
                return res.status(200).send("Deleted");
            }
            return res.status(400).send("This shared link is not your");
        }
    } catch (error: any) {
        res.status(500).send(error.message.toString());
    }
}

export const createUploadLinks = async (req: Request, res: Response) => {
    try {
        let { title, contentPath, oneUse, fileSize, } = req.body;
        let link = await UploadLink.create({ mid: req.machine._id, userId: req.user._id, title, contentPath, oneUse, fileSize });
        req.user.uploadLinks.push(link._id);
        await req.user.save();
        res.status(200).send(link);
    } catch (error: any) {
        res.status(500).send(error.message)
    }
}

export const getUploadLinks = async (req: Request, res: Response) => {
    try {
        console.log(req.user);
        let links = await UploadLink.find({ mid: req.machine._id });
        res.status(200).send({ links, length: links.length });
    } catch (error: any) {
        res.status(500).send(error.message);
    }
}

export const deleteUploadLinks = async (req: Request, res: Response) => {
    try {
        let { uid } = req.query;
        if (!uid) return res.status(404).send("uid not found in query");
        if (!req.user.uploadLinks.includes(uid)) return res.status(404).send("This link is not yours");
        await UploadLink.deleteOne({ _id: uid, mid: req.machine._id });
        req.user.uploadLinks.pop(uid);
        await req.user.save();
        res.status(200).send("upload link was Deleted");
    } catch (error: any) {
        res.status(500).send(error.message)
    }
}

export const updateUploadLinks = async (req: Request, res: Response) => {
    try {
        let { uid } = req.query;
        if (!uid) return res.status(404).send("uid not found in query");
        if (!req.user.uploadLinks.includes(uid)) return res.status(404).send("This upload link is not yours");
        let link = await UploadLink.findByIdAndUpdate(uid, req.body, { new: true });
        res.status(200).send(link);
    } catch (error: any) {
        res.status(500).send(error.message)
    }
}

export const validateUploadlinks = async (req: Request, res: Response) => {
    try {
        let { uid } = req.query;
        if (!uid) return res.status(404).send("uid not found in query");
        let Ulink = await UploadLink.findById(uid).populate('mid');
        if (!Ulink) return res.status(404).send("This link was expire");
        if (!Ulink.status) return res.status(400).send("This link was deactivate by owner");
        if (Ulink.mid.status == false) return res.status(404).send("Machine is not online please try again");
        res.status(200).send({ uLink: Ulink });
    } catch (error: any) {
        res.status(500).send(error.message);
    }
}