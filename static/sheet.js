var cs5e = {
	printTimer: 2000,
	toastTimer: 4000,
	toastContent: [],
	toastTimoutId: null,
	toastSingle: true,
	token: null,
	submitAction: null,
	code: null,
	data: {},
	firstLoad: true,
	canUpload: (!util.isMobile && util.canDragDrop),

	strings: {
		token_map: [
			['%c', function () { return cs5e.code; }]
		],
		sheet_url:											'The URL to your sheet is:',
		enter_code:											'Enter a character sheet code:',
		enter_password:										'Enter the password for this character sheet:',
		new_password:										'Enter a new password for character sheet %c:',
		new_password_2:										'Enter a new password for character sheet %c (confirm):',
		new_email:											'Enter a new password recovery email address for character sheet %c:',
		new_email_2:										'Enter a new password recovery email address for character sheet %c (confirm):',
		sheet_dirty_confirm:								'You have unsaved changes. Continue without saving?',
		sheet_dirty:			util.icon('warning')+		'You have unsaved changes',
		sheet_url_copied:		util.icon('content_copy')+	'Your sheet URL is ready for pasting',
		code_invalid:			util.icon('warning')+		'The code you entered is not valid',
		code_successful:		util.icon('check_circle')+	'You have changed your sheet code to %c',
		code_failed:			util.icon('warning')+		'Unable to change sheet code',
		code_exists:			util.icon('warning')+		'That sheet code is already in use',
		blank_password:			util.icon('warning')+		'Your password cannot be blank',
		read_only_mode:			util.icon('info')+			'Entering read-only mode',
		edit_mode:				util.icon('info')+			'Entering edit mode',
		not_in_edit_mode:		util.icon('warning')+		'You can only do that in edit mode',
		auth_successful:		util.icon('check_circle')+	'You are now authenticated',
		auth_problem:			util.icon('warning')+		'Authentication problem. Try again',
		auth_failed:			util.icon('warning')+		'The password you entered is incorrect',
		password_nomatch:		util.icon('warning')+		'The passwords do not match. Try again',
		password_successful:	util.icon('check_circle')+	'Password updated',
		password_failed:		util.icon('warning')+		'Unable to update password',
		email_nomatch:			util.icon('warning')+		'The email addresses do not match. Try again',
		email_invalid:			util.icon('warning')+		'That is not a valid email address',
		email_successful:		util.icon('check_circle')+	'Password recovery email address updated',
		email_failed:			util.icon('warning')+		'Unable to update password recovery email address',
		nothing_to_save:		util.icon('info')+			'There is nothing to save',
		save_successful:		util.icon('check_circle')+	'Save successful',
		save_failed:			util.icon('warning')+		'Unable to save character sheet',
		load_successful:		util.icon('check_circle')+	'Loaded character sheet: %c',
		load_failed:			util.icon('warning')+		'Unable to load character sheet: %c',
		quickload_failed:		util.icon('error')+			'Character sheet %c does not exist',
		clean_successful:		util.icon('info')+			'Loaded a blank character sheet: %c',
		server_error:			util.icon('sync_problem')+	'The server encountered an error',
		print_chrome:			util.icon('warning')+		'For best results, print with Chrome on a PC',
		print_margins:			util.icon('info')+			'For best results, turn off print margins, headers, and footers'
	},

	// Button configuration
	// The material icon name is set by the innerHTML property
	// An empty element config object is interpreted as a spacer (<span>)
	buttons: {
		'body': [
			{
				id: 'menu-open',
				title: 'Show/hide menu',
				className: 'no-print',
				onclick: 'menuState'
			}
		],
		'#menu': [
			{
				id: 'new-button',
				innerHTML: 'note_add',
				title: 'New character',
				onclick: 'clean'
			}, {
				id: 'open-button',
				innerHTML: 'folder_open',
				title: 'Load character',
				onclick: 'loadPrompt'
			}, {
			}, {
				id: 'lock-button',
				innerHTML: 'lock_open',
				title: 'Toggle read-only',
				disabled: true,
				onclick: 'lockState'
			}, {
				id: 'save-button',
				innerHTML: 'save',
				title: 'Save character',
				onclick: 'save'
			}, {
				id: 'tools-button',
				innerHTML: 'build',
				title: 'Toggle tools panel',
				disabled: true,
				onclick: 'toolsState'
			}, {
				id: 'options-button',
				innerHTML: 'settings',
				title: 'Toggle options panel',
				onclick: 'optionsState'
			}, {
			}, {
				id: 'print-button',
				innerHTML: 'print',
				title: 'Print',
				onclick: 'print'
			}, {
				id: 'home-button',
				innerHTML: 'home',
				title: 'Back to home page',
				className: 'right hide-if-standalone',
				onclick: function () { window.location.href = '/'; }
			}
		],
		'#tools': [
			{
				id: 'password-button',
				innerHTML: 'vpn_key',
				title: 'Change password',
				onclick: 'setPassword'
			}, {
				id: 'email-button',
				innerHTML: 'alternate_email',
				title: 'Set password recovery e-mail address',
				onclick: 'setEmail'
			}, {
				id: 'code-button',
				innerHTML: 'edit',
				title: 'Change sheet code',
				onclick: 'modifyCode'
			}
		]
	},

	options: {
		'dci-faction-shown': {
			label: 'Show DCI and faction fields',
			change: function (value) { util.toggleClass('#adventurers-league', 'shown', value); }
		},
		'inspiration-num': {
			label: 'Use number field for Inspiration',
			change: function (value) { util.toggleClass('#inspirationNum', 'shown', value); }
		},
		'armor-class-alt': {
			label: 'Show alternate AC field',
			change: function (value) { util.toggleClass(['#armorClassAlt', '#armorClassAltLine'], 'shown', value); }
		},
		'page-3-shown': {
			breakBefore: true,
			label: 'Show spellcasting page',
			change: function (value) {
				var el = util.byId('page-3'), oldState = util.hasClass(el, 'shown');
				util.toggleClass(el, 'shown', value);
			}
		},
		'page-notes-shown': {
			datatype: 'number',
			label: 'Notes pages',
			defVal: 0,
			minVal: 0,
			maxVal: 10,
			change: function (value) {
				if (typeof value != 'number' || Number.isNaN(value) ||
					value < this.minVal || value > this.maxVal) return false;
				util.get('div[id|="page-notes"]').forEach(function (el, idx) {
					util.toggleClass(el, 'shown', (value > idx))
				});
			}
		},
		'dark-theme': {
			label: 'Dark mode',
			defVal: false,
			change: function (value) { util.toggleClass('body', 'dark-theme', value); }
		},
		'attr-cap': {
			label: 'Cap attributes',
			defVal: true,
			enabledText: 'On',
			disabledText: 'Off',
			change: function (value) {
				util.get('#attributes input[type="number"]').forEach(function (el) {
					var min = 0, max = 20;
					if (value) {
						el.setAttribute('min', min);
						el.setAttribute('max', max);
						if (el.value < min) el.valueAsNumber = min;
						if (el.value > max) el.valueAsNumber = max;
					} else {
						el.removeAttribute('min');
						el.removeAttribute('max');
					}
				});
			}
		},
		'calc-fields': {
			breakBefore: true,
			label: 'Calculable fields',
			defVal: true,
			enabledText: 'On',
			disabledText: 'Off',
			change: function (value) { util.toggleClass('.calculable', 'calc-enabled', value); }
		},
		'attr-mod-calc': {
			label: 'Calculate attribute modifiers',
			change: function (value) {
				util.toggleClass('#attributes [data-attr-mod-calc-id]', 'mod-calc-enabled', value);
				util.get('#attributes [data-attr-mod-calc-id]').forEach(function (el) {
					util.toggleClass('#'+el.dataset.attrModCalcId, 'shown', value);
					if (value) el.dispatchEvent(new Event('blur'));
				});
			}
		},
		'print-transient': {
			label: 'Transient fields in print',
			defVal: true,
			enabledText: 'Shown',
			disabledText: 'Hidden',
			change: function (value) { util.toggleClass('body', 'print-transient', value); }
		}
	},

	ctrlKeyShortcuts: {
		'KeyS': 'save',
		'KeyO': 'loadPrompt',
		'KeyP': 'print'
	},

	getString: function (str1) {
		if (!cs5e.strings.hasOwnProperty(str1) || typeof cs5e.strings[str1] != 'string')
			return '';

		var str2 = cs5e.strings[str1];
		cs5e.strings.token_map.forEach(function (map) {
			str1 = str2;
			str2 = str1.replace(map[0], map[1]());
		});
		return str2;
	},

	updateWinTitle: function (code = null) {
		if (code === null) code = sheet.code;
		var nm = ((sheet.data['page-1'] && sheet.data['page-1']['name']) ? sheet.data['page-1']['name'] : '');
		document.title = 'CS5e #' + code + (nm ? ' - '+nm : '');
	},

	setCode: function (code) {
		sheet.code = code;

		util.get('.sheetCode').forEach(function (el) {
			el.value = code;
		});
	},

	isValid: function (code) { return /^[A-Z0-9]{3,5}$/.test(code.toUpperCase()); },

	setHash: function (code, repl = false) {
		util.setHash(code, repl);
		cs5e.updateWinTitle(code);
	},

	getURL: function (code = null) {
		if (code === null) code = sheet.code;
		var l = location;
		return l.origin + l.pathname + '#' + code;
	},

	forEachField: function (fn, getElement = true, fieldList = null) {
		if (fieldList === null) fieldList = sheet.fieldList;
		util.forEach(fieldList, function (pageid, datatypes) {
			util.forEach(datatypes, function (datatype, fieldids) {
				fieldids.forEach(function (fieldid) {
					if (getElement) {
						var field = util.byId(fieldid);
						if (field) fn(field, fieldid, datatype, pageid);
					} else fn(fieldid, datatype, pageid);
				});
			});
		});
	},

	buttonState: function (btn, state) { util.byId(btn + '-button').disabled = !state; },

	menuState: function (state = null) { util.toggleClass('#menu', 'open', state); },

	toolsState: function (state = null) {
		if (state === null)
			state = !util.hasClass('#tools', 'shown');
		if (state)
			cs5e.optionsState(false);
		util.toggleClass('#tools', 'shown', state);
		util.toggleClass('#tools-button', 'panel-open', state);
		util.get('#tools button').forEach(function (el) { el.disabled = !state; });
	},

	optionsState: function (state = null) {
		if (state === null)
			state = !util.hasClass('#options', 'shown');
		if (state)
			cs5e.toolsState(false);
		util.toggleClass('#options', 'shown', state);
		util.toggleClass('#options-button', 'panel-open', state);
	},

	getOptCfg: function (optName) {
		var opt = Object.assign({
			datatype: 'boolean',
			defVal: false,
			enabledText: 'Enabled',
			disabledText: 'Disabled',
			breakBefore: false
		}, cs5e.options[optName]);
		if (opt.datatype == 'number' && opt.defVal === false)
			opt.defVal = 0;
		return opt;
	},

	getOptions: function () {
		var opts = {};
		util.forEach(cs5e.options, function (optName) {
			opts[optName] = cs5e.getOptCfg(optName);
		});
		return opts;
	},

	optChange: function (arg1, arg2 = null, notify = true, load = false) {
		var optid, opt, value, valid = true, valueStr = null, success;
		if (typeof arg1 == 'object')
			optid = arg1.target.id;
		else optid = arg1;
		opt = cs5e.getOptCfg(optid);
		if (typeof arg1 == 'object') {
			if (opt.datatype == 'boolean') {
				value = arg1.target.checked;
			} else if (opt.datatype == 'number') {
				value = arg1.target.valueAsNumber;
				valid = arg1.target.checkValidity();
			}
		} else value = arg2;
		if (!valid) return;
		if (typeof value == 'number') valueStr = value.toString();
		else valueStr = (value ? opt.enabledText : opt.disabledText);
		success = opt.change.call(opt, value, load);
		if (success === false) {
			if (typeof arg1 == 'object')
				arg1.preventDefault();
			return false;
		}
		if (notify) cs5e.toast(util.icon('info') + opt.label + ': ' + valueStr);
	},

	lockState: function (state = null, savebtn = false, passbtn = false, notify = true) {
		if (state == sheet.readOnly) notify = false;
		var doUnlock = function (s = false, p = false, n = true, c = true) {
			util.toggleClass(document.body, 'read-only-mode', false);
			sheet.readOnly = false;
			util.byId('lock-button').innerHTML = 'lock_open';
			cs5e.buttonState('save', s);
			cs5e.buttonState('tools', p);
			if (!p) cs5e.toolsState(false);
			cs5e.buttonState('options', s);
			if (!s) cs5e.optionsState(false);
			cs5e.forEachField(function (field) { field.disabled = false; });
			if (n) cs5e.toast(cs5e.getString('edit_mode'), c);
		};
		if (state === false) return doUnlock(savebtn, passbtn, notify);
		else if (state === null) state = !sheet.readOnly;
		if (state) {
			if (cs5e.isDirty()) return cs5e.toast(cs5e.getString('sheet_dirty'));

			util.toggleClass(document.body, 'read-only-mode', true);
			sheet.readOnly = true;
			util.byId('lock-button').innerHTML = 'lock';
			cs5e.buttonState('save', savebtn);
			cs5e.buttonState('tools', passbtn);
			if (!passbtn) cs5e.toolsState(false);
			cs5e.buttonState('options', savebtn);
			if (!savebtn) cs5e.optionsState(false);
			cs5e.forEachField(function (field) { field.disabled = true; });
			if (notify) cs5e.toast(cs5e.getString('read_only_mode'));
		} else if (cs5e.token) doUnlock(true, true, true);
		else cs5e.auth(function (success, r) {
			if (success && r.status == 200) doUnlock(true, true, true, false);
		});
	},

	adjustNameFields: function () {
		var el1 = util.byId('name'), el2 = util.byId('name-2'), t = 0;
		util.range(20, 50, 5).forEach(function (i) {
			if (el1.value.length >= i) {
				t = i;
			}
		});
		el1.dataset.lengthAbove = t;
		el2.dataset.lengthAbove = t;
	},

	toast: function (text, clear = null, timer = null, tCallback = null) {
		if (clear === null) clear = cs5e.toastSingle;
		if (timer === null) timer = cs5e.toastTimer;
		var el = util.byId('toast'), isOpen = util.hasClass(el, 'open');
		if (isOpen || clear) window.clearTimeout(cs5e.toastTimeoutId);
		if (!isOpen || clear) cs5e.toastContent = [];

		cs5e.toastContent.push(text);
		el.innerHTML = cs5e.toastContent.join('<br/>');
		util.toggleClass(el, 'open', true);
		cs5e.toastTimeoutId = window.setTimeout(function () {
			util.toggleClass('#toast', 'open', false);
			if (typeof tCallback == 'function') tCallback();
		}, timer);
	},

	delayToast: function (t, ...args) { return util.delay(t, cs5e.toast, ...args); },

	modifyCode: function () {
		if (!cs5e.token) return;
		if (cs5e.isDirty()) return cs5e.toast(cs5e.getString('sheet_dirty'));

		var newCode = window.prompt(cs5e.getString('enter_code'), sheet.code);
		if (!newCode || newCode.toUpperCase() == sheet.code) return;
		if (!cs5e.isValid(newCode)) return cs5e.toast(cs5e.getString('code_invalid'));

		cs5e.submit({ new_code: newCode });
	},

	setPassword: function () {
		if (!cs5e.token) return window.prompt(cs5e.getString('enter_password')) || null;
		if (cs5e.isDirty()) return cs5e.toast(cs5e.getString('sheet_dirty'));

		var newPassword = window.prompt(cs5e.getString('new_password'));
		if (newPassword === '') cs5e.toast(cs5e.getString('blank_password'));
		else if (newPassword) {
			var newPassword2 = window.prompt(cs5e.getString('new_password_2'));
			if (newPassword != newPassword2) cs5e.toast(cs5e.getString('password_nomatch'));
			else cs5e.submit({ password: newPassword });
		}
	},

	setEmail: function () {
		if (!cs5e.token) return window.prompt(cs5e.getString('enter_password')) || null;
		if (cs5e.isDirty()) return cs5e.toast(cs5e.getString('sheet_dirty'));

		var newEmail = window.prompt(cs5e.getString('new_email'));
		if (newEmail === '') cs5e.toast(cs5e.getString('blank_email'));
		else if (newEmail) {
			var newEmail2 = window.prompt(cs5e.getString('new_email_2'));
			if (newEmail != newEmail2) cs5e.toast(cs5e.getString('email_nomatch'));
			else cs5e.submit({ email: newEmail });
		}
	},

	collectData: function () {
		var data = {}, writeValue, defval;

		cs5e.forEachField(function (field, fieldid, datatype, pageid) {
			writeValue = null;
			defval = field.getAttribute('data-defval');
			if (datatype == 'string' && ((defval && field.value != defval) || (!defval && field.value.trim())))
				writeValue = field.value;
			else if (datatype == 'boolean') {
				if (field.checked && !['true', 'checked'].includes(defval))
					writeValue = true;
				else if (!field.checked && ['true', 'checked'].includes(defval))
					writeValue = false;
			} else if (datatype == 'number' && ((defval && field.value != defval) || (!defval && field.value.trim())))
				writeValue = field.valueAsNumber;

			if (writeValue !== null) {
				if (!data[pageid]) data[pageid] = {};
				data[pageid][fieldid] = writeValue;
			}
		});

		return util.objSort(data);
	},

	isLoading: function () { return (util.byId('loading') !== null) },

	isDirty: function () {
		if (cs5e.isLoading()) return false;
		return !util.objCompare(cs5e.collectData(), sheet.data);
	},

	auth: function (authCallback) {
		var postdata = {
			code: sheet.code,
			password: cs5e.setPassword()
		};
		if (!postdata.password) return (postdata.password === null || cs5e.toast(cs5e.getString('blank_password')));
		new AjaxRequest({
			method: 'POST',
			url: './auth',
			data: postdata,
			responseType: 'json',
			mask: true,
			maskText: 'Authenticating...',
			handler: function (done, xhr, r) {
				if (!done)
					return cs5e.toast(cs5e.getString('server_error'));
				if (r.status != 200) {
					var msg;
					if (cs5e.strings.hasOwnProperty(r.reason))
						msg = cs5e.getString(r.reason);
					else
						msg = util.icon('warning') + r.reason;
					return cs5e.toast(msg);
				}
				cs5e.token = r.token;
				cs5e.toast(cs5e.getString('auth_successful'));
				authCallback(done, r);
			}
		});
	},

	submit: function (data = null) {
		var postdata = {
			code: sheet.code,
			new_code: '',
			password: '',
			token: ''
		};

		if (data.data) {
			if (cs5e.token) postdata.token = cs5e.token;
			else {
				postdata.password = cs5e.setPassword();
				if (!postdata.password) return (postdata.password === null || cs5e.toast(cs5e.getString('blank_password')));
			}
			cs5e.submitAction = 'save';
			cs5e.data = data.data;
			postdata.data = JSON.stringify(data.data);
		} else if (data.password) {
			cs5e.submitAction = 'password';
			postdata.token = cs5e.token;
			postdata.password = data.password;
		} else if (data.new_code) {
			cs5e.submitAction = 'code';
			postdata.token = cs5e.token;
			postdata.new_code = data.new_code.toUpperCase();
		} else if (data.email) {
			cs5e.submitAction = 'email';
			postdata.token = cs5e.token;
			postdata.email = data.email;
		} else return;

		postdata.action = cs5e.submitAction;

		new AjaxRequest({
			method: 'POST',
			url: './save',
			data: postdata,
			responseType: 'json',
			mask: true,
			maskText: 'Saving...',
			handler: function (done, xhr, r) {
				if (done && r.status == 200) {
					if (cs5e.submitAction == 'save') {
						sheet.randomCode = null;
						sheet.data = cs5e.data;
						cs5e.updateWinTitle();
						if (!cs5e.token) cs5e.token = r.token;
						cs5e.data = {};
						cs5e.buttonState('lock', true);
						cs5e.lockState(false, true, true, false);
					} else if (cs5e.submitAction == 'password') {
						cs5e.token = r.token;
					} else if (cs5e.submitAction == 'code') {
						cs5e.code = r.code;
						cs5e.setCode(r.code);
						cs5e.setHash(r.code, true);
					}
					cs5e.toast(cs5e.getString(cs5e.submitAction+'_successful'));
				} else if (!done) {
					cs5e.toast(cs5e.getString(cs5e.submitAction+'_failed'));
				} else {
					if (r.reason == 'auth_problem') {
						cs5e.lockState(true, false, false, false);
					}
					var msg;
					if (cs5e.strings.hasOwnProperty(r.reason))
						msg = cs5e.getString(r.reason);
					else
						msg = util.icon('warning') + r.reason;
					cs5e.toast(msg);
				}
			}
		});
	},

	save: function () {
		if (sheet.readOnly)
			return cs5e.toast(cs5e.getString('not_in_edit_mode'));

		if (!util.byId('name').value) util.byId('name').value = util.byId('name-2').value;
		if (!util.byId('name-2').value) util.byId('name-2').value = util.byId('name').value;

		var data = cs5e.collectData();

		if (!Object.keys(data).length)
			return cs5e.toast(cs5e.getString('nothing_to_save'));

		cs5e.submit({ data: data });
	},

	loadData: function (data, merge = false) {
		var valueProperty, dataEmpty;
		cs5e.forEachField(function (field, fieldid, datatype, pageid) {
			valueProperty = null;

			if (datatype == 'string')
				valueProperty = 'value';
			else if (datatype == 'boolean')
				valueProperty = 'checked';
			else if (datatype == 'number')
				valueProperty = 'valueAsNumber';

			if (pageid in data && fieldid in data[pageid])
				field[valueProperty] = data[pageid][fieldid];
			else if (datatype == 'string' && !merge)
				field[valueProperty] = field.getAttribute('data-defval') || '';
			else if (datatype == 'boolean' && !merge)
				field[valueProperty] = ['true', 'checked'].includes(field.getAttribute('data-defval')) || false;
			else if (datatype == 'number' && !merge)
				field[valueProperty] = parseInt(field.getAttribute('data-defval')) || 0;

			if (pageid == 'options')
				cs5e.optChange(fieldid, field[valueProperty], false, true);
		});
		cs5e.adjustNameFields();
		sheet.data = (merge ? cs5e.collectData() : data);
		dataEmpty = util.objCompare(sheet.data, {});

		if (!merge) {
			cs5e.buttonState('lock', !dataEmpty);
			cs5e.lockState(!dataEmpty, dataEmpty, false, !cs5e.firstLoad);
			cs5e.firstLoad = false;
		}
		cs5e.data = {};
	},

	clean: function (successFn = true, failFn = true, clearNotify = true) {
		if (cs5e.isDirty() && !window.confirm(cs5e.getString('sheet_dirty_confirm')))
			return false;

		if (successFn === true) successFn = function (c) { cs5e.toast(cs5e.getString('clean_successful'), clearNotify); };
		if (failFn === true) failFn = function () { cs5e.toast(cs5e.getString('server_error')); };

		var handlerFn = function (done, xhr, r) {
			if (!done || r.status != 200) {
				if (typeof failFn == 'function') failFn();
				return;
			}

			dbug.log('Loaded clean sheet').log(r.code);

			cs5e.setCode(r.code);
			cs5e.code = r.code;
			cs5e.token = null;
			cs5e.loadData({});
			cs5e.setHash(r.code);

			if (typeof successFn == 'function') successFn(r.code);
		};

		if (sheet.randomCode !== null) {
			handlerFn(true, null, { status: 200, code: sheet.randomCode });
			sheet.randomCode = null;
		} else {
			new AjaxRequest({
				method: 'GET',
				url: './code',
				responseType: 'json',
				mask: true,
				maskText: 'Getting a new code...',
				handler: handlerFn
			});
		}
	},

	updateData: function (oldData) {
		var data = util.objClone(oldData);

		var val;
		['inspirationNum', 'STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].forEach(function (fieldid) {
			val = data['page-1'][fieldid];
			if (typeof val == 'string')
				data['page-1'][fieldid] = parseInt(val);
		});

		return util.objSort(data);
	},

	load: function (code, successFn = true, failFn = true) {
		if (!code) return;

		if (!cs5e.isValid(code)) return cs5e.toast(cs5e.getString('code_invalid'));

		if (successFn === true) successFn = function (s, c) { cs5e.toast(cs5e.getString('load_successful')); };
		if (failFn === true) failFn = function (s, c) { cs5e.toast(cs5e.getString('load_failed')); };

		cs5e.code = code.toUpperCase();
		new AjaxRequest({
			method: 'GET',
			url: './load',
			data: { code: cs5e.code },
			responseType: 'json',
			mask: true,
			maskText: 'Loading sheet...',
			handler: function (done, xhr, r) {
				if (!done) {
					cs5e.toast(cs5e.getString('server_error'));
					if (cs5e.isLoading()) {
						cs5e.clean(true, true, false);
						cs5e.finishInit();
					}
					return;
				} else if (r.status != 200) {
					if (typeof failFn == 'function') failFn(false, r.code);
					return;
				}

				dbug.log('Loaded sheet').log(r.code);

				cs5e.setCode(cs5e.code);
				cs5e.token = null;
				cs5e.loadData(cs5e.updateData(r.data));
				cs5e.setHash(cs5e.code);

				if (typeof successFn == 'function') successFn(true, cs5e.code);
			}
		});
	},

	loadPrompt: function () {
		if (!cs5e.isDirty() || window.confirm(cs5e.getString('sheet_dirty_confirm')))
			cs5e.load(window.prompt(cs5e.getString('enter_code')));
	},

	print: function () {
		cs5e.toast(cs5e.getString((!util.isChrome || util.isMobile) ? 'print_chrome' : 'print_margins'), null, cs5e.printTimer, function () { window.print(); });
	},

	hashChange: function (hash, forced = false) {
		if (forced || !cs5e.isDirty()) {
			var code = hash.substr(1);
			if (cs5e.isValid(code)) cs5e.load(code, true, function (s, c) {
				cs5e.toast(cs5e.getString('load_failed'));
				cs5e.setHash(sheet.code);
			});
		} else if (window.confirm(cs5e.getString('sheet_dirty_confirm'))) cs5e.hashChange(hash, true);
	},

	finishInit: function () {
		util.toggleClass(['#page-1', '#page-2'], 'shown', true);
		util.rm('#loading');
	}
};

