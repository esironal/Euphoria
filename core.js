Object.prototype.extend = function(value) {
	if ("object" == typeof(value)) {
		for (var key in value) {
			if ("undefined" === typeof(this[key])) {
				this[key] = value[key];
				continue;
			}
			if (this[key] === value[key]) 
				continue;
			if ("object" === typeof(value[key]) && "object" == typeof(this[key])) {
				this[key].extend(value[key]);
				continue;
			}
			this[key] = value[key];			
		}	
	} else {
		throw new Error("Object.prototype.extend() : argument must be an object!");
	}
};


E = {
	config: {
		ajaxTimeout: 30 //seconds
	},	
	runtime: {},

// helpers		
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
	createScopeFunction: function(func, scope) {
		return function() {
			scope.origin = this;
			return func.apply(scope);
		};
	},
	
	log: function(value) {
		if ("undefined" !== typeof(console) && "function" === typeof(console.log))
			console.log(value);	
	},
	
// document
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
					
				handler.apply(this);	
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
				handler.call.apply(this); 					
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

	t: function(dict, key) {
		//TODO
		return key;
	},
	
	appendDictionary: function(dict) {
		//TODO
	}
};
