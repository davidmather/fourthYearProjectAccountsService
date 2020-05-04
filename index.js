const path = require('path');
let grpc = require("grpc");
var protoLoader = require("@grpc/proto-loader");
const PROTO_PATH = path.join(__dirname, 'protos/accounts.proto');
const server = new grpc.Server();
const SERVER_ADDRESS = process.env.GRPC_SERVER || "localhost:5001";
const mysql = require('mysql');

// Load protobuf
let proto = grpc.loadPackageDefinition(
    protoLoader.loadSync(PROTO_PATH, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    })
);

var ActiveUsers = [];

function register(call, callback) {
    const { username, password, email } = call.request; // call.request will match the input from our .proto file
    const result = "logged in successfully";
    console.log(call.request);
    const loginTime = Math.floor(Date.now() / 1000);

    var con = mysql.createConnection({
        host:  process.env.MYSQL_HOST || "127.0.0.1",
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "changeme",
        database: process.env.MYSQL_DATABASE || "Microservices3"
    });

    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        let sql = "INSERT INTO customer (name, password, email) VALUES ('"+username+"', '"+password+"', '"+email+"')";
        con.query(sql, function (err, result) {
            if (err) {
                callback(null, { result:JSON.stringify({success:false})});
            } else {
                console.log("1 record inserted");
                let found = false;
                for (var i = 0; i < ActiveUsers.length; i++){
                    if (ActiveUsers[i].username === email){
                        ActiveUsers[i].loginTime = loginTime;
                        found = true;
                    }
                }
                if(!found){ActiveUsers.push({
                    username:email,
                    loginTime:loginTime
                })}
                console.log(ActiveUsers);
                console.log("query:","SELECT * FROM customer where email='"+email+"' and password='"+password+"'");
                con.query("SELECT * FROM customer where email='"+email+"' and password='"+password+"'", function (err, result, fields) {
                    if (err) {
                        // The output on the callback should also match the output
                        // in out .proto file
                        callback(null, { result:JSON.stringify({username:username, ActiveUsers:ActiveUsers, success:false})});
                    } else {
                        console.log(result);

                        let found = false;
                        for (var i = 0; i < ActiveUsers.length; i++) {
                            if (ActiveUsers[i].username === username) {
                                ActiveUsers[i].loginTime = loginTime;
                                found = true;
                            }
                        }
                        if (!found) {
                            ActiveUsers.push({
                                username: username,
                                loginTime: loginTime
                            })
                        }
                        console.log(ActiveUsers);

                        console.log(result);

                        // The output on the callback should also match the output
                        // in out .proto file
                        // The output on the callback should also match the output
                        // in out .proto
                        let response = JSON.stringify({username:username, cid:result[0].customerID,ActiveUsers:ActiveUsers, success:true});
                        callback(null, { result:response});
                    }
                });


            }

        });
    });


}

// Receive message from client joining
function logout(call, callback) {
    const { cid, password } = call.request; // call.request will match the input from our .proto file
    var con = mysql.createConnection({
        host:  process.env.MYSQL_HOST || "127.0.0.1",
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "changeme",
        database: process.env.MYSQL_DATABASE || "Microservices3"
    });

    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        con.query("SELECT email FROM customer where customerID='"+cid+"' and password='"+password+"'", function (err, result, fields) {
            if (err) {
                callback(null, { result:JSON.stringify({success:false})});
            } else {
                console.log(call.request);
                console.log(result[0].email);
                let found = false;
                for (var i = 0; i < ActiveUsers.length; i++){
                    if (ActiveUsers[i].username === result[0].email){
                        found = true;
                        delete ActiveUsers[i];
                    }
                }
                // The output on the callback should also match the output
                // in out .proto file
                callback(null, { result:JSON.stringify({success:true})});
            }
        });

    });


    callback(null, { result:JSON.stringify({success:true})});
    console.log(ActiveUsers);

}

// Receive message from client joining
function verify(call, callback) {
    const { customerId, password } = call.request; // call.request will match the input from our .proto file
    const result = "verified successfully";
    console.log(call.request);
    const loginTime = Math.floor(Date.now() / 1000);

    var con = mysql.createConnection({
        host:  process.env.MYSQL_HOST || "127.0.0.1",
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "changeme",
        database: process.env.MYSQL_DATABASE || "Microservices3"
    });

    con.connect(function(err) {
        if (err) throw err;
        console.log("SELECT * FROM customer where customerID='"+customerId+"' and password='"+password+"'");
        con.query("SELECT * FROM customer where customerID='"+customerId+"' and password='"+password+"'", function (err, result, fields) {
            if (err) {
                callback(null, { result:JSON.stringify({success:false})});
            } else {
                console.log(result);

                let found = false;

                // The output on the callback should also match the output
                // in out .proto file
                callback(null, {result: JSON.stringify({
                        username:result[0].name,
                        cid:result[0].customerID,
                        admin:result[0].admin,
                        ActiveUsers:ActiveUsers,
                        success:true
                    })});
            }
        });
    });

}


// Receive message from client joining
function login(call, callback) {
    const { username, password } = call.request; // call.request will match the input from our .proto file
    const result = "logged in successfully";
    console.log(call.request);
    const loginTime = Math.floor(Date.now() / 1000);

    var con = mysql.createConnection({
        host:  process.env.MYSQL_HOST || "127.0.0.1",
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "changeme",
        database: process.env.MYSQL_DATABASE || "Microservices3"
    });

    con.connect(function(err) {
        if (err) throw err;
        console.log("SELECT * FROM customer where email='"+username+"' and password='"+password+"'");
        con.query("SELECT * FROM customer where email='"+username+"' and password='"+password+"'", function (err, result, fields) {
            if (err) {
                callback(null, { result:JSON.stringify({success:false})});
            } else {
                console.log(result);

                let found = false;
                for (var i = 0; i < ActiveUsers.length; i++) {
                    if (ActiveUsers[i].username === username) {
                        ActiveUsers[i].loginTime = loginTime;
                        found = true;
                    }
                }
                if (!found) {
                    ActiveUsers.push({
                        username: username,
                        loginTime: loginTime
                    })
                }
                console.log(ActiveUsers);

                // The output on the callback should also match the output
                // in out .proto file
                callback(null, {result: JSON.stringify({
                    username:username,
                    cid:result[0].customerID,
                    admin:result[0].admin,
                    ActiveUsers:ActiveUsers,
                    success:true
                })});
            }
        });
    });

}

// Receive message from client joining
function getActiveUsers(call, callback) {
    const { cid, password } = call.request; // call.request will match the input from our .proto file
    console.log(call.request);
    console.log("get active users");
    callback(null, { result:JSON.stringify(ActiveUsers)});
}

const exposedFunctions = {
    login: login,
    register: register,
    logout: logout,
    verify: verify,
    getActiveUsers, getActiveUsers
};

// Define server with the methods and start it
server.addService(proto.example.Account.service, exposedFunctions);
server.bind(SERVER_ADDRESS, grpc.ServerCredentials.createInsecure());
server.start();
module.exports = server;