util.listen(window, 'load', function (e) {
	util.forEach({
		'debug-mode':		0,
		'is-mobile':		util.isMobile,
		'can-upload':		cs5e.canUpload
	}, function (className, state) { if (state) util.toggleClass(document.body, className, true); });

	util.prepend(document.body, util.el('div', {}, { id: 'menu', 'class': 'no-print' }));

	document.body.appendChild(util.el('div', {}, {
		id: 'toast',
		'class': 'no-print clickable',
		title: 'Click to dismiss'
	}, 'click', function (e) { util.toggleClass(e.target, 'open', false); }));

	util.forEach(cs5e.buttons, function (parent, buttons) {
		if (parent == '#tools')
			util.byId('menu').appendChild(util.el('div', { id: 'tools' }));
		buttons.forEach(function (elCfg) {
			var btn = null, handler = null;
			if (util.objCompare(elCfg, {}))
				btn = util.el('span');
			else if ('id' in elCfg) {
				var c = 'className', m = 'material-icons', e = 'onclick', t, h;
				if (c in elCfg) elCfg[c] += ' ' + m;
				else elCfg[c] = m;
				if (e in elCfg) {
					var h = elCfg[e], t = typeof h;
					delete elCfg[e];
					if (t == 'function')
						handler = h;
					else if (t == 'string')
						handler = function () { cs5e[h](); };
					else if (h.constructor === Array && h.length >= 2 && h[1].constructor === Array)
						handler = function () { cs5e[h[0]].apply(null, h[1]); };
				}
				btn = util.el('button', elCfg);
			}
			if (btn !== null) util.get(parent)[0].appendChild(btn);
			if (handler !== null) util.listen('#' + elCfg.id, 'click', handler);
		});
	});

	util.forEach(Object.assign(
		{
			'page-1': '#name',
			'page-2': '#name-2',
			'page-3': '#spell-class'
		}, (function () {
			var ret = {};
			util.get('div[id|="page-notes"]').forEach(function (el) {
				ret[el.id] = '#'+el.id+' .notes';
			});
			return ret;
		}())
	), function (pageid, sibling) {
		util.byId(pageid).insertBefore(util.el('input', {}, {
			'class': 'sheetCode pseudodisabled clickable',
			title: 'Click to copy your sheet URL to the clipboard'
		}, 'click', function (e) {
			var t = e.target, c = t.value, u = cs5e.getURL(c);
			if (t.select) {
				sheet.pdSelect = true;
				try {
					t.select(); document.execCommand('copy'); t.blur();
					t.value = u;
					t.select(); document.execCommand('copy'); t.blur();
					t.value = c;
					cs5e.toast(cs5e.getString('sheet_url_copied'));
				} catch (err) {
					t.blur();
					window.prompt(cs5e.getString('sheet_url'), cs5e.getURL());
				}
				sheet.pdSelect = false;
			}
		}), util.get(sibling)[0]);
	});

	util.listen('.pseudodisabled', 'focus', function (e) { if (!sheet.pdSelect) e.target.blur(); });

	util.byId('menu').appendChild(util.el('div', { id: 'options' }));
	util.forEach(cs5e.getOptions(), function (optid, optcfg, idx) {
		if (!('options' in sheet.fieldList))
			sheet.fieldList.options = {};
		if (!(optcfg.datatype in sheet.fieldList.options))
			sheet.fieldList.options[optcfg.datatype] = [];
		sheet.fieldList.options[optcfg.datatype].push(optid);

		var opt = util.el('label'), optattrs = { id: optid },
			optdef, optevent = 'change', options = util.byId('options');
		if (!('datatype' in optcfg) || optcfg.datatype == 'boolean') {
			optdef = ('defVal' in optcfg ? optcfg.defVal : false);
			Object.assign(optattrs, {
				type: 'checkbox',
				'data-defval': optdef.toString(),
				checked: optdef
			});
		} else if (optcfg.datatype == 'number') {
			optdef = ('defVal' in optcfg ? optcfg.defVal : 0);
			optevent = 'input';
			Object.assign(optattrs, {
				type: 'number',
				'data-defval': optdef.toString(),
				value: optdef.toString()
			});
			if ('minVal' in optcfg) Object.assign(optattrs, { 'min': optcfg.minVal.toString() });
			if ('maxVal' in optcfg) Object.assign(optattrs, { 'max': optcfg.maxVal.toString() });
		}

		if (optcfg.breakBefore) options.appendChild(util.el('br'));

		opt.appendChild(util.el('input', {}, optattrs, optevent, cs5e.optChange));
		opt.appendChild(util.text(optcfg.label));
		options.appendChild(opt);

		if (optcfg.datatype == 'number') util.listen('#'+optid, 'invalid', function (e) {
			var t = e.target, v = t.validity;
			if (v.rangeOverflow) t.value = t.max || '0';
			else t.value = t.min || '0';
		});
	});

	util.listen(window, 'hashchange', function () {
		cs5e.hashChange(window.location.hash);
	});

	util.listen(window, 'beforeunload', function (e) {
		if (cs5e.isDirty()) {
			e.returnValue = cs5e.getString('sheet_dirty_confirm');
			return e.returnValue;
		}
	});

	util.listen(['#name', '#name-2'], ['input', 'keyup'], function (e) {
		var el1 = e.target, el2 = util.byId('name' + (el1.id == 'name' ? '-2' : ''));
		el2.value = el1.value;
		cs5e.adjustNameFields();
	});

	util.listen('.calculable', ['blur', 'keyup'], function (e) {
		if (util.hasClass(e.target, 'calc-enabled')) {
			var expr = e.target.value.replace(/\s/g, '').replace(/x|×/ig, '*').replace(/÷/g, '/'),
				valid = /^-?\d+([+\-*\/]\d+)*$/.test(expr);
			if (valid && (e.type != 'keyup' || e.keyCode == 13))
				e.target.value = eval(expr).toString();
		}
	});

	util.listen('#attributes [data-attr-mod-calc-id]', ['input', 'keyup', 'blur'], function (e) {
		if (util.hasClass(e.target, 'mod-calc-enabled')) {
			var valString = '', val = Math.floor((e.target.valueAsNumber - 10) / 2);
			if (val >= 0) valString = '+';
			valString += val.toString();
			util.byId(e.target.dataset.attrModCalcId).value = valString;
		}
	});

	util.get('#page-1 #attacks > [id|="attack"]').forEach(function (ctr, idx) {
		if (idx > 0) {
			ctr.appendChild(util.el('input', {
				type: 'button',
				className: 'no-print material-icons move',
				value: 'swap_vert',
				title: 'Swap attacks'
			}, {}, 'click', function (e) { if (!sheet.readOnly) {
				var ctr = e.target.parentElement,
					srcid = ctr.id,
					tgtid = ctr.previousElementSibling.id;
				['-name', '-bonus', '-damage'].forEach(function(sfx) {
					var src = util.byId(srcid + sfx),
						tgt = util.byId(tgtid + sfx),
						tgtValue = tgt.value;
					tgt.value = src.value;
					src.value = tgtValue;
				});
			}}));
		}
	});

	if (!util.isMobile) {
		util.listen(document, 'keydown', function (e) { if (e.ctrlKey && !e.repeat) {
			var handled = false;
			util.forEach(cs5e.ctrlKeyShortcuts, function (code, methodname) {
				if (e.code == code) { cs5e[methodname](); handled = true; }
			});
			if (handled) { e.preventDefault(); return handled; }
		}});

		cs5e.forEachField(function (fieldid, datatype) {
			var field;
			if (datatype == 'string' && (field = util.byId(fieldid)).tagName == 'TEXTAREA') {
				util.listen(field, 'keyup', function (e) {
					if (!e.shiftKey && e.keyCode == 13) {
						var lf = "\n", lfln = lf.length,
							lines = this.value.slice(0, this.selectionStart - lfln),
							indent = lines.slice(lines.lastIndexOf(lf) + lfln).match(/^\s+/);
						if (indent !== null)
							document.execCommand('insertText', false, indent[0]);
					}
				});
			}
		}, false);
	}

	(function (code) {
		cs5e.setHash(code);
		if (cs5e.isValid(code)) cs5e.load(code, cs5e.finishInit, function (s, c) {
			cs5e.toast(cs5e.getString('quickload_failed'));
			sheet.randomCode = code;
			cs5e.clean(false, false, false);
			cs5e.finishInit();
		});
		else cs5e.clean(cs5e.finishInit);
	}(window.location.hash.substr(1)));
});
