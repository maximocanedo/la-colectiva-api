'use strict';
import * as A from "./A.errors";
import * as typeE from "./E.errors";
import * as F from "./F.errors";
import * as M from "./M.errors";
import * as R from "./R.errors";
import * as U from "./U.errors";
import * as V from "./V.errors";
const E = {
    ...A,
    ...typeE,
    ...F,
    ...M,
    ...R,
    ...U,
    ...V
};
export default E;