/*! eq.js (with polyfills) v1.7.0 (c) 2013-2015 Sam Richard with thanks to the Financial Times, MIT license */
(function () {if (!('getPrototypeOf' in Object
)){Object.getPrototypeOf = function getPrototypeOf(object) {
	if (object !== Object(object)) {
		throw new TypeError('Object.getPrototypeOf called on non-object');
	}

	return object.constructor ? object.constructor.prototype : null;
};
}if (!('requestAnimationFrame' in this
)){(function (global) {
	'use strict';

	var
	lastTime = Date.now();

	// <Global>.requestAnimationFrame
	global.requestAnimationFrame = function (callback) {
		if (typeof callback !== 'function') {
			throw new TypeError(callback + 'is not a function');
		}
		
		var
		currentTime = Date.now(),
		delay = 16 + lastTime - currentTime;

		if (delay < 0) {
			delay = 0;
		}

		lastTime = currentTime;

		return setTimeout(function () {
			lastTime = Date.now();

			callback(performance.now());
		}, delay);
	};

	// <Global>.cancelAnimationFrame
	global.cancelAnimationFrame = function (id) {
		clearTimeout(id);
	};
})(this);
}if (!((function(global) {

	if (!('Event' in global)) return false;
	if (typeof global.Event === 'function') return true;

	try {

		// In IE 9 and 10, the Event object exists but cannot be instantiated
		new Event('click');
		return true;
	} catch(e) {
		return false;
	}
}(this))
)){this.Event = function Event(type, eventInitDict) {
	if (!type) {
		throw new Error('Not enough arguments');
	}

	var
	event = document.createEvent('Event'),
	bubbles = eventInitDict && eventInitDict.bubbles !== undefined ? eventInitDict.bubbles : false,
	cancelable = eventInitDict && eventInitDict.cancelable !== undefined ? eventInitDict.cancelable : false;

	event.initEvent(type, bubbles, cancelable);

	return event;
};
}if (!('CustomEvent' in this &&

// In Safari, typeof CustomEvent == 'object' but it otherwise works fine
(typeof this.CustomEvent === 'function' ||
(this.CustomEvent.toString().indexOf('CustomEventConstructor')>-1))
)){this.CustomEvent = function CustomEvent(type, eventInitDict) {
	if (!type) {
		throw Error('TypeError: Failed to construct "CustomEvent": An event name must be provided.');
	}

	var event;
	eventInitDict = eventInitDict || {bubbles: false, cancelable: false, detail: null};

	try {
		event = document.createEvent('CustomEvent');
		event.initCustomEvent(type, eventInitDict.bubbles, eventInitDict.cancelable, eventInitDict.detail);
	} catch (error) {
		// for browsers which don't support CustomEvent at all, we use a regular event instead
		event = document.createEvent('Event');
		event.initEvent(type, eventInitDict.bubbles, eventInitDict.cancelable);
		event.detail = eventInitDict.detail;
	}

	return event;
};

CustomEvent.prototype = Event.prototype;
}if (!('addEventListener' in this
)){document.attachEvent('onreadystatechange', function() {
	if (document.readyState === 'complete') {
		document.dispatchEvent(new Event('DOMContentLoaded', {
			bubbles: true
		}));
	}
});
}if (!('getComputedStyle' in this
)){(function (global) {
	function getComputedStylePixel(element, property, fontSize) {
		var
		// Internet Explorer sometimes struggles to read currentStyle until the element's document is accessed.
		value = element.document && element.currentStyle[property].match(/([\d\.]+)(%|cm|em|in|mm|pc|pt|)/) || [0, 0, ''],
		size = value[1],
		suffix = value[2],
		rootSize;

		fontSize = !fontSize ? fontSize : /%|em/.test(suffix) && element.parentElement ? getComputedStylePixel(element.parentElement, 'fontSize', null) : 16;
		rootSize = property == 'fontSize' ? fontSize : /width/i.test(property) ? element.clientWidth : element.clientHeight;

		return suffix == '%' ? size / 100 * rootSize :
		       suffix == 'cm' ? size * 0.3937 * 96 :
		       suffix == 'em' ? size * fontSize :
		       suffix == 'in' ? size * 96 :
		       suffix == 'mm' ? size * 0.3937 * 96 / 10 :
		       suffix == 'pc' ? size * 12 * 96 / 72 :
		       suffix == 'pt' ? size * 96 / 72 :
		       size;
	}

	function setShortStyleProperty(style, property) {
		var
		borderSuffix = property == 'border' ? 'Width' : '',
		t = property + 'Top' + borderSuffix,
		r = property + 'Right' + borderSuffix,
		b = property + 'Bottom' + borderSuffix,
		l = property + 'Left' + borderSuffix;

		style[property] = (style[t] == style[r] && style[t] == style[b] && style[t] == style[l] ? [ style[t] ] :
		                   style[t] == style[b] && style[l] == style[r] ? [ style[t], style[r] ] :
		                   style[l] == style[r] ? [ style[t], style[r], style[b] ] :
		                   [ style[t], style[r], style[b], style[l] ]).join(' ');
	}

	// <CSSStyleDeclaration>
	function CSSStyleDeclaration(element) {
		var
		style = this,
		currentStyle = element.currentStyle,
		fontSize = getComputedStylePixel(element, 'fontSize'),
		unCamelCase = function (match) {
			return '-' + match.toLowerCase();
		},
		property;

		for (property in currentStyle) {
			Array.prototype.push.call(style, property == 'styleFloat' ? 'float' : property.replace(/[A-Z]/, unCamelCase));

			if (property == 'width') {
				style[property] = element.offsetWidth + 'px';
			} else if (property == 'height') {
				style[property] = element.offsetHeight + 'px';
			} else if (property == 'styleFloat') {
				style.float = currentStyle[property];
			} else if (/margin.|padding.|border.+W/.test(property) && style[property] != 'auto') {
				style[property] = Math.round(getComputedStylePixel(element, property, fontSize)) + 'px';
			} else if (/^outline/.test(property)) {
				// errors on checking outline
				try {
					style[property] = currentStyle[property];
				} catch (error) {
					style.outlineColor = currentStyle.color;
					style.outlineStyle = style.outlineStyle || 'none';
					style.outlineWidth = style.outlineWidth || '0px';
					style.outline = [style.outlineColor, style.outlineWidth, style.outlineStyle].join(' ');
				}
			} else {
				style[property] = currentStyle[property];
			}
		}

		setShortStyleProperty(style, 'margin');
		setShortStyleProperty(style, 'padding');
		setShortStyleProperty(style, 'border');

		style.fontSize = Math.round(fontSize) + 'px';
	}

	CSSStyleDeclaration.prototype = {
		constructor: CSSStyleDeclaration,
		// <CSSStyleDeclaration>.getPropertyPriority
		getPropertyPriority: function () {
			throw new Error('NotSupportedError: DOM Exception 9');
		},
		// <CSSStyleDeclaration>.getPropertyValue
		getPropertyValue: function (property) {
			return this[property.replace(/-\w/g, function (match) {
				return match[1].toUpperCase();
			})];
		},
		// <CSSStyleDeclaration>.item
		item: function (index) {
			return this[index];
		},
		// <CSSStyleDeclaration>.removeProperty
		removeProperty: function () {
			throw new Error('NoModificationAllowedError: DOM Exception 7');
		},
		// <CSSStyleDeclaration>.setProperty
		setProperty: function () {
			throw new Error('NoModificationAllowedError: DOM Exception 7');
		},
		// <CSSStyleDeclaration>.getPropertyCSSValue
		getPropertyCSSValue: function () {
			throw new Error('NotSupportedError: DOM Exception 9');
		}
	};

	// <Global>.getComputedStyle
	global.getComputedStyle = function getComputedStyle(element) {
		return new CSSStyleDeclaration(element);
	};
})(this);
}if (!('forEach' in Array.prototype
)){Array.prototype.forEach = function forEach(callback) {
	if (this === undefined || this === null) {
		throw new TypeError(this + 'is not an object');
	}

	if (!(callback instanceof Function)) {
		throw new TypeError(callback + ' is not a function');
	}

	var
	object = Object(this),
	scope = arguments[1],
	arraylike = object instanceof String ? object.split('') : object,
	length = Math.max(Math.min(arraylike.length, 9007199254740991), 0) || 0,
	index = -1,
	result = [],
	element;

	while (++index < length) {
		if (index in arraylike) {
			callback.call(scope, arraylike[index], index, object);
		}
	}
};
}}());/*
 * The global eqjs object that contains all eq.js functionality.
 *
 * eqjs.nodes - List of all nodes to act upon when eqjs.states is called
 * eqjs.nodesLength - Number of nodes in eqjs.nodes
 *
 * eqjs.refreshNodes - Call this function to refresh the list of nodes that eq.js should act on
 * eqjs.sortObj - Sorts a key: value object based on value
 * eqjs.query - Runs through all nodes and finds their widths and points
 * eqjs.nodeWrites - Runs through all nodes and writes their eq status
 */
