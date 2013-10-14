Object.prototype.extend = function(value) {
	if ("object" === typeof(value)) {
		//console.log("Start extending object", this);
		
		for (var key in value) {
			if(!value.hasOwnProperty(key))
				continue;
				
			//console.log("Start process key");
			var typeOfThisKey = typeof(this[key]);
			var typeOfValueKey = typeof(value[key]);
			
			//console.log(key, typeOfThisKey, typeOfValueKey, value[key]);
			if ("undefined" === typeOfThisKey) {
				this[key] = value[key];
				continue;
			}
			if (this[key] === value[key]) 
				continue;
			//console.log(value[key] instanceof Array, this[key] instanceof Array);					
			if (value[key] instanceof Array && this[key] instanceof Array) {
				//console.log("extend array:");
				//console.log(this[key], value[key]);
				//console.log("result:");		
				this[key] = this[key].concat(value[key]);
				//console.log(this[key]);
				continue;
			}
			if ("object" === typeOfValueKey && "object" == typeOfThisKey) {
				this[key].extend(value[key]);
				continue;
			}	
					
			
			this[key] = value[key];			
		}
		//console.log("");
	} else {
		throw new Error("Object.prototype.extend() : argument must be an object!");
	}
	
	return this;
};

// experemintal!
Object.prototype.mix = function(value) {
	this.extend(value);	
	if("undefined" !== typeof(this["constructors"]) && this["constructors"] instanceof Array) {
		//E.log(this);
		for (var i = 0, l = this.constructors.length; i < l; i++) {
			if ("function" === typeof(this.constructors[i]))
				this.constructors[i].call(this);
		}
		
		this.constructos = [];
	}
	
	return this;
};

Object.prototype.generate = function(value) {
	var retObject = new this.constructor();
	retObject.extend(this);
	return retObject.extend(value);
};

