// content_script
// icon from Kütük on iconfinder.com

var skip = new RegExp("^(?:HLT|SCRIPT)$");
var matchRegex = "";
var script = "on";
var word;

function setRegexFor(text) {
	var thisWord = "(\\b" + text + ")\\b"; //must set double \\ for it to work. original: (\b+text+)\b
	matchRegex = new RegExp(thisWord, "gi");
}

function highlight_words(node, color) {
	if (node !== 'undefined' || node.length !== 1) {
		if (skip.test(node.nodeName)) {
			return;
		}

		if (node.hasChildNodes()) {
			for (var i = 0; i < node.childNodes.length; i++) {
				this.highlight_words(node.childNodes[i], color);
			}
		}

		if (node.nodeType == 3 && /\S/.test(node.nodeValue)) {
			var test = matchRegex.exec(node.nodeValue);
			if (test) {
				var content = node.nodeValue;
				content = content.replace(matchRegex, '<span class="HLT" style="background-color:#33cc33">' + word + '</span>');
				var enclaveNode = document.createElement("HLT");
				enclaveNode.appendChild(document.createTextNode(test[0]));
				enclaveNode.style.backgroundColor = color;
				enclaveNode.style.color = "#000";

				var exclaveNode = node.splitText(test.index);
				exclaveNode.nodeValue = exclaveNode.nodeValue.substring(test[0].length);
				node.parentNode.insertBefore(enclaveNode, exclaveNode);
			}
		}
	}
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.message) {
		if (request.message === "on") {
			script = "on";
		}
		if (request.message === "off") {
			script = "off";
			removeAll();
		}
		if (request.message === "delete_highlights") {
			removeAll();
		}
	}

	if (request.highlightText) {
		getSelectionText(request.highlightText, request.color);
	}
	
});

function removeAll() {
	var arr = document.getElementsByTagName('HLT');
	localStorage.removeItem("highlightTexts");
	while (arr.length && (el = arr[0])) {
		var parent = el.parentNode;
		parent.replaceChild(el.firstChild, el);
		parent.normalize();
	}
}

function getSelectionText(text, color) {
	var targetNode = document.body;
	if (text.length > 1 && text.replace(/^\s+|\s+$/gm, '').length !== 0) {
    var thisWord = text;
    // var thisWord = text.replace(/(\^|\$|\.|\*|\?|\(|\)|\+|\\)/ig, "\\$1");
    // var thisWord = text.replace(/ /g, "").replace(/[^a-zA-Z 0-9\n\r]+/g, '');
    
		
		if (thisWord !== '') {
			word = thisWord;
			setRegexFor(word);
			highlight_words(targetNode, color);
		}
	} else {
		removeAll();
	}
}

document.body.addEventListener('dblclick', function () {
	if (script === "on") {
		var text = "";
		if (window.getSelection) {
			text = window.getSelection().toString();
		} else if (document.selection && document.selection.type != "Control") {
			text = document.selection.createRange().text;
		}
		sendMsg({"highlightText" : text});
	} else {
		removeAll();
	}
});

document.body.addEventListener('mouseup', function () {
	if (script === "on") {
		var text = "";
		if (window.getSelection) {
			text = window.getSelection().toString();
		} else if (document.selection && document.selection.type != "Control") {
			text = document.selection.createRange().text;
		}
		sendMsg({"highlightText" : text});
	} else {
		removeAll();
	}
});

document.body.addEventListener('mousedown', function (event) {
  if (event.button === 1) removeAll();
});

function sendMsg(data) {
	chrome.runtime.sendMessage(data, function(response) {
		// console.log(response);
	});
}

// var text = "";
// 	
