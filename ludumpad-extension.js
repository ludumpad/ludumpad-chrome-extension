var elemBody = document.body;

// triggerKeyEvent is implemented as follows:
function triggerKeyEvent(element, keyevent, charCode) {
    // We cannot pass object references, so generate an unique selector
    var attribute = 'robw_' + Date.now();
    element.setAttribute(attribute, '');
    var selector = element.tagName + '[' + attribute + ']';

    var s = document.createElement('script');
    s.textContent = '(' + function(keyevent, charCode, attribute, selector) {
        // Get reference to element...
        var element = document.querySelector(selector);
        element.removeAttribute(attribute);

        // Create KeyboardEvent instance
        var event = document.createEvent('KeyboardEvents');
        event.initKeyboardEvent(
            /* type         */ keyevent,
            /* bubbles      */ true,
            /* cancelable   */ false,
            /* view         */ window,
            /* keyIdentifier*/ '',
            /* keyLocation  */ 0,
            /* ctrlKey      */ false,
            /* altKey       */ false,
            /* shiftKey     */ false,
            /* metaKey      */ false,
            /* altGraphKey  */ false
        );
        // Define custom values
        // This part requires the script to be run in the page's context
        var getterCode = {get: function() {return charCode}};
        var getterChar = {get: function() {return String.fromCharCode(charCode)}};
        Object.defineProperties(event, {
            charCode: getterCode,
            which: getterChar,
            keyCode: getterCode, // Not fully correct
            key: getterChar,     // Not fully correct
            char: getterChar
        });

        element.dispatchEvent(event);
    } + ')("' + keyevent + '", ' + charCode + ', "' + attribute + '", "' + selector + '")';
    (document.head||document.documentElement).appendChild(s);
    s.parentNode.removeChild(s);
}

var body = $('body')
//var canvasDOM = $('<canvas style="position:fixed;top:0px;left:0px;" id="ludumpadUIcanvas"></canvas>')
var qrDOM = $('<div id="ludumpadqr" style="position:fixed;top:-500px;right:30px; transition: top 1s; border: 5px solid white"></div>');
body.append(qrDOM);

//var canvas = canvasDOM[0];
//var ctx = canvas.getContext('2d');

console.log

/*
$(window).resize(function() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}.bind(this));
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
*/

LudumPad.debugMode();
//LudumPad.UI.configure({canvas:canvas, ctx:ctx});

var channel = new LudumPad.Channel ();
channel.open();

channel.on('open', function () {
	var ludumpadButton = $('<div id="ludumpadButton"><p>Lp</p></div>');
	body.append(ludumpadButton);
	ludumpadButton.on('click', function () {
		toogleLudumPadScreen();
	});
});

channel.on('GamepadConnection', function (gamepad) {

	var dpadPiece = new LudumPad.GamepadType (LudumPad.GamepadTypeDPAD);
	var dpadPiece2 = new LudumPad.GamepadType (LudumPad.GamepadTypeDPAD);
	var gamepadType = [dpadPiece, dpadPiece2];

	gamepad.color = '#'+Math.floor(Math.random()*16777215).toString(16);
	channel.emitConfigurationToGamepads([gamepad], {
		bgcolor: gamepad.color,
		index: gamepad.index});
	gamepad.setTypes(gamepadType);

});

var keyCodes = [
	//WASD
	/*
	{
		'none' : -1,
		'left' : 'A'.charCodeAt(0),
		'right' : 'D'.charCodeAt(0),
		'up' : 'W'.charCodeAt(0),
		'down' : 'S'.charCodeAt(0)
	},
	*/
	{
		'none' : -1,
		'left' : 37,
		'right' : 39,
		'up' : 38,
		'down' : 40
	},
	{
		'none' : -1,
		'left' : 65,
		'right' : 68,
		'up' : 87,
		'down' : 83
	},
];

var stringForKey = {
	0 : 'up',
	1 : 'right',
	2 : 'down',
	3 : 'left',
	'-1' : 'none'
};

channel.on('PacketFromGamepad', function (packet, gamepad) {

	var i = gamepad.index;
	var dpadPiece = gamepad.types[0];
	var dpadPiece2 = gamepad.types[1];

	var keys = keyCodes[i];

	if (dpadPiece.dpad != dpadPiece._old) {
		dpadKeyPressed(keys[ stringForKey[dpadPiece._old] ], false);
		dpadKeyPressed(keys[ stringForKey[dpadPiece.dpad] ], true);
	}
	if (dpadPiece2.dpad != dpadPiece2._old) {
		if (dpadPiece2.dpad != -1) pressedKey(keys['up'], true);
		else pressedKey(keys['up'], false);
	}
});

/*
var ludumpadScreen = $('<div id="ludumpad_wrapper"><div id="ludumpad_cell"><h1 id="ludumpadTitle">LudumPad</h1></div></div>');
var screenActive = false;
*/

var init = false;
function ludumpadInit () {
	if (init || !channel.connected) return;
	init = true;
	//body.append(canvasDOM);
	var qrcode = new QRCode("ludumpadqr", {
		text: "http://bluecodestudio.com/ludumpad/gamepadPrompt.html?host="+channel.host+"&channel="+channel.channelID+"&port="+channel.port,
		width: 150,
		height: 150,
		colorDark : "#000000",
		colorLight : "#ffffff",
		correctLevel : QRCode.CorrectLevel.H
	});
	qrDOM.css('top', '130px');
	//requestAnimationFrame(main);
}

function toogleLudumPadScreen () {

	ludumpadInit();

	/*
	if (screenActive) {
		screenActive = false;
		ludumpadScreen.removeClass('active');
		setTimeout(function () {
			body.remove(ludumpadScreen);
		}, 500);
	} else {
		screenActive = true;
		body.append(ludumpadScreen);
		setTimeout(function () {
			ludumpadScreen.addClass('active');
		}, 1);
	}
	*/

}

function pressedKey (key, pressed) {
	if (pressed) {
		triggerKeyEvent(elemBody, "keydown", key);
		triggerKeyEvent(elemBody, "keypress", key);
	} else {
		triggerKeyEvent(elemBody, "keyup", key);
	}
}

function dpadKeyPressed (dpad, pressed) {
	if (dpad == -1 || dpad == undefined) return;
	pressedKey(dpad, pressed);
	/*
	switch (dpad) {
		case 0: pressedKey(38, pressed);
		break;
		case 1: pressedKey(39, pressed);
		break;
		case 2: pressedKey(40, pressed);
		break;
		case 3: pressedKey(37, pressed);
	}
	*/
}

function main () {
	requestAnimationFrame(main);
	ctx.clearRect(0,0,canvas.width,canvas.height);
	LudumPad.UI.render(); // UI render
}