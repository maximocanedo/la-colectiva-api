'use strict';
import mongoose, { Model } from "mongoose";
import { Router, Request, Response } from "express";
import pre from "./../endpoints/pre";
import IValidation from "../interfaces/models/IValidation";
import IValidatable from "../interfaces/models/IValidatable";
import defaultHandler from "../errors/handlers/default.handler";
import E from "../errors";

const getVotes = (id: string, userId: string) => ([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        {
            $project: {
                allValidations: "$validations", // Conservamos todos los datos de validaciones
                userValidation: {
                    $filter: {
                        input: "$validations",
                        as: "validation",
                        cond: {
                            $eq: ["$$validation.user", new mongoose.Types.ObjectId(userId)],
                        },
                    },
                },
            },
        },
        {
            $project: {
                userValidation: 1, // Mantenemos la salida anterior
                inFavorCount: {
                    $size: {
                        $filter: {
                            input: "$allValidations",
                            as: "validation",
                            cond: { $eq: ["$$validation.validation", true] },
                        },
                    },
                },
                againstCount: {
                    $size: {
                        $filter: {
                            input: "$allValidations",
                            as: "validation",
                            cond: { $eq: ["$$validation.validation", false] },
                        },
                    },
                },
                userVote: {
                    $cond: {
                        if: {
                            $ne: ["$userValidation", null],
                        },
                        then: { $arrayElemAt: ["$userValidation.validation", 0] },
                        else: null,
                    },
                },
            },
        },
    ]

);

const getValidations = (router: Router, Model: Model<IValidatable>): void => {
    router.get("/:id/votes", pre.authenticate(true), async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            const aggregationResult: any[] = await Model.aggregate(getVotes(id, req.user._id));

            if (aggregationResult.length === 0) {
                res.status(404).json({
                    error: E.ResourceNotFound
                }).end();
            }
            const { inFavorCount, againstCount, userVote } = aggregationResult[0];
            res.status(200).json({
                up: inFavorCount,
                down: againstCount,
                userVote: !('userVote' in aggregationResult[0]) ? 0 : (userVote ? 1 : -1)
            }).end();
        } catch (err) {
            const error = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({error});
        }
    }); // Get validations
};
const voteHandler = (validates: boolean, Model: Model<IValidatable>): (req: Request, res: Response) => Promise<void> => async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId: string = req.user._id;

        const resource = await Model.findById(id);
        if(!resource) {
            res.status(400).json({
                error: E.ResourceNotFound
            }).end();
            return;
        }
        const existingValidation = resource.validations.find((validation: IValidation): boolean => {
            return validation.user.toString() === userId.toString();
        });

        if (existingValidation) {
            // Si ya existe una validación,
            if(existingValidation.validation === validates) {
                // ... Y tiene el mismo valor que se desea agregar, la borramos.
                const indexOfExistingValidation: number = resource.validations.findIndex((validation: IValidation) => {
                    return validation.user.toString() === userId.toString();
                });
                resource.validations.splice(indexOfExistingValidation, 1);
            }
            // Si el valor es diferente, actualizarlo.
            else existingValidation.validation = validates;
        } else {
            // Si no existe, crear una nueva validación
            resource.validations.push({
                user: userId,
                validation: validates,
            });
        }
        await resource.save();



        const aggregationResult = await Model.aggregate(getVotes(id, req.user._id));

        if (aggregationResult.length === 0) {
            res.status(404).json({
                error: E.ResourceNotFound
            }).end();
        }
        const { inFavorCount, againstCount, userVote } = aggregationResult[0];
        res.status(201).json({
            up: inFavorCount,
            down: againstCount,
            userVote: !('userVote' in aggregationResult[0]) ? 0 : (userVote ? 1 : -1)
        }).end();


    } catch (err) {
        const error = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(500).json({error});
    }
}
const vote = (router: Router, Model: Model<IValidatable>) => {
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
const unvote = (router: Router, Model: Model<IValidatable>) => {
    router.delete("/:id/votes", pre.auth, pre.allow.normal, async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const userId = req.user._id;
            const resource = await Model.findOne({_id:id,active:true});
            if(!resource) {
                res.status(404).json({
                    error: E.ResourceNotFound
                }).end();
                return;
            }
            const index = resource.validations.findIndex(
                (item: IValidation): boolean => item.user.toString() === userId.toString()
            );
            if (index > -1) resource.validations.splice(index, 1);
            // Save the availability document
            await resource.save();



            const aggregationResult = await Model.aggregate(getVotes(id, req.user._id));

            if (aggregationResult.length === 0) {
                res.status(404).json({
                    error: E.ResourceNotFound
                }).end();
            }
            const { inFavorCount, againstCount, userVote } = aggregationResult[0];
            res.status(200).json({
                up: inFavorCount,
                down: againstCount,
                userVote: !('userVote' in aggregationResult[0]) ? 0 : (userVote ? 1 : -1)
            }).end();
        } catch (err) {
            const error = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({error});
        }
    });
};
const handleVotes = (router: Router, Model: Model<any> | any): void => {
    getValidations(router, Model);
    vote(router, Model);
    unvote(router, Model);
}

export {handleVotes};