"use strict";
import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const atlasConnectionString: string = process.env.MONGODB_LOCAL_CONNECTION_STRING?? "";

export const connectToDB = async (cb: () => void) => {
    return await mongoose.connect(atlasConnectionString) && cb();
};
