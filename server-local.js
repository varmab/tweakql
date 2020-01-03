const port = process.env.PORT || 3003

const app = require("./express/server.js")

app.listen(port)
console.log(`GraphiQL is now running on http://localhost:${port}/`)
