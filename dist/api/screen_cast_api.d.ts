import { Request, Response } from "express";
export declare const getScreenImage: (req: Request, res: Response) => Promise<void>;
export declare const createScreenCastLink: (req: Request, res: Response) => Promise<void>;
export declare const getScreenCastLinks: (req: Request, res: Response) => Promise<void>;
export declare const deleteScreenCastLink: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateScreencastLinks: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPublicScreenImage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const publicScreenCastDetails: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
