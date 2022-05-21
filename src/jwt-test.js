const jwt = require('jsonwebtoken')

const privateKey = 'secretstring'

jwt.sign({ foo: 'bar' }, privateKey, { algorithm: 'RS256' }, function(err, token) {
    if (token) console.log(token)
    if (err) console.log(err)
})