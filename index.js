const express = require('express');
const bodyParser = require('body-parser');
const api = require('./api');
const handler = require('./handler');
const dotenv = require('dotenv').config();
const app = express();
const router = express.Router();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
router.use(handler.check_session);

app.get("/", function(req, resp) {
    resp.send("Hello, Iam online now!");
});

app.post(api.LOGIN, handler.login);
app.post(api.LOGOUT, router, handler.logout);
app.post(api.CREATE_USER, router, handler.signup);
// app.post(api.CREATE_USER, handler.signup);

// app.post(api.GET_QUES, handler.get_ques);
app.post(api.GET_QUES, router, handler.get_ques);

app.listen(PORT, function() {
    console.log("Listening at PORT: " + PORT);
})