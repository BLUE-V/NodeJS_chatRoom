function divEscapedContentElement(message){
	return $('<div></div>').text(message);	
}

function divSystemContentElement(message){
	return $('<div></div>').html('<i>'+message+'</i>');
}

function processUserInput(chatApp, socket){
	var message=$('#send-message').val();
	var systemMessage;
	
	if(message.charAt(0)=='/'){//command
		systemMessage=chatApp.processCommand(message); //get processed messages
		if(systemMessage){
			$('#messages').append(divSystemContentElement(systemMessage));
		}
	}
	else{
		chatApp.sendMessage($('#room').text(), message);
		$('#messages').append(divEscapedContentElement(message));
		$('#messages').scrollTop($('#messages').prop('scrollHeight'));
	}

	$('send-message').val('');// after send,input become empty.
}

var socket=io.connect();//load socket.io from the client side

$(document).ready(function(){
	var chatApp=new Chat(socket);
	console.log(divSystemContentElement);
	//display nameChange
	socket.on('nameResult',function(result){
		var message;
		
		if(result.success){
			message='You ar known as '+result.name+'.';
		}else{
			message=result.message;
		}
		$('#messages').append(divSystemContentElement(message));
	});
	
	//display room
	socket.on('joinResult',function(result){
		$('#room').text(result.room);
		$('#messages').append(divSystemContentElement('Room changed.'));
	});
	
	//display messages
	socket.on('message',function(message){
		var newElement=$('<div></div>').text(message.text);
		$('#messages').append(newElement);
	});

	//display room list
	socket.on('rooms',function(rooms){
		$('#room-list').empty();

		for(var room in rooms){
			room=room.substring(1,room.length);
			if(room!=''){
				$('#room-list').append(divEscapedContentElement(room));
			}
		}
		$('#room-list div').click(function(){
			chatApp.processCommand('/join '+$(this).text());
			$('#send-message').focus();
		});
	});

	setInterval(function(){
		socket.emit('rooms');
	},1000);

	$('#send-message').focus();

	$('#send-form').submit(function(){
		processUserInput(chatApp,socket);
		return false;
	});
});