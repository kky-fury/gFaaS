'use strict'

module.exports = async (event, context) => {
  const result = {
    'body': 'Hello World!',
    'content-type': event.headers["content-type"]
  }

  return context
    .status(200)
    .succeed(result)
}
