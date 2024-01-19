'use strict';
import fetch from "./fetch";
import post from "./post";
import edit from "./edit";
import del from "./del";
import getOne from "./getOne";

const comments = {
    del,
    edit,
    fetch,
    getOne,
    post
};
export default comments;