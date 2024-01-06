"use strict";
import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

const envPath: string =  path.resolve(__dirname, "..", ".env");
dotenv.config({ path: envPath });


const atlasConnectionString: string = process.env.MONGODB_LOCAL_CONNECTION_STRING as string;

export const connectToDB = async (cb: () => void): Promise<void> => {
    return await mongoose.connect(atlasConnectionString) && cb();
};
