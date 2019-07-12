let server = async() => {
	try{
		// config.js
		const PORT = require.main === module ? 1337 : 7331 // If testing, change the port!

		// connect.js
		let {mongoose, elasticClient} = await require("./database/connect.js")()

		// models.js
		await require("./models")()

        // await User.deleteMany({})
        // await Comment.deleteMany({})
        // await Session.deleteMany({})

		// server.js
		let express = require("express")
		let app = express()
		require('express-async-errors'); // this is magic, but I have no idea how it works! D:
		app.use(express.json())
		
		// logger.js
		app.use((req, res, next) => { // Pass the DB drivers to the req variable (:
			req.elasticClient = elasticClient
			next()
		})
		app.use(require("./logger"))

		// routes.js
		app.use(require("./routes"))

		// Run da m4d4f4k1n server, N!
		app.listen(PORT)

		console.log(`API Back end is running on PORT ${PORT}`)
		return "good"
	}catch(e){
		console.log(e)
		process.exit()
	}
}

if(require.main === module)
    server()
else
    module.exports = server