const gfaas = require("gfaas-core-node14")

/**
 * Responds to any HTTP request.
 *
 *  See https://expressjs.com/de/api.html for more information
 */
function call(req, res) {
    // Put here your custom code
    res.send("Hello World!")
}

gfaas.runFunction(call)

