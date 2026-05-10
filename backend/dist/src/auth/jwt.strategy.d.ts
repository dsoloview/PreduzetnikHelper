import { Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithoutRequest] | [opt: import("passport-jwt").StrategyOptionsWithRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    constructor(configService: ConfigService);
    validate(payload: {
        sub: string;
        username: string;
    }): Promise<{
        userId: string;
        username: string;
    }>;
}
export {};
