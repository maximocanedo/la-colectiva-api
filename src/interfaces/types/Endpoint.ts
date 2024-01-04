'use strict';

import {NextFunction, Request, Response} from "express";
type MiddlewareEndpoint = (req: Request, res: Response, next: NextFunction) => Promise<void>;
type FinalEndpoint = (req: Request, res: Response) => Promise<void>;
export type endpoint = MiddlewareEndpoint | FinalEndpoint;