(function (eqjs) {
  'use strict';

  function EQjs() {
    this.nodes = [];
    this.eqsLength = 0;
    this.widths = [];
    this.points = [];
    this.callback = undefined;
    this.storageElementSelector = 'html';
  }

  /*
   * Add event (cross browser)
   * From http://stackoverflow.com/a/10150042
   */
  function addEvent(elem, event, fn) {
    if (elem.addEventListener) {
      elem.addEventListener(event, fn, false);
    } else {
      elem.attachEvent('on' + event, function () {
        // set the this pointer same as addEventListener when fn is called
        return (fn.call(elem, window.event));
      });
    }
  }

  /*
   * Parse Before
   *
   * Reads `:before` content and splits it at the comma
   * From http://jsbin.com/ramiguzefiji/1/edit?html,css,js,output
   */
  function parseBefore(elem) {
    var content = window.getComputedStyle(elem, ':before').getPropertyValue('content'),
        contentNormalized = content.replace(/["']/g, ''); //handle double quoted (Safari) and single quoted (Chrome) content value
    return contentNormalized;
  }

  /*
   * Merges two node lists together.
   *
   * From http://stackoverflow.com/questions/914783/javascript-nodelist/17262552#17262552
   */
  var mergeNodes = function(a, b) {
    return [].slice.call(a).concat([].slice.call(b));
  };

  /*
   * Query
   *
   * Reads nodes and finds the widths/points
   *  nodes - optional, an array or NodeList of nodes to query
   *  callback - Either boolean (`true`/`false`) to force a normal callback, or a function to use as a callback once query and nodeWrites have finished.
   */
  EQjs.prototype.query = function (nodes, callback) {
    var proto = Object.getPrototypeOf(eqjs);
    var length;

    if (callback && typeof(callback) === 'function') {
      proto.callback = callback;
    }

    if (nodes && typeof(nodes) !== 'number') {
      length = nodes.length;
    }
    else {
      nodes = proto.nodes;
      length = proto.nodesLength;
    }
    var widths = [], points = [], i;

    for (i = 0; i < length; i++) {
      widths.push(nodes[i].offsetWidth);
      try {
        points.push(proto.sortObj(nodes[i].getAttribute('data-eq-pts')));
      }
      catch (e) {
        try {
          points.push(proto.sortObj(parseBefore(nodes[i])));
        }
        catch (e2) {
          points.push([{
            key: '',
            value: 0
          }]);
        }
      }
    }

    proto.widths = widths;
    proto.points = points;

    if (nodes && typeof(nodes) !== 'number') {
      proto.nodeWrites(nodes, widths, points);
    }
    else if (callback && typeof(callback) !== 'function') {
      proto.nodeWrites();
    }
    else {
      window.requestAnimationFrame(proto.nodeWrites);
    }
  };

  /*
   * NodeWrites
   *
   * Writes the data attribute to the object
   *  nodes - optional, an array or NodeList of nodes to query
   *  widths - optional, widths of nodes to use. Only used if `nodes` is passed in
   *  points - optional, points of nodes to use. Only used if `nodes` is passed in
   */
  EQjs.prototype.nodeWrites = function (nodes) {
    var i,
        j,
        k,
        length,
        callback,
        eqResizeEvent,
        eqState,
        proto = Object.getPrototypeOf(eqjs),
        widths = proto.widths,
        points = proto.points;

    if (nodes && typeof(nodes) !== 'number') {
      length = nodes.length;
    }
    else {
      nodes = proto.nodes;
      length = proto.nodesLength;
    }

    for (i = 0; i < length; i++) {
      // Set object width to found width
      var objWidth = widths[i];
      var obj = nodes[i];
      var eqPts = points[i];
      var eqStates = [];

      // Get keys for states
      var eqPtsLength = eqPts.length;

      // Be greedy for smallest state
      if (objWidth < eqPts[0].value) {
        eqState = null;
      }
      // Be greedy for largest state
      else if (objWidth >= eqPts[eqPtsLength - 1].value) {
        for (k = 0; k < eqPtsLength; k++) {
          eqStates.push(eqPts[k].key);
        }
        eqState = eqStates.join(' ');
      }
      // Traverse the states if not found
      else {
        for (j = 0; j < eqPtsLength; j++) {
          var current = eqPts[j];
          var next = eqPts[j + 1];
          eqStates.push(current.key);

          if (j === 0 && objWidth < current.value) {
            eqState = null;
            break;
          }
          else if (next.value === undefined) {
            eqStates.push(next.key);
            eqState = eqStates.join(' ');
            break;
          }
          else if (objWidth >= current.value && objWidth < next.value) {
            eqState = eqStates.join(' ');
            break;
          }
        }
      }

      // Determine what to set the attribute to
      if (eqState === null) {
        obj.removeAttribute('data-eq-state');
      }
      else {
        obj.setAttribute('data-eq-state', eqState);
      }
      // Set the details of `eqResize`
      eqResizeEvent = new CustomEvent('eqResize', {'detail': eqState});

      // Fire resize event
      obj.dispatchEvent(eqResizeEvent);
    }

    // Run Callback
    if (proto.callback) {
      callback = proto.callback;
      proto.callback = undefined;
      callback(nodes);
    }
  };

  /*
   * Refresh Nodes
   * Refreshes the list of nodes for eqjs to work with
   */
  EQjs.prototype.refreshNodes = function () {
    var proto = Object.getPrototypeOf(eqjs),
        cssNodes = [],
        storageElement;

    proto.nodes = document.querySelectorAll('[data-eq-pts]');

    storageElement = document.querySelector(this.storageElementSelector);

    if (storageElement !== null) {
      cssNodes = parseBefore(document.querySelector(this.storageElementSelector)).split(', ');
      cssNodes.forEach(function (v) {
        if (v !== '') {
          proto.nodes = mergeNodes(proto.nodes, document.querySelectorAll(v));
        }
      });
    }

    proto.nodesLength = proto.nodes.length;
  };

  /*
   * Sort Object
   * Sorts a simple object (key: value) by value and returns a sorted object
   */
  EQjs.prototype.sortObj = function (obj) {
    if (!obj || obj === 'none') {
      throw 'Invalid object'
    }
    
    var arr = [];

    var objSplit = obj.split(',');

    for (var i = 0; i < objSplit.length; i++) {
      var sSplit = objSplit[i].split(':');
      arr.push({
        'key': sSplit[0].replace(/^\s+|\s+$/g, ''),
        'value': parseFloat(sSplit[1])
      });
    }

    return arr.sort(function (a, b) { return a.value - b.value; });
  };

  /**
   * Updates the selector of the element that stores eq-selectors
   * in a pseudo element
   * @author filmic (me@filmic.eu)
   * @param  {String} selector CSS selector of the storage element
   */
  EQjs.prototype.setStorageElementSelector = function (selector) {
      this.storageElementSelector = selector;
      this.refreshNodes();
      this.query(undefined, true);
  }

  /*
   * We only ever want there to be
   * one instance of EQjs in an app
   */
  eqjs = eqjs || new EQjs();

  /*
   * Document Loaded
   *
   * Fires on document load; for HTML based EQs
   */
  addEvent(window, 'DOMContentLoaded', function () {
    eqjs.refreshNodes();
    eqjs.query(undefined, true);
  });

  /*
   * Window Loaded
   */
  addEvent(window, 'load', function () {
    eqjs.refreshNodes();
    eqjs.query(undefined, true);
  });

  /*
   * Window Resize
   *
   * Loop over each `eq-pts` element and pass to eqState
   */
  addEvent(window, 'resize', function () {
    eqjs.refreshNodes();
    window.requestAnimationFrame(eqjs.query);
  });

  // Expose 'eqjs'
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = eqjs;
  } else if (typeof define === 'function' && define.amd) {
    define(function () {
      return eqjs;
    });
  } else {
    window.eqjs = eqjs;
  }
})(window.eqjs);
