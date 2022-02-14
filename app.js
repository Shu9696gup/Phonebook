const express = require("express");
const mongoose = require("mongoose");
const validator = require("validator")
const bcrypt = require("bcrypt")
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);



const { cleanUpAndValidate } = require("./utils/AuthUtils");
const { mongoURI } = require("./private-constant");
const UserModels = require("./Models/UserModels");
const UserInputModel = require("./Models/UserInputModel");
const { redirect } = require("express/lib/response");

const app = express();
const PORT = 4000;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedtopology: true
}).then(res => {
    //console.log(res);
    console.log("Connected to Database")
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))

const databaseSession = new MongoDBSession({
    uri: mongoURI,
    collection: "mysessions"
})

app.use(session({
    secret: "our secret key",
    resave: false,
    saveUninitialized: false,
    store: databaseSession
}))

const isAuth = (req, res, next) => {   //middleware or function- it will protect all the api with session based authentication
    if (req.session.isAuth) {
        next();
    }
    else {
        res.send({
            status: 401,
            message: 'Invalid session. Please log in'
        })
    }
}

app.get("/", (req, res) => {
    res.send("Welcome to my Phone-book App")
})

app.set('view engine', 'ejs')

app.get("/login", (req, res) => {
    res.render('login');
})

app.get('/register', (req, res) => {
    res.render('register');
})

app.post('/login', async (req, res) => {
    const { loginId, password } = req.body;
    //console.log(req.body)

    let user;

    if (!loginId || !password) {
        return res.send({
            status: 400,
            message: "missing params...",

        })
    }

    if (validator.isEmail(loginId)) {
        //it is email
        user = await UserModels.findOne({ email: loginId });
    }
    else {
        user = await UserModels.findOne({ username: loginId });
    }
    //if user not found
    if (!user) {
        return res.send({
            status: 401,
            message: "User not found",
            data: req.body
        })
    }
    //match password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.send({
            status: 401,
            message: "Invalid password"
        })
    }

    req.session.isAuth = true;
    req.session.user = { email: user.email, username: user.username }

    return res.redirect("/dashboard")
    // res.send({
    //          status:200,
    //          message:"login successful",
    //          data:{
    //              name: user.name,
    //              email:user.email,
    //              username:user.username
    //          }
    //     })

})


app.post('/register', async (req, res) => {
    const { name, email, password, username } = req.body;
    console.log(req.body)
    try {
        await cleanUpAndValidate({ name, email, password, username });
    }
    catch (err) {
        return res.send({
            status: 400,
            message: "invalid data",
            error: err
        })
    }
    try {
        let useremail = await UserModels.findOne({ email })
        let userUserName = await UserModels.findOne({ username })

        if (useremail) {
            return res.send({
                status: 401,
                message: "email already exists"
            })
        }
        if (userUserName) {
            return res.send({
                status: 401,
                message: "userName already exists"
            })
        }

    }
    catch (err) {
        return res.send({
            status: 400,
            message: "Database error",
            error: err
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    //save to db
    const user = UserModels({
        name, email, username, password: hashedPassword
    })

    try {
        const userdb = await user.save()
        return res.send({
            status: 200,
            message: "Registration successful",
            data: {
                name: userdb.name,
                email: userdb.email,
                username: userdb.username
            }
        })
    }
    catch (err) {
        return res.send({
            status: 200,
            message: "Registration failed",
            error: err
        })
    }
})

app.get("/dashboard", isAuth, async (req, res) => {

    let users = [];
    try {
        users = await UserInputModel.find({ owner: req.session.user.username })
        //console.log(users)
    }
    catch (err) {
        return res.redirect('login')
    }
    res.render('dashboard', { users: users })
})

app.post("/create-user", async (req, res) => {
    const { name, email, phone } = req.body;
    // console.log(req.body)

    // try{
    //     let Emails=await UserInputModel.findOne({email})
    //     console.log(Emails)
    //     if(Emails){
    //         return res.send({
    //             status: 401,
    //             message: "email already exist"
    //         })
    //     }
    // }
    // catch(err){
    //     return res.send({
    //         status:400,
    //         message:"Database error"
    //     })
    // }

    const userInput = new UserInputModel({
        owner: req.session.user.username,
        userName: name,
        userEmail: email,
        userPhone: phone
    })
    try {
        const userdata = await userInput.save();
        return res.redirect("dashboard")
        // return res.send({
        //     status: 200,
        //     message: "Registration Successful",
        //     // data: {
        //     //     name: userdata.name,
        //     //     email: userdata.email,
        //     //     phone: userdata.phone
        //     // }
        // })
    }
    catch (err) {
        return res.send({
            status: 401,
            message: "database error"
        })
    }
})

app.post("/edit-item", async (req, res) => {


    const id = req.body.id;

    const newData = req.body.newData;

    try {
        const user = await UserInputModel.findOneAndUpdate({ _id: id }, { $set: newData });
        return res.send({
            status: 200,
            message: "Update Successful",
            data: user
        })
    }
    catch (err) {
        return res.send({
            status: 400,
            message: "Database Error. Please try again",
            error: err
        })
    }
})

app.post("/delete-item", async (req, res) => {
    const id = req.body.id
    console.log(id)

    if (!id) {
        return res.send({
            status: 404,
            message: "missing params",
            error: "misssing id"
        })
    }
    try {
        const user = await UserInputModel.findOneAndDelete({ _id: id })
        return res.send({
            status: 200,
            message: "Successful",
            data: user
        })
    }
    catch (err) {
        return res.send({
            status: 400,
            message: "Database error...",
            error: err
        })
    }
})

app.post('/pagination_dashboard', isAuth, async (req, res) => {

    const skip = req.query.skip || 0;
    const LIMIT = 5;
    const username = req.session.user.username;

    try {

        let todos = await TodoModel.aggregate([
            { $match: { username: username } },
            { $sort: { todo: 1 } },
            {
                $facet: {
                    data: [{ $skip: parseInt(skip) }, { $limit: LIMIT }]
                }
            }
        ])

        return res.send({
            status: 200,
            message: "Read Successful",
            data: todos
        })

    }
    catch (err) {
        return res.send({
            status: 400,
            message: "Database error. Please try again"
        })
    }
})

app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;

        res.redirect("login")
    })
})



app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})