const db = require('./db');
const crypto = require('crypto');
const reader = require('node-xlsx');

let rq, index, temp;
let list_session = new Map();
let easy_ques = {},
    medium_ques = {},
    hard_ques = {};

for (i of reader.parse(`${__dirname}/data/easy.xlsx`)[0].data) {
    easy_ques[`_${i[0]}`] = {
        id: i[0],
        ques: i[1],
        answer_a: i[2],
        answer_b: i[3],
        answer_c: i[4],
        answer_d: i[5],
        correct_ans: i[6],
        level: "0"
    }
}

for (i of reader.parse(`${__dirname}/data/medium.xlsx`)[0].data) {
    medium_ques[`_${i[0]}`] = {
        id: i[0],
        ques: i[1],
        answer_a: i[2],
        answer_b: i[3],
        answer_c: i[4],
        answer_d: i[5],
        correct_ans: i[6],
        level: "1"
    }
}

for (i of reader.parse(`${__dirname}/data/hard.xlsx`)[0].data) {
    hard_ques[`_${i[0]}`] = {
        id: i[0],
        ques: i[1],
        answer_a: i[2],
        answer_b: i[3],
        answer_c: i[4],
        answer_d: i[5],
        correct_ans: i[6],
        level: "2"
    }
}

function gen_session(email, roles) {
    let ssid = crypto.randomBytes(16).toString("base64");
    list_session.set(email, {
        ssid: ssid,
        roles: roles,
        easy_id: Array.from(Array(Object.keys(easy_ques).length).keys()),
        medium_id: Array.from(Array(Object.keys(medium_ques).length).keys()),
        hard_id: Array.from(Array(Object.keys(hard_ques).length).keys())
    });
    return ssid;
}

let check_session = function(req, resp, next) {
    rq = req.body;
    console.log("========= CHECK SESSION ========");
    console.log(rq);
    if (!rq.ssid || rq.ssid.trim() == "") {
        resp.status(422);
        resp.json({ msg: "SessionID is required" });
        return;
    }

    if (!rq.email || rq.email.trim() == "") {
        resp.status(422);
        resp.json({ msg: "Email is required" });
        return;
    }

    if (!list_session.has(rq.email)) {
        resp.status(401);
        resp.json({ msg: "User is not logined" });
        return;
    }

    if (list_session.get(rq.email).ssid != rq.ssid.trim()) {
        resp.status(498);
        resp.json({ msg: "Your session is expired" });
        return;
    }

    if (list_session.has(rq.email) && list_session.get(rq.email).ssid.toString() === rq.ssid.trim().toString()) {
        next();
    } else {
        resp.status(500);
        resp.json({ msg: "Unknow error" });
    }
};

let login = function(req, resp) {
    console.log("========= LOGIN ========");
    rq = req.body;
    if (!rq.email || rq.email.trim() == "") {
        resp.status(422);
        resp.json({ msg: "Email is required" });
        return;
    }

    if (!rq.password || rq.password.trim() == "") {
        resp.status(422);
        resp.json({ msg: "Password is required" });
        return;
    }

    db.login(rq.email, rq.password).then(function(res) {
        console.log("User " + res.msg[0].username + " logined");
        resp.status(200);
        resp.json({ "ssid": gen_session(rq.email, res.msg[0].roles), "username": res.msg[0].username, "roles": res.msg[0].roles });
    }).catch(function(err) {
        resp.status(404);
        resp.json({ msg: "Account is not exist!" });
    });
};

let logout = function(req, resp) {
    list_session.delete(req.email);
    resp.status(200);
    resp.json({ msg: "Logout success!" });
}

let signup = function(req, resp) {
    console.log("========= SIGNUP ========");
    rq = req.body;
    if (!rq.username || rq.username.trim() == "") {
        resp.status(422);
        resp.json({ msg: "Username is required" });
        return;
    }

    if (!rq.email || rq.email.trim() == "") {
        resp.status(422);
        resp.json({ msg: "Email is required" });
        return;
    }

    if (!rq.password || rq.password.trim() == "") {
        resp.status(422);
        resp.json({ msg: "Password is required" });
        return;
    }

    if (!rq.dob || rq.dob.trim() == "") {
        resp.status(422);
        resp.json({ msg: "Dob is required" });
        return;
    }

    if (!rq.sex || rq.sex.trim() == "") {
        resp.status(422);
        resp.json({ msg: "Sex is required" });
        return;
    }

    if (!rq.roles || (Number(rq.roles) < 0 || Number(rq.roles) > 1)) {
        resp.status(422);
        resp.json({ msg: "Roles is required and roles only 0 or 1" });
        return;
    }

    //Create user
    db.signup(rq.email, rq.username, rq.password, rq.dob, rq.sex, rq.roles).then(function(res) {
        if (res.code == 200) {
            resp.status(200);
            resp.json({ msg: "insert ok" });
        }
    }).catch(err => {
        resp.status(err.code);
        resp.json({ msg: err.msg.sqlMessage });
    });
};

let get_ques = function(req, resp) {
    console.log("========= GET QUESTION ========");
    rq = req.body;
    console.log(rq);
    if (rq.level < -1) {
        resp.status(422);
        resp.json({ msg: "Level is required!" });
        return;
    }

    switch (Number(rq.level)) {
        case 0:
            //easy
            console.log("Level 0");
            index = Math.floor(Math.random() * list_session.get(rq.email).easy_id.length);
            list_session.get(rq.email).easy_id.splice(index, 1);
            if (list_session.get(rq.email).easy_id.length == 1) {
                temp = list_session.get(rq.email);
                temp.easy_id = Array.from(Array(Object.keys(easy_ques).length).keys())
                list_session.set(rq.email, temp);
            }
            resp.status(200);
            resp.json(easy_ques[`_${index}`]);
            break;
        case 1:
            //medium
            console.log("Level 1");
            index = Math.floor(Math.random() * list_session.get(rq.email).medium_id.length);
            list_session.get(rq.email).medium_id.splice(index, 1);
            if (list_session.get(rq.email).medium_id.length == 1) {
                temp = list_session.get(rq.email);
                temp.medium_id = Array.from(Array(Object.keys(medium_ques).length).keys())
                list_session.set(rq.email, temp);
            }
            resp.status(200);
            resp.json(medium_ques[`_${index}`]);
            break;
        case 2:
            //hard
            console.log("Level 2");
            index = Math.floor(Math.random() * list_session.get(rq.email).hard_id.length);
            list_session.get(rq.email).hard_id.splice(index, 1);
            if (list_session.get(rq.email).hard_id.length == 1) {
                temp = list_session.get(rq.email);
                temp.hard_id = Array.from(Array(Object.keys(hard_ques).length).keys())
                list_session.set(rq.email, temp);
            }
            resp.status(200);
            resp.json(hard_ques[`_${index}`]);
            break;
        default:
            resp.status(422);
            resp.json({ msg: "Level from 0-2" });
    }
};

module.exports = {
    check_session: check_session,
    login: login,
    logout: logout,
    signup: signup,
    get_ques: get_ques
};