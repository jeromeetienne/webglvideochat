var express	= require('express');
var app		= express()
var server	= require('http').createServer(app);
var webRTC	= require('webrtc.io').listen(server);

var port = process.env.PORT || 8000;
server.listen(port);
console.log('listen on http://0.0.0.0:8000')


// export static files
app.use('/', express.static(__dirname + '/../'));

app.get('/rooms', function(req, res) {
	var rooms	= webRTC.rtc.rooms
	res.send(rooms)
})

app.get('/rouletteRoomName', function(req, res) {
	var rooms	= webRTC.rtc.rooms
	var roomNames	= Object.keys(rooms).filter(function(roomName){
		return roomName.match(/^lette-/);
	});
	// try to find a room with only one participant
	for(var i = 0; i < roomNames.length; i++){
		var roomName	= roomNames[i]
		var room	= rooms[roomName]
		if( room.length === 1 ){
			res.send({roomName:roomName})
			return;
		}
	}
	// pick a random name
	var roomName	= 'lette-' + Math.floor((Math.random()) * 0x10000).toString(16);
	res.send({roomName:roomName})
});

webRTC.rtc.on('connect', function(rtc) {
	//Client connected
});

webRTC.rtc.on('send answer', function(rtc) {
	//answer sent
});

webRTC.rtc.on('disconnect', function(rtc) {
	//Client disconnect 
});

webRTC.rtc.on('chat_msg', function(data, socket) {
	var roomList = webRTC.rtc.rooms[data.room] || [];

	for (var i = 0; i < roomList.length; i++) {
		var socketId = roomList[i];

		if (socketId !== socket.id) {
			var soc = webRTC.rtc.getSocket(socketId);

			if (soc) {
				soc.send(JSON.stringify({
					"eventName": "receive_chat_msg",
					"data": {
					"messages": data.messages,
					"color": data.color
				}
				}), function(error) {
					if (error) {
						console.log(error);
					}
				});
			}
		}
	}
});
