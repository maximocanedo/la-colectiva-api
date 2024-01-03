'use strict';

import patchEdit from "./patchEdit";
import edit from "./edit";
import getOne from "./getOne";
import list from "./list";
import deleteOne from "./deleteOne";
import createOne from "./createOne";
import createOnePhone from "./phones/createOne";
import deleteOnePhone from "./phones/deleteOne";
import listPhones from "./phones/list";

export default {
    createOne,
    deleteOne,
    list,
    getOne,
    edit,
    patchEdit,
    phones: {
        createOne: createOnePhone,
        deleteOne: deleteOnePhone,
        list: listPhones
    }
};