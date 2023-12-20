'use strict';
module.exports = {
    createOne: require('./createOne'),
    deleteOne: require('./deleteOne'),
    list: require('./list'),
    getOne: require('./getOne'),
    edit: require('./edit'),
    patchEdit: require('./patchEdit'),
    phones: {
        createOne: require('./phones/createOne'),
        deleteOne: require('./phones/deleteOne'),
        list: require('./phones/list')
    },
};