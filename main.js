let server = async() => {
	try{
		// config.js
		const DB_URL = `mongodb://${process.env.DOCKER ? "mongo" : "localhost"}:27017/pufulete-poc`
		const PORT = require.main === module ? 1337 : 7331 // If testing, change the port!

		// Initialise
		const mongoose = require('mongoose');
		await mongoose.connect(DB_URL, {useNewUrlParser: true, useCreateIndex: true});

		const { Client } = require('@elastic/elasticsearch')
		let elastic_node = `http://${process.env.DOCKER ? "elastic" : "localhost"}:9200`
		const elasticClient = await new Client({ node: elastic_node })
		await elasticClient.ping() // Assert that the elastic client has connected succesfully

		// models.js
		const User = mongoose.model('User', { 
			username: {type: String, required: true, unique: true},
			password: {type: String, required: true},
			created_at: {type: Date, default: new Date()}
		});
		
		const Comment = mongoose.model('Comment', { 
			userid: {type: String, required: true},
            userid_creator: {type: String, required: true},
			text: {type: String, required: true},
			created_at: {type: Date, default: new Date()}
		});
		
		const Session = mongoose.model('Session', { 
			userid: {type: String, required: true},
			value: {type: String, required: true},
			created_at: {type: Date, default: new Date()}
		});

        // await User.deleteMany({})
        // await Comment.deleteMany({})
        // await Session.deleteMany({})

		// utils.js
		let generateSession = () => require("crypto").randomBytes(16).toString("hex")
		let createSession = async(userid, value, Session) => await Session.create({userid, value})
		let validateAuth = async(sessionValue) => {
			let u = await Session.find({value: sessionValue})
			if(u.length == 0) return false
			return u[0].userid
		}

		// server.js
		let express = require("express")
		let app = express()
		require('express-async-errors'); // this is magic, but I have no idea how it works! D:
		app.use(express.json())
		
		// logger.js
		let fs = require("fs")
		let logStream = fs.createWriteStream("./log.txt", {flags: "a"})
		app.use((req, res, next) => {
			let d = new Date()
    		let date_now = "[" + d.getFullYear() + "/" + ("0" + d.getMonth()).slice(-2) + "/" +  ("0" + d.getDate()).slice(-2) + " - "+("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2) + "] "
    		let client_IP = req.connection.remoteAddress

    		let msg = `${date_now} Client ${client_IP} has accessed ${req.originalUrl}\n`
    		console.log(msg.slice(0, -1))
    		logStream.write(msg)
    		elasticClient.create({
				id: Math.random(),
				index: "logs-hooray",
				body: {
					log: msg
				}
			})

    		next()
		})

		// routes.js
		app.post("/register", async(req, res) => {
			let {username, password} = req.body
			if((await User.find({username})).length) return res.status(409).end()

			let u = await User.create({username, password})
			let sessionValue = generateSession()
			await createSession(u._id, sessionValue, Session)
			
			res.json(sessionValue)
		})

		app.post("/login", async(req, res) => {
			let {username, password} = req.body

			let u = await User.find({username, password})
			if(!u.length) return res.status(404).end()
			
			let sessionValue = generateSession()
			await createSession(u[0]._id, sessionValue, Session)

			res.json(sessionValue)
		})

		app.get("/users/:ssid", async(req, res) => {
			let {ssid} = req.params
			if(!await validateAuth(ssid)) return res.status(401).end()

			let users = await User.find({}, "_id username")

			res.json(users)
		})

		app.post("/comments", async(req, res) => {
			console.log("inside comments")
			let {ssid, userid, text} = req.body
			let userid_creator = await validateAuth(ssid)
			if(!userid_creator) res.status(401).end()

			console.log("1")
			await Comment.create({
				userid,
				userid_creator,
				text
			})

			console.log("1")
			await elasticClient.create({
				id: Math.random(),
				index: "comments-hooray",
				body: {
					text
				}
			})

			console.log("1")

			res.end()
		})

		app.get("/comments/:ssid", async(req, res) => {
			let {ssid} = req.params
			if(!await validateAuth(ssid)) return res.status(401).end()

			let comments = await Comment.find({}, "_id userid userid_creator text created_at")
			comments = comments.map(c => {
				c.created_at = new Date(c.created_at).getTime()
				return c
			})

			res.json(comments)
		})

		// server.js
		app.listen(PORT)

		console.log(`API Back end is running...`)
	}catch(e){
		console.log(e)
		process.exit()
	}
}

if(require.main === module)
    server()
else
    module.exports = server