var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	nicknames = [];

server.listen(3000);

app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
});
app.use('/public', express.static(__dirname + '/public'));

io.sockets.on('connection', function(socket) {
	socket.on('new user', function(data){
		console.log(data);
		if (nicknames.indexOf(data) != -1) {

		} else {
			socket.emit('chat', 'SERVER', 'Welcome ' + data);

			socket.nickname = data;
			nicknames.push(socket.nickname);
			io.sockets.emit('usernames', nicknames);
			updateNicknames();
		}
	});

	function updateNicknames(){
		io.sockets.emit('usernames', nicknames);
	}

	//
	socket.on('send message', function(data){
		io.sockets.emit('new message', { msg: data, nick: socket.nickname });
	});

	socket.on('disconnect', function(data){
		if (!socket.nickname) return;
		io.sockets.emit('chat', 'SERVER', socket.nickname + ' has leaved the chatroom!');
		nicknames.splice(nicknames.indexOf(socket.nickname), 1);
		updateNicknames();
	});
});

(function () {

    io.sockets.on('connection', function (socket) {

        //added clients
        socket.on("setClientId", function (data) {
            connectedClients[data.id] = { 
            	id : data.id, //adds key to a map
            	senderName : data.senderName
            }
            console.log(connectedClients);
        });

        //removes clients
        socket.on("deleteSharedById", function (data) {
            delete connectedClients[data.id]; //removes key from map
            socket.broadcast.emit("deleteShared",{ id : data.id}); //send to sender
        });
        
         //erases canvas
        socket.on("eraseRequestById", function (data) {
            socket.broadcast.emit("eraseShared",{ id : data.id}); 
        });

		//returns back a list of clients to the requester
        socket.on("getUserList", function (data) {
            socket.emit("setUserList", connectedClients); //send to sender
        });

        //request to share
        socket.on("requestShare", function (data) {
            socket.broadcast.emit("createNewClient", {
                listenerId: data.listenerId,
                senderId: data.senderId,
                senderName : data.senderName
            });
        });

        //drawing data
        socket.on('drawRequest', function (data) {
            socket.broadcast.emit('draw', {
                x: data.x,
                y: data.y,
                type: data.type,
                isTouchDevice : data.isTouchDevice,
                color: data.color,
                stroke: data.stroke,
                isLineDrawing: data.isLineDrawing,
                isErase: data.isErase,
                id: data.id
            });
        });

    });
}).call(this);