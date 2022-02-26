import { Request, Response } from "express";
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const signup: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const profile: (req: Request, res: Response) => Promise<void>;
export declare const logout: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getLoginDevicesList: (req: Request, res: Response) => Promise<void>;
export declare const logoutSingleDevice: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const logoutAllDevices: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
