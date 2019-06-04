let server = require("./main.js")
let request = require("request-promise-native")
require("chai").should()

describe("Should execute all the features an user can do", async() => {
    const API_PORT = 2000

    const USERNAME_1 = "gigelovich"+Math.random()
    const USERNAME_2 = "bibelovich"+Math.random()
    const PASSWORD_1 = "secretovich"
    const PASSWORD_2 = "sekretovich"
    const COMMENT_1 = "you rock!!123"

    const ERR_SHOULD_HAVE_BEEN_THROWN = new Error("An error should have been thrown here, but there's no error!")
    let SESSION_1
    let SESSION_2
    let USERID_1
    let USERID_2

    const HOST = `http://localhost:${API_PORT}`
    const REGISTER_ROUTE = "/register"
    const LOGIN_ROUTE = "/login"
    const USERS_ROUTE = "/users"
    const COMMENTS_ROUTE = "/comments"

    // before(async() => {
    //     await server()
    // })

    // describe("Should delete accounts", () => {
    //     it("Should delete account (1)", async() => {

    //     })
    // })

    describe("Users", () => {
        it("Should register an account (1)", async() => {
            let data = {username: USERNAME_1, password: PASSWORD_1}
            let method = "POST"
            let r = await request({uri: `${HOST}${REGISTER_ROUTE}`, method, json: data})
            r.should.be.a("string")
            SESSION_1 = r
        })

        it("Should register an account (2)", async() => {
            let data = {username: USERNAME_2, password: PASSWORD_2}
            let method = "POST"
            let r = await request({uri: `${HOST}${REGISTER_ROUTE}`, method, json: data})
            r.should.be.a("string")
            SESSION_2 = r
        })

        it("Should login account", async() => {
            let data = {username: USERNAME_2, password: PASSWORD_2}
            let method = "POST"
            let r = await request({uri: `${HOST}${LOGIN_ROUTE}`, method, json: data})
            r.should.be.a("string")
        })

        it("Should not log into account", async() => {
            try{
                let data = {username: USERNAME_2, password: PASSWORD_1}
                let method = "POST"
                let r = await request({uri: `${HOST}${LOGIN_ROUTE}`, method, json: data})
                r.should.be.a("string")
                throw ERR_SHOULD_HAVE_BEEN_THROWN
            }catch(e){
                if(e === ERR_SHOULD_HAVE_BEEN_THROWN) throw e
            }
        })

        it("Should get users", async() => {
            let method = "GET"
            let uri = `${HOST}${USERS_ROUTE}/${SESSION_1}`
            let r = await request({uri, method})
            r = JSON.parse(r)
            r.should.be.a("array")
            r.length.should.be.at.least(2)
            r[0].should.have.all.keys("_id", "username")
            USERID_1 = r.find(user => user.username === USERNAME_1)._id
            USERID_2 = r.find(user => user.username === USERNAME_2)._id
        })

        it("Should not get users", async() => {
            try{ 
                let method = "GET"
                let uri = `${HOST}${USERS_ROUTE}/${SESSION_1+"1"}`
                let r = await request({uri, method})
                throw ERR_SHOULD_HAVE_BEEN_THROWN
            }catch(e){
                if(e.statusCode != 401) console.log("good!")
                if(e === ERR_SHOULD_HAVE_BEEN_THROWN) throw e
            }
        })
    })

    describe("Comments", () => {
        it("Should write comment (user 2 to user 1)", async() => {
            let data = {ssid: SESSION_2, userid: USERID_1, text: COMMENT_1}
            let method = "POST"
            let r = await request({uri: `${HOST}${COMMENTS_ROUTE}`, method, json: data})
        })

        it("Should get all comments", async() => {
            let method = "GET"
            let uri = `${HOST}${COMMENTS_ROUTE}/${SESSION_1}`
            let r = await request({uri, method})
            r = JSON.parse(r)
            r.should.be.a("array")
            r.length.should.be.at.least(1)
            r[0].should.have.all.keys("_id", "text", "userid", "userid_creator", "created_at")
            let comment = r.find(comment => comment.userid === USERID_1 && comment.userid_creator === USERID_2)
            comment.should.be.ok
            // console.log(USERID_1+" "+USERID_2)
        })
    })
})comment = r.find(comment => comment.userid === USERID_1 && comment.userid_creator === USERID_2)
        })
    })
})