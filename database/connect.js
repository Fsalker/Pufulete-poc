module.exports = async() => {
	const mongoose = require('mongoose');
	const DB_URL = `mongodb://${process.env.DOCKER ? "mongo" : "localhost"}:27017/pufulete-poc`
	await mongoose.connect(DB_URL, {useNewUrlParser: true, useCreateIndex: true});

	const { Client } = require('@elastic/elasticsearch')
	let elastic_node = `http://${process.env.DOCKER ? "elastic" : "localhost"}:9200`
	const elasticClient = await new Client({ node: elastic_node })
	await elasticClient.ping() // Assert that the elastic client has connected succesfully

	return {mongoose, elasticClient}
}