module.exports = ((req, res, next) => {
	let fs = require("fs")
	let logStream = fs.createWriteStream("./logger/log.txt", {flags: "a"})
	let d = new Date()
	let date_now = "[" + d.getFullYear() + "/" + ("0" + d.getMonth()).slice(-2) + "/" +  ("0" + d.getDate()).slice(-2) + " - "+("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2) + "] "
	let client_IP = req.connection.remoteAddress

	let msg = `${date_now} Client ${client_IP} has accessed ${req.originalUrl}\n`
	console.log(msg.slice(0, -1))
	logStream.write(msg)
	req.elasticClient.create({
		id: Math.random(),
		index: "logs-hooray",
		body: {
			log: msg
		}
	})
	logStream.end()
	next()
})