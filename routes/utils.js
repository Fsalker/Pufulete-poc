let mongoose = require("mongoose")
let Session = mongoose.model("Session")

module.exports = {
	generateSession: () => require("crypto").randomBytes(16).toString("hex"),
	createSession: async(userid, value) => await Session.create({userid, value}),
	validateAuth: async(sessionValue) => {
		let u = await Session.find({value: sessionValue})
		if(u.length == 0) return false
		return u[0].userid
	}
}