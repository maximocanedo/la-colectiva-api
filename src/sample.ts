import * as boats from "./ext/boats";
import {IBoatView} from "./schemas/Boat";
import {ObjectId} from "mongodb";

(async (): Promise<void> => {

    try {
        const boat: IBoatView[] = await boats.find({q: "", paginator: {page: 0, size: 5}});
        console.log({boat});
    } catch(err) {
        console.error(err);
    }
})();