'use strict';
import mongoose, { Model, Schema, Types } from "mongoose";
import { Router, Request, Response } from "express";
import pre from "./../endpoints/pre";
import {IValidation} from "../schemas/Validation";

const getValidations = (router: Router, Model: any): void => {
    router.get("/:id/votes", pre.auth, async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const userId = req.user._id;

            const result = await Model.getValidations(id, userId);

            if (!result.success) {
                console.error(result.message);
                res.status(result.status).json(result);
            }

            res.status(result.status).json(result);
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Internal error",
            });
        }
    }); // Get validations
};
const voteHandler = (validates: boolean, Model: Model<any> | any): (req: Request, res: Response) => Promise<void> => async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId: string = req.user._id;
        const validates: boolean = true;

        //const result: void = await Model.validate(id, userId, validates);
        const resource = Model.findById(id);
        const existingValidation = resource.validations.find((validation: IValidation): boolean => {
            return validation.user.toString() === userId.toString();
        });
        if (existingValidation) {
            // Si ya existe una validación, actualizar su estado
            existingValidation.validation = validates;
        } else {
            // Si no existe, crear una nueva validación
            resource.validations.push({
                user: userId,
                validation: validates,
            });
        }
        await resource.save();

        /* if (!result.success) {
            console.error(result.message);
            res.status(result.status);
        }
        res.status(result.status); */
        res.status(201);
    } catch (err) {
        console.error(err);
        res.status(500).end();
    }
}
const vote = (router: Router, Model: Model<any> | any) => {
    router.post(
        "/:id/votes/upvote",
        pre.auth,
        pre.allow.normal,
        voteHandler(true, Model)
    ); // Upvote register
    router.post(
        "/:id/votes/downvote",
        pre.auth,
        pre.allow.normal,
        voteHandler(false, Model)
    ); // Downvote register
};
const unvote = (router: Router, Model: Model<any> | any) => {
    router.delete("/:id/votes", pre.auth, pre.allow.normal, async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const userId = req.user._id;
            const resource = await Model.findById(id);
            if(!resource) resource.status(404).end();
            const index = resource.validations.findIndex(
                (item: IValidation): boolean => item.user.toString() === userId.toString()
            );
            if (index > -1) resource.validations.splice(index, 1);
            // Save the availability document
            await resource.save();
        } catch (err) {
            console.error(err);
            res.status(500).end();
        }
    });
};
const handleVotes = (router: Router, Model: Model<any> | any): void => {
    getValidations(router, Model);
    vote(router, Model);
    unvote(router, Model);
}

export {handleVotes};