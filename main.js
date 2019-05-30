let server = async() => {
	try{
		// config.js
		const DB_URL = `mongodb://${process.env.DOCKER ? "mongo" : "localhost"}:27017/pufulete-poc`
		const PORT = require.main === module ? 1337 : 7331 // If testing, change the port!


		const mongoose = require('mongoose');
		await mongoose.connect(DB_URL, {useNewUrlParser: true});

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
			let {ssid, userid, text} = req.body
			let userid_creator = await validateAuth(ssid)
			if(!userid_creator) res.status(401).end()

			await Comment.create({
				userid,
				userid_creator,
				text
			})

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

		console.log("Running")
	}catch(e){console.log(e)}
}

if(require.main === module)
    server()
else
    module.exports = server