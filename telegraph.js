var Telegraph = {
	/**
	 * Used to track a unique id to keep elements separate when callbacks are called.
	 */
	element_index : 0,
	
	/**
	 * The current pattern for each element with a listener.
	 */
	patterns : {},
	
	/**
	 * The last mousedown timestamp for each element.
	 */
	downStamps : {},
	
	/**
	 * The timers for adding letters and spaces to element values.
	 */
	letterTimers : {},
	spaceTimers : {},
	
	/**
	 * The input speed for each element.
	 */
	wpm : {},
	
	/**
	 * The international Morse code dictionary.
	 */
	dictionary : {
		"._":"a",
		"_...":"b",
		"_._.":"c",
		"_..":"d",
		".":"e",
		".._.":"f",
		"__.":"g",
		"....":"h",
		"..":"i",
		".___":"j",
		"_._":"k",
		"._..":"l",
		"__":"m",
		"_.":"n",
		"___":"o",
		".__.":"p",
		"__._":"q",
		"._.":"r",
		"...":"s",
		"_":"t",
		".._":"u",
		"..._":"v",
		".__":"w",
		"_.._":"x",
		"_.__":"y",
		"__..":"z",
		".____":"1",
		"..___":"2",
		"...__":"3",
		"...._":"4",
		".....":"5",
		"_....":"6",
		"__...":"7",
		"___..":"8",
		"____.":"9",
		"_____":"0"
	},
	
	/**
	 * Enable Morse code input on an element.
	 *
	 * @param {HTMLElement} el The element that the user clicks in Morse code on.
	 * @param {Object} [aConfig] Configuration options:
	 *     [wpm=10] Words per minute to use as basis.
	 */
	
	start : function (el, aConfig) {
		if (!el) {
			throw "Missing input element.";
			return;
		}
		
		if (el.hasAttribute("telegraph_index")) {
			// This element already has an active Telegraph instance.
			return false;
		}
		
		// Validate and provide default values for the config object.
		{
			if (!aConfig) aConfig = {};
			else if (typeof aConfig !== 'object') throw "Invalid config format.";
		
			var defaultConfig = {
				wpm : 10
			};
		
			for (var i in defaultConfig) {
				if (!(i in aConfig)) {
					aConfig[i] = defaultConfig[i];
				}
			}
		}
		
		var idx = Telegraph.element_index++;
		el.setAttribute("telegraph_index", idx);
		
		// Save the WPM for this element.
		Telegraph.wpm[idx] = aConfig.wpm;
		
		Telegraph.patterns[idx] = "";
		
		el.addEventListener("mousedown", Telegraph.down, false);
		el.addEventListener("mouseup", Telegraph.up, false);
		
		return true;
	},
	
	/**
	 * Stops Morse code input on a Telegraph input.
	 *
	 * @param {HTMLElement} el
	 */
	
	stop : function (el) {
		var idx = el.getAttribute("telegraph_index");
		
		el.removeEventListener("mousedown", Telegraph.down, false);
		el.removeEventListener("mouseup", Telegraph.up, false);
		
		clearTimeout(Telegraph.letterTimers[idx]);
		clearTimeout(Telegraph.spaceTimers[idx]);
		delete Telegraph.patterns[idx];
		delete Telegraph.downStamps[idx];
		delete Telegraph.wpm[idx];
		
		el.removeAttribute("telegraph_index");
	},
	
	/**
	 * A mousedown event on a Telegraph input.
	 *
	 * @param {MouseEvent} evt
	 */
	
	down : function (evt) {
		evt.preventDefault();
		evt.stopPropagation();
		
		var el = evt.target;
		var idx = el.getAttribute("telegraph_index");
		
		Telegraph.downStamps[idx] = Date.now();
		
		clearTimeout(Telegraph.letterTimers[idx]);
		clearTimeout(Telegraph.spaceTimers[idx]);
	},
	
	/**
	 * A mouseup event on a Telegraph input.
	 *
	 * @param {MouseEvent} evt
	 */
	
	up : function (evt) {
		evt.preventDefault();
		evt.stopPropagation();
		
		var up = Date.now();
		
		var el = evt.target;
		var idx = el.getAttribute("telegraph_index");
		
		var down = Telegraph.downStamps[idx];
		
		if (down !== null) {
			var duration = up - down;
			
			var dit = Math.round((60 / (Telegraph.wpm[idx] * 50)) * 1000);
			var dah = dit * 3;
			
			if (duration > dah) {
				Telegraph.patterns[idx] += "_";
			}
			else {
				Telegraph.patterns[idx] += ".";
			}
			
			function addSpace(el) {
				Telegraph.append(el, " ");
			}
			
			function checkPattern(el) {
				var idx = el.getAttribute("telegraph_index");
				
				var dit = Math.round((60 / (Telegraph.wpm[idx] * 50)) * 1000);
				
				if (Telegraph.patterns[idx] in Telegraph.dictionary) {
					clearTimeout(Telegraph.spaceTimers[idx]);
					
					Telegraph.append(el, Telegraph.dictionary[Telegraph.patterns[idx]]);
					Telegraph.patterns[idx] = "";
					
					// A pause seven units long signals the end of a word.
					// We've already waited three units.
					Telegraph.spaceTimers[idx] = setTimeout(addSpace, (dit * 4), el);
				}
				else if (Telegraph.patterns[idx].length >= 5) {
					Telegraph.patterns[idx] = Telegraph.patterns[idx].substr(1);
					checkPattern(el);
				}
			}
			
			// A pause three units long signals the end of a letter.
			Telegraph.letterTimers[idx] = setTimeout(checkPattern, dit * 3, el);
		}
	},
	
	/**
	 * Add a character to the value of an input element.
	 * 
	 * @param {HTMLElement} el
	 * @param {String} char
	 */
	
	append : function (el, char) {
		if (el.nodeName == 'INPUT') {
			el.value += char;
		}
		else if (el.nodeName == 'TEXTAREA') {
			el.innerHTML += char;
		}
		else {
			throw "Unsupported input element.";
		}
	}
};