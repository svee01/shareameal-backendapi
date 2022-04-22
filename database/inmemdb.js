// Deze variabelen worden niet geëxporteerd en kunnen dus niet
// vanuit andere bestanden gewijzigd worden - alleen via de databasefuncties.
const _moviedb = []
const _userdb = []
const timeout = 500 // msec
let id = 0
let userId = 0

// Dit is het object dat geexporteerd wordt, en dus in andere JavaScript bestanden geïmporteerd kan worden, via require.
module.exports = {
    /**
     * Maak een nieuwe movie aan in de database. De naam van de movie moet uniek zijn.
     *
     * @param {*} user
     * @param {*} movie De movie die we toevoegen
     * @param {*} callback De functie die ofwel een error, ofwel een resultaat teruggeeft.
     */

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
                    id: userId++,
                    ...user,
                }
                _userdb.push(userToAdd)
                callback(undefined, userToAdd)
            }
        }, timeout)
    },

    /**
     * Retourneer een lijst van alle movies.
     * Om alle movies op te halen hebben we geen input param nodig,
     * dus alleen een callback als parameter.
     *
     * @param {*} callback De functie die het resultaat retourneert.
     */

    listUsers(callback) {
        console.log('listUsers called')

        setTimeout(() => {
            // roep de callback aan, zonder error, maar met de hele moviedb als result.
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
                _userdb.filter((item) => item.userId === id).length > 0
            ) {
                let userById = _userdb.filter((item) => item.userId === id)
                callback(undefined, userById)
            } else {
                const error = 'A user with this ID does not exist.'
                console.log(error)
                callback(error, undefined)
            }
        }, timeout);
    },

    updateMovie() {
        
    },

    deleteMovie() {
        
    },

    createMovie(movie, callback) {
        console.log('createMovie called')
        // we simuleren hier dat de database query 'lang' duurt, door een setTimeout toe te voegen.
        setTimeout(() => {
            // de naam van de movie moet uniek zijn.
            // controleer daarom eerst of er al een movie met die naam in de _moviedb zit.
            if (
                movie &&
                movie.name &&
                _moviedb.filter((item) => item.name === movie.name).length > 0
            ) {
                const error = 'A movie with this name already exists.'
                console.log(error)
                // roep de callback functie aan met error als resultaat, en result = undefined.
                callback(error, undefined)
            } else {
                // voeg de id toe aan de movie, in de moveToAdd
                const movieToAdd = {
                    id: id++,
                    ...movie,
                }
                _moviedb.push(movieToAdd)
                // roep de callback aan, zonder error, maar met de nieuwe movie als result.
                callback(undefined, movieToAdd)
            }
        }, timeout)
    },

    /**
     * Retourneer een lijst van alle movies.
     * Om alle movies op te halen hebben we geen input param nodig,
     * dus alleen een callback als parameter.
     *
     * @param {*} callback De functie die het resultaat retourneert.
     */
    listMovies(callback) {
        console.log('listMovies called')

        setTimeout(() => {
            // roep de callback aan, zonder error, maar met de hele moviedb als result.
            callback(undefined, _moviedb)
        }, timeout)
    },

    getMovieById() {
        // zelf uitwerken
    },

    updateMovie() {
        // zelf uitwerken
    },

    deleteMovie() {
        // zelf uitwerken
    },
}