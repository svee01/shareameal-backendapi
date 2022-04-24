const _userdb = []
const timeout = 500
let id = 0

module.exports = {

    createUser(user, callback) {
        console.log('createUser called')

        setTimeout(() => {
            if (
                user &&
                user.name &&
                _userdb.filter((item) => item.name === user.name).length > 0
            ) {
                const error = 'A user with this name already exists.'
                console.log(error)
                callback(error, undefined)
            } else {
                const userToAdd = {
                    id: id++,
                    ...user,
                }
                _userdb.push(userToAdd)
                callback(undefined, userToAdd)
            }
        }, timeout)
    },

    listUsers(callback) {
        console.log('listUsers called')

        setTimeout(() => {
            if (_userdb.length > 0) {
                callback(undefined, _userdb)
            } else {
                const error = 'This database is empty!'
                console.log(error)
                callback(error, undefined)
            }
        }, timeout)
    },

    getUserById(id, callback) {
        console.log('getUserById called')

        setTimeout(() => {
            if (
                _userdb.filter((item) => item.id === id).length > 0
            ) {
                let userById = _userdb.filter((item) => item.id === id)
                callback(undefined, userById)
            } else {
                const error = 'A user with this ID does not exist.'
                console.log(error)
                callback(error, undefined)
            }
        }, timeout)
    },

    updateUser(id, callback) {
        console.log('updateUser called')

        setTimeout(() => {
            if (_userdb.length >= id || _userdb.length == id - 1) {
                let oldUser = _userdb[userById.id]
                let userById = this.getUserById(id, callback)
                const newUser = {
                    oldUser,
                    ...userById
                }
            } else {
                const error = 'A user with this ID does not exist.'
                console.log(error)
                callback(error, undefined)
            }
        }, timeout)
    },

    deleteUser(id, callback) {
        console.log('deleteUser called')

        setTimeout(() => {
            if (_userdb.length >= id || _userdb.length == id - 1) {
                let userById = this.getUserById(id, callback)
                _userdb.splice(userById, 1)
                console.log(`Deleted user: ${userById}`)
            } else {
                const error = 'A user with this ID does not exist.'
                console.log(error)
                callback(error, undefined)
            }
        }, timeout)
    },
}