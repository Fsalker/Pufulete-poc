(async() => {
    try{
        const PORT = 1338

        let express = require("express")
        let app = express()

        let quotes = JSON.parse((await require("fs").readFileSync("./quotes.json")).toString())

        app.get("/", (req, res) => {
            let crt_date = new Date(new Date().getTime())
            let year = crt_date.getFullYear()
            let month = crt_date.getMonth()
            let day = crt_date.getDate()
            let today = new Date(year, month, day)

            const RANDOM_SEED = 4812384
            let quoteIndex = (today.getTime() * RANDOM_SEED) % quotes.length;
            res.json(quotes[quoteIndex])
        })
        app.listen(PORT)

        console.log(`Quotes server listening on PORT ${PORT}`)
    }catch(e){
        console.log(e)
    }
})()