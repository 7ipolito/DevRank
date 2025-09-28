import { Request, Response } from 'express';
export declare class UserController {
    private static codeStatsService;
    private static contractService;
    static createUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static createUserWithWallet(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getUsers(req: Request, res: Response): Promise<void>;
    static getUserStats(req: Request, res: Response): Promise<void>;
    static fetchUserStats(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=UserController.d.ts.map