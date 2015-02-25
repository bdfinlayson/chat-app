'use strict'

$(document).ready(function() { 			
	$('.chat').toggle()
	$('#chatWindow').toggle()
	$('.find').toggle()
});

var fb = new Firebase('https://chatin-app.firebaseio.com/');

$('#registerButton').on('click', function() {
	var user = $('#user').val();
	console.log(user);
	var password = $('#password').val();
	console.log(password)
	fb.createUser({
		'email': user,
		'password': password
	}, function(error, userData) {
	  if (error) {
		switch (error.code) {
		  case "EMAIL_TAKEN":
			alert('This email is already in use.');
			clear()
			break;
		  case "INVALID_EMAIL":
		    alert('The specified email is not valid.');
		    clear()
		    break;
		  default:
		    alert('Error creating user:', error);
		    clear()
		  }
		} else {
			alert('User account created successfully! Please login to access your account!');
			console.log('User created successfully with uid: ', userData.uid);
			clear()
			$('#registerButton').hide("slow")
		}
	});
});

$('#loginButton').on('click', function() {
	var user = $('#user').val();
	console.log(user);
	var password = $('#password').val();
	console.log(password)
	fb.authWithPassword({
		'email': user,
		'password': password
	}, function(error, authData) {
		if (error) {
			alert('Login Failed!', error);
			clear()
		} else {
			alert('Login successful! Welcome ' + user + '!')
			console.log('Authenticated successfully with payload:', authData);
			clear()
			printUserName(authData)
			$('.login').hide('slow')
			$('.find').toggle()
			$('.chat').toggle()
			$('#chatWindow').toggle()
		}
	});
});

$('#findButton').on('click', function() {
	var string = $('#findMessage').val()
	fb.orderByChild('userMessage').equalTo(string).once('value', function(snapshot) {
		var userInfo = fb.getAuth()
		console.log(userInfo)
		var uid = userInfo.uid
		console.log(uid)
		var snap = snapshot.val()
		console.log(snap)
		//console.log(snap.userMessage)
		clearFind()
	})
})

$('#logoutButton').on('click', function() {
	fb.unauth();
	alert('Logout successful! Come back soon!')
	clear();
	$('.login').show()
	$('.chat').hide('slow')
	$('#chatWindow').hide('slow')
	$('.find').toggle()
});

$('#submitButton').on('click', function() {
  var data = fb.getAuth()
  var name = data.password.email
  console.log(name);
  var message = $('#userMessage').val();
  console.log(message);
  sendToFb(name, message);
  clearMessage()
})

function sendToFb(name, message) {

  fb.push({
  	userName: name,
  	userMessage: message
  });
}

fb.limitToLast(20).on('child_added', function(DataSnapshot) {
	console.log('This is from fb.once: ' + DataSnapshot.val());
	console.log(DataSnapshot.val());
	var message = DataSnapshot.val();
	console.log(message.userMessage);
	console.log(message.userName);
	printMessages(message.userName, message.userMessage)
	if ($('tr').length > 20) {
		clearLastMessageRow()
	}
	//clearLastMessageRow()
})

function printMessages(name, message) {
	$('tbody').prepend('<tr><td class="chatName">' + name + '</td><td class="chatMessage">' + message + '</td></tr>');
}

function printUserName(data) {
  $('#userName').text(data.password.email)
}

function clear() {

	$('input[type="text"]').val('');
	$('#userName').text('');
}

function clearMessage() {
	$('#userMessage').val('')
}

function clearLastMessageRow() {
	$('tr:last-of-type').remove()
}

function clearFind() {
	$('#findMessage').val('')
}