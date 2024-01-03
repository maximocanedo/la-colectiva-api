'use strict';
import getOne from "./getOne";
import updatePassword from "./updatePassword";
import updateRole from "./updateRole";
import editPersonalInfo from "./editPersonalInfo";
import deleteUser from "./deleteUser";
import signup from "./signup";
import { login, logout } from "./auth";
import { startMailVerification, validateMail } from "./startMailVerification";

const users = {
    getOne,
    updatePassword,
    updateRole,
    editPersonalInfo,
    deleteUser,
    signup,
    login,
    logout,
    startMailVerification,
    validateMail
};
export default users;