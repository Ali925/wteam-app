let self = this, users = {}, userCount = 0;
let displayName = getParameterByName('displayName', window.location.href);
let thisRoomId = getParameterByName('roomId', window.location.href);
		socket = io('https://api.wteam.chat/cursor', {
		    path: '/socket-service',
		    transports: ['websocket']
		});

		socket.on('connect', () => {
		  // either with send()
		  console.log("connected to socker server");
		  socket.emit("new_user", displayName);
		  setTimeout(() => {
		  	socket.emit("get_users", displayName);
		  }, 1000);
		});

		socket.on("all_users", (data) => {
			let allUsers = JSON.parse(data);
			console.log('all users: ', allUsers);
			//alert('all users: ' + Object.keys(allUsers).length);
			for(let i in users){
				if(!allUsers[i]){
					var elem = document.getElementById("cursor_"+i);
					elem.parentNode.removeChild(elem);
				}
			}

			users = {...allUsers};
		});

		socket.on('cursor_position_changed', (data) => {
			//console.log('cursor position changed!!!: ', JSON.parse(data));
			let ud = JSON.parse(data);
			let roomId = ud.roomId;
			let name = ud.name;
			// let videoWidth = ud.videoWidth;
			// let videoHeight = ud.videoHeight;
			let x = ud.x;
			x = Math.round((window.innerWidth * x) / 100);
			let y = ud.y;
			y = Math.round((window.innerHeight * y) / 100);
			let id = ud.id;

			if(!users[id]){
				//alert('roomId ' + roomId + ' thisRoomId ' + thisRoomId + ' id ' + id);
			}

			if(roomId && thisRoomId && id && roomId == thisRoomId){
				if(!document.getElementById("cursor_"+id)){
					console.log('new cursor detected: ', id, roomId, name);
						
						users[id] = {name: name, id: id};
						let el = document.createElement("DIV");
						let className = "cursor ";

						let index = Object.keys(users).indexOf(id);

						if(index%5 == 0){
							className = "cursor first";
						} else if(index%5 == 1){
							className = "cursor second";
						} else if(index%5 == 2){
							className = "cursor third";
						} else if(index%5 == 3){
							className = "cursor forth";
						} else if(index%5 == 4){
							className = "cursor fifth";
						}

						el.className = className;
						el.id = "cursor_" + id;
						el.style.top = (parseInt(y) - 22) + 'px';
						el.style.left = (parseInt(x) - 20) + 'px';
						el.style.position = 'absolute';
						let smel = document.createElement("SMALL");
						let textsmel = document.createTextNode(name);
						smel.appendChild(textsmel);
						let spel = document.createElement("SPAN");
						el.appendChild(spel);
						el.appendChild(smel);
						document.getElementsByTagName("body")[0].appendChild(el);
				} else {
					document.getElementById("cursor_"+id).style.top = (parseInt(y) - 22) + 'px';
					document.getElementById("cursor_"+id).style.left = (parseInt(x) - 20) + 'px';
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