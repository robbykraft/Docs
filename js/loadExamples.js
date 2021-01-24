// this will create a <script> element, fill it with javascript code that
// is meant to create an SVG using this library, and place it inside element #id
//
// it uses window-bound objects to communicate with each page individually
// the type of values in each of these are strings:
// - window.Callback is a custom event callback handler for responding to events
// - window.ExamplesHeader is code to inject at the top of the script
// - window.ExamplesFooter is code to inject at the bottom of the script
var EarCodeEditorURL = "//svg.rabbitear.org";
var EarExampleURL = "/examples/";

var appendScript = (id, code, options = {}) => {
	var canvasID = "#canvas-" + id;
	// link the callback by creating a pointer on the window object. randomize the name
	var callbackString = "";
	if (options.callback && options.callback[id]) {
		var rand = Math.random().toString(36).replace(/[^a-z]+/g, '');
		window[id + rand] = options.callback[id];
		callbackString = 'var callback = window["' + id + rand + '"]\n';
	}
	// inject the header and footer simply as strings in the code
	var headerString = options.header && options.header[id]
		? options.header[id]
		: "";
	var footerString = options.footer && options.footer[id]
		? options.footer[id]
		: "";
	var head = 'ear.svg(document.querySelector("' + canvasID + '"), (svg) => {\n'
		+ headerString  + '\n'
		+ callbackString;
  var foot = "\n" + footerString + "\n});\n";
 
	// this script element will create a SVG inside the #id element when it runs
  var script = window.document.createElement("script");
  script.innerHTML = head + code + foot;
  document.body.appendChild(script);
  // create floating source code hyperlink next to the sketch
  var node = window.document.querySelector(canvasID);
  if (node) {
    var scriptLink = window.document.createElement("div");
    scriptLink.className = "script-link";
    scriptLink.onclick = function (e) {
      e.preventDefault();
      window.location.href = EarCodeEditorURL + "?example=" + id;
    }
    node.appendChild(scriptLink);
  } else {
		console.log(id + " could not locate div to append");
	}
};

var headers = new Headers();
headers.append("pragma", "no-cache");
headers.append("cache-control", "no-cache");
var fetch_options = {
	method: "GET",
	headers: headers,
};

var loadExamples = function (filenames, options) {
	filenames.forEach(function (id) {
  	fetch(EarExampleURL + id + ".js", fetch_options)
    	.then(function(body) { return body.text(); })
    	.then(function(text) { return appendScript(id, text, options); })
			.catch(function(err) { console.log("problem loading " + id, err); });
	});
};

