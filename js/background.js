var toggle;

/*
if(chrome && chrome.storage){
	chrome.storage.local.get('app', function(result){
        toggle = result;
        sendMsg(toggle);
        sendMsg("toggle is: "+toggle);
    });
}*/

function sendMsg(data) {
	chrome.tabs.query({
		active : true,
		currentWindow : true
	}, function (tabs) {
		var tab = tabs[0]; // do not forget to declare "tab" variable
		chrome.tabs.sendMessage(tab.id, {
			"message" : data
		}, function (response) {});
	});
}

function check(tab) {
	if (toggle === "on") {
		chrome.browserAction.setIcon({
			path : "img/highlight16.png",
		});
	} else if (toggle === "off") {
		chrome.browserAction.setIcon({
			path : "img/highlightOff16.png",
		});
	} else {
		toggle = "off";
		check(); //chrome.storage firstrun here
	}
	chrome.browserAction.setTitle({
		title : "Highlight is " + toggle
	});
	sendMsg(toggle);
}

// When a tab gets activated
chrome.tabs.onActivated.addListener(function () {
	check();
});


// When a tab is updated
chrome.tabs.onUpdated.addListener(function () {
	check();
});

chrome.runtime.onStartup.addListener(function () {
	check();
});

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function (tab) {
	if (toggle === "on") {
		//chrome.storage.local.set({'app': "off"});
		sendMsg("delete_highlights");
		toggle = "off";
		check();
	} else {
		toggle = "on";
		//chrome.storage.local.set({'app': "on"});
		check();
	}
});

// get messages from content scripts
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.message) {
		toggle = request.message;
	}
	if (request.highlightText) {
		// pushTextIntoLocalStorage("highlightTexts", request.highlightText);
		color=generateColor(['red', 'Chartreuse', 'cyan', 'GreenYellow', 'LimeGreen', 'blue', 'orange', 'yellow']);
		sendAll(request.highlightText, color);
	}
});
check();
//make icon credit
//end here
function pushTextIntoLocalStorage(field, text) {
	if (localStorage.getItem(field) === null) {
		localStorage.setItem(field, JSON.stringify([text]));
	} 
	else {
		oldArray = JSON.parse(localStorage.getItem(field));
		oldArray.push(text);
		localStorage.setItem(field, JSON.stringify(oldArray));
	}
}

function sendAll(data, color) {

	chrome.tabs.query({}, function (tabs) {
		for (var i = 0; i < tabs.length; i++) {
			chrome.tabs.sendMessage(tabs[i].id, { 
				"highlightText" : data,
				"color" : color,
			}, function (response) {

			});                       
		}
	});
}

function generateColor(colors = ['red', 'Chartreuse', 'cyan', 'GreenYellow', 'LimeGreen', 'blue', 'orange', 'yellow']) {
	return colors[Math.floor(Math.random() * colors.length)];
}
