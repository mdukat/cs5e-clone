var util = {
	isMobile: (function (ua) { return (/Android/.test(ua) || /Mobi/.test(ua) || /Tablet/.test(ua)); }(navigator.userAgent)),
	isChrome: (function (ua) { return (/Chrome\/\d+\./.test(ua) || /Chromium\/\d+\./.test(ua) || /CriOS\/\d+\./.test(ua)); }(navigator.userAgent)),
	isFirefox: (function (ua) { return (/Firefox\/\d+\./.test(ua) && !(/Seamonkey\/\d+\./.test(ua))); }(navigator.userAgent)),
	canDragDrop: (function () {
		var div = document.createElement('div');
		return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
	}()),
	isSecure: (function () { return (window.location.protocol == 'http:'); }()),
	getSecureUrl: function () { return window.location.href.replace(/^http:/, 'http:'); },
	goSecure: function () { if (!util.isSecure) window.location.href = util.getSecureUrl(); },
	delay: function (t, fn, ...args) {
		if (typeof t == 'undefined' || typeof fn == 'undefined')
			return false;
		if (!args.length) return window.setTimeout(fn, t);
		return window.setTimeout(fn, t, ...args);
	},
	range: function (start, end, step = 1) {
		var r = [];
		for (let i = start; i <= end; i += step) { r.push(i); }
		return r;
	},
	forEach: function (obj, fn) { Object.keys(obj).forEach(function (key, idx) { fn(key, obj[key], idx, obj); }); },
	byId: function (elid) { return document.getElementById(elid); },
	get: function (q) {
		var r, pref = '#';
		[' ', '#', '.', '[', ']', '*', ':'].forEach(function (c) { if (q.includes(c)) pref = ''; });
		if ((r = document.querySelectorAll(q)).length > 0 || !pref) return r;
		return document.querySelectorAll(pref + q);
	},
	isNodeList: function (els) { return els instanceof NodeList; },
	el: function (tag, props = null, attrs = null, event = null, handler = null, useCapture = null) {
		var el = document.createElement(tag);
		if (props) util.forEach(props, function (key, val) { el[key] = val; });
		if (attrs) util.forEach(attrs, function (key, val) { el.setAttribute(key, val); });
		if (event && handler) util.listen(el, event, handler, useCapture);
		return el;
	},
	text: function (text) { return document.createTextNode(text); },
	rm: function (el) {
		if (typeof el == 'string') el = util.get(el);
		var rmFunc = function (ele) { return ele.parentElement.removeChild(ele); };
		if (util.isNodeList(el)) el.forEach(rmFunc);
		else return rmFunc(el);
	},
	prepend: function (el, child) {
		if (typeof el == 'string') el = util.get(el);
		if (el.constructor === Array || util.isNodeList(el)) {
			el.forEach(function (eln) { util.prepend(eln, child); });
		} else {
			if (!el.children.length)
				el.appendChild(child);
			else
				el.insertBefore(child, el.children[0]);
		}
	},
	listen: function (el, ev, fn, uc = null) {
		if (typeof el == 'string') el = util.get(el);
		if (el.constructor === Array || util.isNodeList(el)) {
			el.forEach(function (eln) { util.listen(eln, ev, fn, uc); });
		} else if (ev.constructor === Array) {
			ev.forEach(function (evn) { util.listen(el, evn, fn, uc); });
		} else {
			dbug.log('Attaching ' + ev + ' event listener:', 3).dir(el, 3).dir(fn, 3);
			if (uc === null) el.addEventListener(ev, fn);
			else el.addEventListener(ev, fn, uc);
		}
	},
	inViewport: function (el) {
		if (typeof el == 'string') el = util.get(el)[0];
		var rect = el.getBoundingClientRect(),
		vw = (window.innerWidth || document.documentElement.clientWidth),
		vh = (window.innerHeight || document.documentElement.clientHeight),
		ret = (
			Math.floor(rect.top) < vh &&
			Math.floor(rect.right) > 0 &&
			Math.floor(rect.bottom) > 0 &&
			Math.floor(rect.left) < vw
		);
		dbug.log('Element is ' + (ret ? '' : 'not ') + 'in the viewport:', 4).dir(el, 4);
		return ret;
	},
	onVisibilityChange: function (el, fn, scrolltarget = window) {
		if (typeof el == 'string') el = util.get(el);
		if (typeof scrolltarget == 'string') evtgt = util.get(scrolltarget)[0];
		if (el.constructor === Array || util.isNodeList(el)) {
			el.forEach(function (eln) { util.onVisibilityChange(eln, fn, scrolltarget); });
		} else {
			var old_visible,
			scrollwindow = (scrolltarget.constructor === Window),
			handler = function (e) {
				var visible = util.inViewport(el);
				if (visible != old_visible) {
					old_visible = visible;
					fn.call(el, visible);
				}
			};
			dbug.log('Listening for visibility changes:', 4).dir(el, 4).dir(fn, 4);
			var windowEvents = ['DOMContentLoaded', 'load', 'resize'];
			if (scrollwindow) windowEvents.push('scroll');
			util.listen(window, windowEvents, handler);
			if (!scrollwindow)
				util.listen(scrolltarget, 'scroll', handler);
		}
	},
	toggleClass: function (el, cl, state = null) {
		if (typeof el == 'string') el = util.get(el);
		if (el.constructor === Array || util.isNodeList(el)) {
			el.forEach(function (eln) { util.toggleClass(eln, cl, state); });
		} else if (cl.constructor === Array) {
			cl.forEach(function (cln) { util.toggleClass(el, cln, state); });
		} else {
			dbug.log('Toggling ' + cl + ' class on:', 3).dir(el, 3);
			if (state === null)
				return el.classList.toggle(cl);
			return el.classList.toggle(cl, state);
		}
	},
	hasClass: function (el, className) {
		if (typeof el == 'string') el = util.get(el)[0];
		return el.classList.contains(className);
	},
	icon: function (name, ...args) {
		var str = true, classes = ['material-icons'];
		args.forEach(function (v) {
			if (typeof v == 'boolean') str = v;
			else if (typeof v == 'string') classes.push(v);
		});
		var className = classes.join(' ');
		var el = util.el('i', { className: className, innerHTML: name });
		if (str) return el.outerHTML;
		return el;
	},
	pick: function (list, num = 1) {
		if (list.constructor !== Array || num > list.length || num < 1)
			return null;
		if (num == 1)
			return list[Math.floor(Math.random() * list.length)];
		if (num == list.length)
			return list;
		var ret = [];
		while (ret.length < num)
			ret.push(list.splice(list.indexOf(util.pick(list, 1), 1))[0]);
		return ret;
	},
	objClone: function (obj) { return Object.assign({}, obj); },
	objSort: function (obj) {
		var ret = {}, clone = util.objClone(obj);
		if (clone === null) return null;
		Object.keys(clone).sort().forEach(function (key) {
			if (typeof clone[key] == 'object')
				ret[key] = util.objSort(clone[key]);
			else if (clone[key].constructor === Array)
				ret[key] = clone[key].sort();
			else ret[key] = clone[key];
		});
		return ret;
	},
	objCompare: function (obj1, obj2) {
		dbug.log('Comparing objects', 4).dir(obj1, obj2, 4);
		var json1 = JSON.stringify(util.objSort(obj1)),
			json2 = JSON.stringify(util.objSort(obj2)),
			objeq = (json1 == json2);
		dbug.log('Objects ' + (objeq ? 'match' : 'differ'), 4);
		if (!objeq) dbug.log(json1, json2, 4);
		return objeq;
	},
	setHash: function (hash, repl = false) { history[(repl ? 'replaceState' : 'pushState')](null, null, '#' + hash); }
},
dbug = {
	level: [0],
	_levels: [0,1,2,3,4],
	_defLevel: 1,
	_write: function (fn, ...args) {
		if (!['log', 'dir'].includes(fn))
			return false;
		var level = dbug._defLevel;
		if (args.length > 1 && dbug._levels.includes(args[args.length-1]))
			level = args.pop();
		if (dbug.level[0] >= level) args.forEach(function (msg) { console[fn](msg); });
		return dbug;
	},
	pushLevel: function (newlevel) {
		dbug.level.unshift(newlevel);
		return dbug;
	},
	popLevel: function () {
		if (dbug.level.length > 1)
			dbug.level.shift();
		return dbug;
	},
	log: function (...args) { return dbug._write('log', ...args); },
	dir: function (...args) { return dbug._write('dir', ...args); },
	ret: function (arg) { return arg; }
},
AjaxException = function (msg) {
	this.name = 'AjaxException';
	this.message = msg;
},
AjaxRequest = function (userConfig) {
	if (!('url' in userConfig))
		throw new AjaxException('URL must be provided');

	var events = ['load', 'abort', 'error', 'timeout'],
	config = Object.assign({
		method: 'GET',
		data: '',
		contentType: 'application/x-www-form-urlencoded',
		handler: function () {},
		mask: false,
		maskText: 'Please wait...'
	}, userConfig);

	events.concat('handler').forEach(function (ev) {
		if (ev in config && typeof config[ev] != 'function')
			throw new AjaxException('Event handler must be a function');
	});

	var mask = function (state) {
		if (util.get('.noAjaxMask').length == 0) {
			var maskId = 'ajaxMask', maskSel = '#' + maskId,
				maskStyles = ['simple']; //, 'android-esque', 'pacman'];
			if (!util.byId(maskId))
				document.body.appendChild(util.el('div', { id: maskId, innerHTML: '<span><span></span></span>' }));
			else
				util.toggleClass(maskSel, maskStyles, false);
			if (state) {
				util.toggleClass(maskSel, util.pick(maskStyles, 1), true);
				util.get(maskSel + ' > span')[0].dataset.maskText = config.maskText;
			}
			util.toggleClass(maskSel, 'shown', state);
		}
	},
	GET = /^get$/i.test(config.method),
	encData = (function (data) {
		if (typeof data == 'string') return data;
		if (typeof data != 'object')
			throw new AjaxException('Data must be provided as a pre-encoded string or an object');
		var ret = '';
		util.forEach(data, function (key, val, idx) {
			ret += ((idx > 0) ? '&' : '') + key + '=' + encodeURIComponent(val);
		});
		return ret;
	}(config.data));

	dbug.log('AjaxRequest instantiated, config:', 2).dir(config, 2)
		.log('Method: ' + config.method, 2)
		.log('Data payload: ' + encData, 2);

	var xhr = new XMLHttpRequest();
	util.listen(xhr, events, function (e) {
		dbug.log('AjaxRequest XHR event: ' + e.type, 2).dir(e, 2);
		if (config.mask) mask(false);
		var load = (e.type == 'load');
		if (load) dbug.log('Response:', 2).dir(e.target.response, 2);
		if (e.type in config)
			config[e.type].call(config, (load ? e.target.response : e), e.target);
		config.handler.call(config, load, e.target, (load ? e.target.response : e));
	});

	if (GET) config.url += '?' + encData;

	xhr.open(config.method, config.url);
	['responseType', 'timeout'].forEach(function (prop) { if (prop in config) xhr[prop] = config[prop]; });
	xhr.setRequestHeader('Content-Type', config.contentType + ';charset=UTF-8');
	if (config.mask) mask(true);
	xhr.send((GET ? null : encData));
};
