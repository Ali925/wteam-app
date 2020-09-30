let self = this;
let displayName = getParameterByName('displayName', window.location.href);
let thisRoomId = getParameterByName('roomId', window.location.href);
		socket = io('https://api.wteam.chat', {
		    path: '/socket-service',
		    transports: ['websocket']
		});

		socket.on('connect', () => {
		  // either with send()
		  console.log("connected to socker server");
		  socket.emit("new_user", displayName);
		});

		socket.emit("get_users");

		socket.on("all_users", (data) => {
			let allUsers = JSON.parse(data);

			for(let i in users){
				if(!allUsers[i]){
					var elem = document.getElementById("cursor_"+i);
					elem.parentNode.removeChild(elem);
				}
			}

			users = {...allUsers};
		});

		socket.on('cursor_position_changed', (data) => {
			console.log('cursor position changed!!!: ', JSON.parse(data));
			let ud = JSON.parse(data);
			let roomId = ud.roomId;
			let name = ud.name;
			let x = ud.x;
			x = Math.round((window.innerWidth * x) / 100);
			let y = ud.y;
			y = Math.round((window.innerHeight * y) / 100);
			let id = ud.id;
			if(roomId == thisRoomId){
				if(!document.getElementById("cursor_"+id)){
						let el = document.createElement("DIV");
						el.className = "cursor";
						el.id = "cursor_" + id;
						el.style.top = y + 'px';
						el.style.left = x + 'px';
						el.style.position = 'absolute';
						let smel = document.createElement("SMALL");
						let textsmel = document.createTextNode(name);
						smel.appendChild(textsmel);
						let spel = document.createElement("SPAN");
						el.appendChild(spel);
						el.appendChild(smel);
						document.getElementsByTagName("body")[0].appendChild(el);
				} else {
					document.getElementById("cursor_"+id).style.top = y + 'px';
					document.getElementById("cursor_"+id).style.left = x + 'px';
				}
			}
		});

		function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}