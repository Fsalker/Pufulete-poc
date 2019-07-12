module.exports = async() => { // Initialises the Mongoose models
	let mongoose = require("mongoose")

	await mongoose.model('User', { 
		username: {type: String, required: true, unique: true},
		password: {type: String, required: true},
		created_at: {type: Date, default: new Date()}
	})
	await mongoose.model('Comment', { 
		userid: {type: String, required: true},
	    userid_creator: {type: String, required: true},
		text: {type: String, required: true},
		created_at: {type: Date, default: new Date()}
	})
	await mongoose.model('Session', { 
		userid: {type: String, required: true},
		value: {type: String, required: true},
		created_at: {type: Date, default: new Date()}
	})	
}