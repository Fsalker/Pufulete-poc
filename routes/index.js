let router = require("express").Router()
let mongoose = require("mongoose")

let {generateSession, createSession, validateAuth} = require("./utils.js")
let User = mongoose.model("User")
let Comment = mongoose.model("Comment")
let Session = mongoose.model("Session")

router.post("/register", async(req, res) => {
	let {username, password} = req.body
	if((await User.find({username})).length) return res.status(409).end()

	let u = await User.create({username, password})
	let sessionValue = generateSession()
	await createSession(u._id, sessionValue, Session)
	
	res.json(sessionValue)
})

router.post("/login", async(req, res) => {
	let {username, password} = req.body

	let u = await User.find({username, password})
	if(!u.length) return res.status(404).end()
	
	let sessionValue = generateSession()
	await createSession(u[0]._id, sessionValue, Session)

	res.json(sessionValue)
})

router.get("/users/:ssid", async(req, res) => {
	let {ssid} = req.params
	if(!await validateAuth(ssid)) return res.status(401).end()

	let users = await User.find({}, "_id username")

	res.json(users)
})

router.post("/comments", async(req, res) => {
	let {ssid, userid, text} = req.body
	let userid_creator = await validateAuth(ssid)
	if(!userid_creator) res.status(401).end()

	await Comment.create({
		userid,
		userid_creator,
		text
	})

	await req.elasticClient.create({
		id: Math.random(),
		index: "comments-hooray",
		body: {
			text
		}
	})

	res.end()
})

router.get("/comments/:ssid", async(req, res) => {
	let {ssid} = req.params
	if(!await validateAuth(ssid)) return res.status(401).end()

	let comments = await Comment.find({}, "_id userid userid_creator text created_at")
	comments = comments.map(c => {
		c.created_at = new Date(c.created_at).getTime()
		return c
	})

	res.json(comments)
})

module.exports = router