E = {
	config: {
		ajaxTimeout: 30 //seconds
	},	
	runtime: {},

// helpers	

/**
 * Метод для підключення скрипта
 * @param {String} src       - адреса файлу скрипта
 * @param {Function} onLoad  - обробник після успішного завантаження
 * @param {Function} onError - обробник при помилці
 */
	
	include: function(src, onLoad, onError) {
		var loadScript = document.createElement("SCRIPT");
		loadScript.src = src;
		
		loadScript.onload = onLoad;
		loadScript.onerror = onError;
		
		document.head.appendChild(loadScript);
	},
	includeList: function(list, onLoad, onError) {
		var processScope = {
			progress: 0,
			needFiles: list.length,
			hasError: false,
			onload: onLoad,
			onerror: onError
		};
		// TODO need progress ?
		for(var i = 0; i < list.length; i++) {
			this.include(
				list[i], 
				this.createScopeFunction(function(){					
					this.progress++;
					if(this.progress>=this.needFiles) {
						if (this.hasError) {
							this.onerror();
						} else {
							this.onload();
						}
					}
				}, processScope), 
				this.createScopeFunction(function(){					
					this.hasError = true;
					this.progress++;
					if(this.progress>=this.needFiles) 
						this.onerror();
				}, processScope));
		}
	},
	
/**
 * Повертає функцію із замкненим на ній скопом (локальний обєкт видимості).
 * Це дозволяй привязати this який буде доступний незалежно від способу виклику функції.
 * В функцію func автоматом прокидається два додаткових атрибута які доступні при виклику:
 * this.origin - оригінальний скоп обєкта та this.arguments що прокидає аргументи функції для func.
 * Увага! виклик функції стане дорогим по часу виконання.
 * 
 * @param {Function} func - функція якій імплантується this 
 * @param {Object} scope  - обєкт this для func
 * 
 * @return {Function} функція якй буде привязаний this
 */
	createScopeFunction: function(func, scope) {
		return function() {
			scope.origin = this;
			scope.arguments = arguments;
			return func.apply(scope);
		};
	},
	
	connect: function(obj, signalName, slot) {
		if ("object" != typeof(obj))
			throw new Error ("Argument 'obj' must be an object!");
		
		if ("string" != typeof(signalName))
			throw new Error ("Argument 'signalName must be a string!");
			
		if ("function" != typeof(slot))
			throw new Error ("Argument 'slot' must be a function!");
			
		if (!obj.isEventServer)
			obj.extend(E.behaviors.eventServer);
		
		obj[signalName] = E.createScopeFunction(E.behaviors.eventServer.emit, { signal: signalName, object: obj });	
		
		if (!obj.listeners[signalName])
			obj.listeners[signalName] = [];
			
		if (-1 == obj.listeners[signalName].indexOf(slot))
			obj.listeners[signalName].push(slot);
	},
	
	disconnect: function(obj, signalName, slot) {
		if ("object" != typeof(obj))
			throw new Error ("Argument 'obj' must be an object!");
		
		if ("string" != typeof(signalName))
			throw new Error ("Argument 'signal must be a string!");
			
		if ("function" != typeof(slot))
			throw new Error ("Argument 'slot' must be a function!");
			
		if (obj.isEventServer) {
			var index =  obj.listeners[signalName].indexOf(slot);
			if (-1 < index) {
				delete obj.listeners[signalName][index];
			} 
		}
	},
	
	log: function(value) {
		if ("undefined" !== typeof(console) && "function" === typeof(console.log))
			console.log(value);	
	},
	
// document

/**
 * Додаєм файл таблиці стилей.
 * @param {String} url - адреса файлу
 */
	appendStyleSheet: function(url) {
		var styleLinkElement = document.createElement("LINK");
		styleLinkElement.rel = "stylesheet";
		styleLinkElement.href = url;
		
		document.head.appendChild(styleLinkElement);
	},
	
	elementFactory: function(config) {
		if("object" !== typeof(config) || "undefined" === typeof(config.tag))
			throw new Error("E.elementFactory() - invalid config.");
		
		var element = document.createElement(config.tag);
		
		if("undefined" !== typeof(config.id)) 
			element.id = config.id;
			
		if("undefined" !== typeof(config.cls))
			element.className = config.cls;
		
		if("undefined" !== typeof(config.html))
			element.innerHTML = config.html;
		
		if("object" === typeof(config.attributes)) 
			for(key in config.attributes) {
				element[key] = config.attributes[key];				
			}
			
		if("object" === typeof(config.events))
			for(key in config.events) {
				element[key] = config.events[key];
			}
			
		if("object" === typeof(config.style))
			element.style.extend(config.style);
		
		if("undefined" != typeof(config.childs)) 
			for(var i=0; i<config.childs.length; i++) {
				element.appendChild(this.elementFactory(config.childs[i]));
			}
		
		return element;
	},
	
// ajax
	ajax: function(config) {		
		var transport = (window.ActiveXObject) ? new ActiveXObject('Microsoft.XMLHTTP') 
			: (window.XMLHttpRequest) ? new XMLHttpRequest() : false;
			
		var stateScope = {request: transport, config: config, timer_id: null };	
		var readyStateHandler = function(){
			if (4 == this.request.readyState) {
				clearTimeout(this.timer_id);
				
				var handler = this.config.onSuccess;
				if (400 <= this.request.status && 500 > this.request.status && "undefined" !== typeof(this.config.onFailure))
					handler = this.config.onFailure;
				if (500 <= this.request.status && "undefined" !== typeof(this.config.onError))
					handler = this.config.onError;					
					
				handler.call(this);	
			}	
		};
		
		transport.onreadystatechange = E.createScopeFunction(readyStateHandler, stateScope);
		
		transport.open('POST', config.url, true);
		transport.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        transport.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        transport.setRequestHeader('Connection', 'close');
		
		var timeoutHandler = function() {
			this.request.abort();
			var handler = null;
			if ("undefined" !== typeof(this.config.onTimeout))
				handler = this.config.onTimeout;
			if ("undefined" !== typpeof(this.config.onError))
				handler = this.config.onError;
								
			if (null != handler)
				handler.call(this); 					
		};
		var encoded_data = "";
		
        if ("string" === typeof(config.data) ) {
            encoded_data = data;
        } else {
            var e = encodeURIComponent;
            for (var k in config.data) {
                if (config.data.hasOwnProperty(k)) {
                    encoded_data += '&' + e(k) + '=' + e(config.data[k]);
                }
            }
        }
		
		stateScope.timer_id = setTimeout(E.createScopeFunction(timeoutHandler, stateScope), E.config.ajaxTimeout * 1000);
		transport.send(encoded_data);		
	},
	ajaxSubmit: function(formId, config) {
		var formElement = document.getElementById(formId);		
		if (null != formElement) {
			var requestData = { ajax: true };
			
			for(var i = 0; i< formElement.length; i++) {
				var fieldName = formElement.elements[i].name;
   				var fieldValue = formElement.elements[i].value;
   				
   				requestData[fieldName] = fieldValue;
			}			
			
			var ajaxConf = {
				url: formElement.action,
				data: requestData,
				onSuccess: function() {		
					var summary = document.querySelector('.summary .help-block');					
					
					summary.innerHTML = answer.message;
					summary.parentElement.classList.add('has-success');					
					summary.parentElement.classList.remove('has-error');
					
					for(var i = 0; i < this.config.form.length; i++) {
	   					var field = this.config.form.elements[i];
	   					ield.parentElement.classList.remove('has-error');   					
	   					field.parentElement.querySelector('.help-block').innerHTML = "";
	   				}
				},
				onFailure: function() {
					var answer = JSON.parse(this.request.responseText);
					var summary = document.querySelector('.summary .help-block');		
					
					summary.innerHTML = answer.message;										
					summary.parentElement.classList.add('has-error');
					
					for (var i = 0; i < this.config.form.length; i++) {						
						var field = this.config.form.elements[i];
						if ('INPUT' != field.tagName && 'SELECT' != field.tagName && 'TEXTAREA' != field.tagName)
							continue;						
						if ('hidden' == field.type)
							continue;
						
						field.parentElement.classList.remove('has-error');
						field.parentElement.querySelector('.help-block').innerHTML = "";						
						for(var key in answer.errors) {
							var checkKey = "[" + key + "]";
							if(0 < field.name.indexOf(checkKey)) {
								field.parentElement.classList.add('has-error');
								field.parentElement.querySelector('.help-block').innerHTML = answer.errors[key];
								break;
							} 
						}						
					}
				},
				onError: function() {
					//TODO
					E.log(this);
				},
				onTimeout: function() {
					//TODO
					E.log(this);
				},
				// function scope data
				form: formElement
			};
			
			if ("object" === typeof(config))
				ajaxConf.extend(config);
			
			E.ajax(ajaxConf);
			
		} else {
			throw new Error("E.ajaxSubmit(): Unknown form id: " + formId);
		}
	},
	
// i18n

/**
 * Повертає локалізовану стрsxre по ключу key з словника dictionaryName. 
 * 
 * @param {String} dictionaryName - назва словника
 * @param {String} key            - стрічка для локалізації
 * 
 * @return {String} локалізований варіант, якщо немає відповідного імені словника 
 * чи варіант локалізації відсутній тоді повертаєтся key
 * 
 */
	t: function(dictionaryName, key) {
		//TODO
		return key;
	},
	
/**
 * Додати новий словник перекладів
 * @param {String} dictionaryName   - імя словника для доступу до нього
 * @param {Object} dictionaryObject - обєкт з варіантами локалізацій де назва атрибута є ключом а значення варіантом
 */	
	appendDictionary: function(dictionaryName, dictionaryObject) {
		//TODO
	}
};

E.behaviors = {
	eventServer: {
		isEventServer: true,
		listeners: {},
		emit: function() {
			if ("string" != typeof(this.signal))
				throw new Error("E.behaviors.eventServer,emit(): unknown signal, please use E.connect() method!");
			
			var listeners = this.object.listeners[this.signal];
			if (listeners) {
				for (var i=0, l = listeners.length; i < l; i++) {
					listeners[i].apply(this, this.arguments);
				}
			}
		}
	}	
};
