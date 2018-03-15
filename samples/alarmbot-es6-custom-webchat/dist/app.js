/******/ (function(modules) { // webpackBootstrap
/******/ 	function hotDisposeChunk(chunkId) {
/******/ 		delete installedChunks[chunkId];
/******/ 	}
/******/ 	var parentHotUpdateCallback = window["webpackHotUpdate"];
/******/ 	window["webpackHotUpdate"] = 
/******/ 	function webpackHotUpdateCallback(chunkId, moreModules) { // eslint-disable-line no-unused-vars
/******/ 		hotAddUpdateChunk(chunkId, moreModules);
/******/ 		if(parentHotUpdateCallback) parentHotUpdateCallback(chunkId, moreModules);
/******/ 	} ;
/******/ 	
/******/ 	function hotDownloadUpdateChunk(chunkId) { // eslint-disable-line no-unused-vars
/******/ 		var head = document.getElementsByTagName("head")[0];
/******/ 		var script = document.createElement("script");
/******/ 		script.type = "text/javascript";
/******/ 		script.charset = "utf-8";
/******/ 		script.src = __webpack_require__.p + "" + chunkId + "." + hotCurrentHash + ".hot-update.js";
/******/ 		;
/******/ 		head.appendChild(script);
/******/ 	}
/******/ 	
/******/ 	function hotDownloadManifest(requestTimeout) { // eslint-disable-line no-unused-vars
/******/ 		requestTimeout = requestTimeout || 10000;
/******/ 		return new Promise(function(resolve, reject) {
/******/ 			if(typeof XMLHttpRequest === "undefined")
/******/ 				return reject(new Error("No browser support"));
/******/ 			try {
/******/ 				var request = new XMLHttpRequest();
/******/ 				var requestPath = __webpack_require__.p + "" + hotCurrentHash + ".hot-update.json";
/******/ 				request.open("GET", requestPath, true);
/******/ 				request.timeout = requestTimeout;
/******/ 				request.send(null);
/******/ 			} catch(err) {
/******/ 				return reject(err);
/******/ 			}
/******/ 			request.onreadystatechange = function() {
/******/ 				if(request.readyState !== 4) return;
/******/ 				if(request.status === 0) {
/******/ 					// timeout
/******/ 					reject(new Error("Manifest request to " + requestPath + " timed out."));
/******/ 				} else if(request.status === 404) {
/******/ 					// no update available
/******/ 					resolve();
/******/ 				} else if(request.status !== 200 && request.status !== 304) {
/******/ 					// other failure
/******/ 					reject(new Error("Manifest request to " + requestPath + " failed."));
/******/ 				} else {
/******/ 					// success
/******/ 					try {
/******/ 						var update = JSON.parse(request.responseText);
/******/ 					} catch(e) {
/******/ 						reject(e);
/******/ 						return;
/******/ 					}
/******/ 					resolve(update);
/******/ 				}
/******/ 			};
/******/ 		});
/******/ 	}
/******/
/******/ 	
/******/ 	
/******/ 	var hotApplyOnUpdate = true;
/******/ 	var hotCurrentHash = "7a27fea07c56cdc22f84"; // eslint-disable-line no-unused-vars
/******/ 	var hotRequestTimeout = 10000;
/******/ 	var hotCurrentModuleData = {};
/******/ 	var hotCurrentChildModule; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentParents = []; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentParentsTemp = []; // eslint-disable-line no-unused-vars
/******/ 	
/******/ 	function hotCreateRequire(moduleId) { // eslint-disable-line no-unused-vars
/******/ 		var me = installedModules[moduleId];
/******/ 		if(!me) return __webpack_require__;
/******/ 		var fn = function(request) {
/******/ 			if(me.hot.active) {
/******/ 				if(installedModules[request]) {
/******/ 					if(installedModules[request].parents.indexOf(moduleId) < 0)
/******/ 						installedModules[request].parents.push(moduleId);
/******/ 				} else {
/******/ 					hotCurrentParents = [moduleId];
/******/ 					hotCurrentChildModule = request;
/******/ 				}
/******/ 				if(me.children.indexOf(request) < 0)
/******/ 					me.children.push(request);
/******/ 			} else {
/******/ 				console.warn("[HMR] unexpected require(" + request + ") from disposed module " + moduleId);
/******/ 				hotCurrentParents = [];
/******/ 			}
/******/ 			return __webpack_require__(request);
/******/ 		};
/******/ 		var ObjectFactory = function ObjectFactory(name) {
/******/ 			return {
/******/ 				configurable: true,
/******/ 				enumerable: true,
/******/ 				get: function() {
/******/ 					return __webpack_require__[name];
/******/ 				},
/******/ 				set: function(value) {
/******/ 					__webpack_require__[name] = value;
/******/ 				}
/******/ 			};
/******/ 		};
/******/ 		for(var name in __webpack_require__) {
/******/ 			if(Object.prototype.hasOwnProperty.call(__webpack_require__, name) && name !== "e") {
/******/ 				Object.defineProperty(fn, name, ObjectFactory(name));
/******/ 			}
/******/ 		}
/******/ 		fn.e = function(chunkId) {
/******/ 			if(hotStatus === "ready")
/******/ 				hotSetStatus("prepare");
/******/ 			hotChunksLoading++;
/******/ 			return __webpack_require__.e(chunkId).then(finishChunkLoading, function(err) {
/******/ 				finishChunkLoading();
/******/ 				throw err;
/******/ 			});
/******/ 	
/******/ 			function finishChunkLoading() {
/******/ 				hotChunksLoading--;
/******/ 				if(hotStatus === "prepare") {
/******/ 					if(!hotWaitingFilesMap[chunkId]) {
/******/ 						hotEnsureUpdateChunk(chunkId);
/******/ 					}
/******/ 					if(hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 						hotUpdateDownloaded();
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		return fn;
/******/ 	}
/******/ 	
/******/ 	function hotCreateModule(moduleId) { // eslint-disable-line no-unused-vars
/******/ 		var hot = {
/******/ 			// private stuff
/******/ 			_acceptedDependencies: {},
/******/ 			_declinedDependencies: {},
/******/ 			_selfAccepted: false,
/******/ 			_selfDeclined: false,
/******/ 			_disposeHandlers: [],
/******/ 			_main: hotCurrentChildModule !== moduleId,
/******/ 	
/******/ 			// Module API
/******/ 			active: true,
/******/ 			accept: function(dep, callback) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfAccepted = true;
/******/ 				else if(typeof dep === "function")
/******/ 					hot._selfAccepted = dep;
/******/ 				else if(typeof dep === "object")
/******/ 					for(var i = 0; i < dep.length; i++)
/******/ 						hot._acceptedDependencies[dep[i]] = callback || function() {};
/******/ 				else
/******/ 					hot._acceptedDependencies[dep] = callback || function() {};
/******/ 			},
/******/ 			decline: function(dep) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfDeclined = true;
/******/ 				else if(typeof dep === "object")
/******/ 					for(var i = 0; i < dep.length; i++)
/******/ 						hot._declinedDependencies[dep[i]] = true;
/******/ 				else
/******/ 					hot._declinedDependencies[dep] = true;
/******/ 			},
/******/ 			dispose: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			addDisposeHandler: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			removeDisposeHandler: function(callback) {
/******/ 				var idx = hot._disposeHandlers.indexOf(callback);
/******/ 				if(idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			// Management API
/******/ 			check: hotCheck,
/******/ 			apply: hotApply,
/******/ 			status: function(l) {
/******/ 				if(!l) return hotStatus;
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			addStatusHandler: function(l) {
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			removeStatusHandler: function(l) {
/******/ 				var idx = hotStatusHandlers.indexOf(l);
/******/ 				if(idx >= 0) hotStatusHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			//inherit from previous dispose call
/******/ 			data: hotCurrentModuleData[moduleId]
/******/ 		};
/******/ 		hotCurrentChildModule = undefined;
/******/ 		return hot;
/******/ 	}
/******/ 	
/******/ 	var hotStatusHandlers = [];
/******/ 	var hotStatus = "idle";
/******/ 	
/******/ 	function hotSetStatus(newStatus) {
/******/ 		hotStatus = newStatus;
/******/ 		for(var i = 0; i < hotStatusHandlers.length; i++)
/******/ 			hotStatusHandlers[i].call(null, newStatus);
/******/ 	}
/******/ 	
/******/ 	// while downloading
/******/ 	var hotWaitingFiles = 0;
/******/ 	var hotChunksLoading = 0;
/******/ 	var hotWaitingFilesMap = {};
/******/ 	var hotRequestedFilesMap = {};
/******/ 	var hotAvailableFilesMap = {};
/******/ 	var hotDeferred;
/******/ 	
/******/ 	// The update info
/******/ 	var hotUpdate, hotUpdateNewHash;
/******/ 	
/******/ 	function toModuleId(id) {
/******/ 		var isNumber = (+id) + "" === id;
/******/ 		return isNumber ? +id : id;
/******/ 	}
/******/ 	
/******/ 	function hotCheck(apply) {
/******/ 		if(hotStatus !== "idle") throw new Error("check() is only allowed in idle status");
/******/ 		hotApplyOnUpdate = apply;
/******/ 		hotSetStatus("check");
/******/ 		return hotDownloadManifest(hotRequestTimeout).then(function(update) {
/******/ 			if(!update) {
/******/ 				hotSetStatus("idle");
/******/ 				return null;
/******/ 			}
/******/ 			hotRequestedFilesMap = {};
/******/ 			hotWaitingFilesMap = {};
/******/ 			hotAvailableFilesMap = update.c;
/******/ 			hotUpdateNewHash = update.h;
/******/ 	
/******/ 			hotSetStatus("prepare");
/******/ 			var promise = new Promise(function(resolve, reject) {
/******/ 				hotDeferred = {
/******/ 					resolve: resolve,
/******/ 					reject: reject
/******/ 				};
/******/ 			});
/******/ 			hotUpdate = {};
/******/ 			var chunkId = 0;
/******/ 			{ // eslint-disable-line no-lone-blocks
/******/ 				/*globals chunkId */
/******/ 				hotEnsureUpdateChunk(chunkId);
/******/ 			}
/******/ 			if(hotStatus === "prepare" && hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 				hotUpdateDownloaded();
/******/ 			}
/******/ 			return promise;
/******/ 		});
/******/ 	}
/******/ 	
/******/ 	function hotAddUpdateChunk(chunkId, moreModules) { // eslint-disable-line no-unused-vars
/******/ 		if(!hotAvailableFilesMap[chunkId] || !hotRequestedFilesMap[chunkId])
/******/ 			return;
/******/ 		hotRequestedFilesMap[chunkId] = false;
/******/ 		for(var moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				hotUpdate[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(--hotWaitingFiles === 0 && hotChunksLoading === 0) {
/******/ 			hotUpdateDownloaded();
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotEnsureUpdateChunk(chunkId) {
/******/ 		if(!hotAvailableFilesMap[chunkId]) {
/******/ 			hotWaitingFilesMap[chunkId] = true;
/******/ 		} else {
/******/ 			hotRequestedFilesMap[chunkId] = true;
/******/ 			hotWaitingFiles++;
/******/ 			hotDownloadUpdateChunk(chunkId);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotUpdateDownloaded() {
/******/ 		hotSetStatus("ready");
/******/ 		var deferred = hotDeferred;
/******/ 		hotDeferred = null;
/******/ 		if(!deferred) return;
/******/ 		if(hotApplyOnUpdate) {
/******/ 			// Wrap deferred object in Promise to mark it as a well-handled Promise to
/******/ 			// avoid triggering uncaught exception warning in Chrome.
/******/ 			// See https://bugs.chromium.org/p/chromium/issues/detail?id=465666
/******/ 			Promise.resolve().then(function() {
/******/ 				return hotApply(hotApplyOnUpdate);
/******/ 			}).then(
/******/ 				function(result) {
/******/ 					deferred.resolve(result);
/******/ 				},
/******/ 				function(err) {
/******/ 					deferred.reject(err);
/******/ 				}
/******/ 			);
/******/ 		} else {
/******/ 			var outdatedModules = [];
/******/ 			for(var id in hotUpdate) {
/******/ 				if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 					outdatedModules.push(toModuleId(id));
/******/ 				}
/******/ 			}
/******/ 			deferred.resolve(outdatedModules);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotApply(options) {
/******/ 		if(hotStatus !== "ready") throw new Error("apply() is only allowed in ready status");
/******/ 		options = options || {};
/******/ 	
/******/ 		var cb;
/******/ 		var i;
/******/ 		var j;
/******/ 		var module;
/******/ 		var moduleId;
/******/ 	
/******/ 		function getAffectedStuff(updateModuleId) {
/******/ 			var outdatedModules = [updateModuleId];
/******/ 			var outdatedDependencies = {};
/******/ 	
/******/ 			var queue = outdatedModules.slice().map(function(id) {
/******/ 				return {
/******/ 					chain: [id],
/******/ 					id: id
/******/ 				};
/******/ 			});
/******/ 			while(queue.length > 0) {
/******/ 				var queueItem = queue.pop();
/******/ 				var moduleId = queueItem.id;
/******/ 				var chain = queueItem.chain;
/******/ 				module = installedModules[moduleId];
/******/ 				if(!module || module.hot._selfAccepted)
/******/ 					continue;
/******/ 				if(module.hot._selfDeclined) {
/******/ 					return {
/******/ 						type: "self-declined",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				if(module.hot._main) {
/******/ 					return {
/******/ 						type: "unaccepted",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				for(var i = 0; i < module.parents.length; i++) {
/******/ 					var parentId = module.parents[i];
/******/ 					var parent = installedModules[parentId];
/******/ 					if(!parent) continue;
/******/ 					if(parent.hot._declinedDependencies[moduleId]) {
/******/ 						return {
/******/ 							type: "declined",
/******/ 							chain: chain.concat([parentId]),
/******/ 							moduleId: moduleId,
/******/ 							parentId: parentId
/******/ 						};
/******/ 					}
/******/ 					if(outdatedModules.indexOf(parentId) >= 0) continue;
/******/ 					if(parent.hot._acceptedDependencies[moduleId]) {
/******/ 						if(!outdatedDependencies[parentId])
/******/ 							outdatedDependencies[parentId] = [];
/******/ 						addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 						continue;
/******/ 					}
/******/ 					delete outdatedDependencies[parentId];
/******/ 					outdatedModules.push(parentId);
/******/ 					queue.push({
/******/ 						chain: chain.concat([parentId]),
/******/ 						id: parentId
/******/ 					});
/******/ 				}
/******/ 			}
/******/ 	
/******/ 			return {
/******/ 				type: "accepted",
/******/ 				moduleId: updateModuleId,
/******/ 				outdatedModules: outdatedModules,
/******/ 				outdatedDependencies: outdatedDependencies
/******/ 			};
/******/ 		}
/******/ 	
/******/ 		function addAllToSet(a, b) {
/******/ 			for(var i = 0; i < b.length; i++) {
/******/ 				var item = b[i];
/******/ 				if(a.indexOf(item) < 0)
/******/ 					a.push(item);
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// at begin all updates modules are outdated
/******/ 		// the "outdated" status can propagate to parents if they don't accept the children
/******/ 		var outdatedDependencies = {};
/******/ 		var outdatedModules = [];
/******/ 		var appliedUpdate = {};
/******/ 	
/******/ 		var warnUnexpectedRequire = function warnUnexpectedRequire() {
/******/ 			console.warn("[HMR] unexpected require(" + result.moduleId + ") to disposed module");
/******/ 		};
/******/ 	
/******/ 		for(var id in hotUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 				moduleId = toModuleId(id);
/******/ 				var result;
/******/ 				if(hotUpdate[id]) {
/******/ 					result = getAffectedStuff(moduleId);
/******/ 				} else {
/******/ 					result = {
/******/ 						type: "disposed",
/******/ 						moduleId: id
/******/ 					};
/******/ 				}
/******/ 				var abortError = false;
/******/ 				var doApply = false;
/******/ 				var doDispose = false;
/******/ 				var chainInfo = "";
/******/ 				if(result.chain) {
/******/ 					chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/ 				}
/******/ 				switch(result.type) {
/******/ 					case "self-declined":
/******/ 						if(options.onDeclined)
/******/ 							options.onDeclined(result);
/******/ 						if(!options.ignoreDeclined)
/******/ 							abortError = new Error("Aborted because of self decline: " + result.moduleId + chainInfo);
/******/ 						break;
/******/ 					case "declined":
/******/ 						if(options.onDeclined)
/******/ 							options.onDeclined(result);
/******/ 						if(!options.ignoreDeclined)
/******/ 							abortError = new Error("Aborted because of declined dependency: " + result.moduleId + " in " + result.parentId + chainInfo);
/******/ 						break;
/******/ 					case "unaccepted":
/******/ 						if(options.onUnaccepted)
/******/ 							options.onUnaccepted(result);
/******/ 						if(!options.ignoreUnaccepted)
/******/ 							abortError = new Error("Aborted because " + moduleId + " is not accepted" + chainInfo);
/******/ 						break;
/******/ 					case "accepted":
/******/ 						if(options.onAccepted)
/******/ 							options.onAccepted(result);
/******/ 						doApply = true;
/******/ 						break;
/******/ 					case "disposed":
/******/ 						if(options.onDisposed)
/******/ 							options.onDisposed(result);
/******/ 						doDispose = true;
/******/ 						break;
/******/ 					default:
/******/ 						throw new Error("Unexception type " + result.type);
/******/ 				}
/******/ 				if(abortError) {
/******/ 					hotSetStatus("abort");
/******/ 					return Promise.reject(abortError);
/******/ 				}
/******/ 				if(doApply) {
/******/ 					appliedUpdate[moduleId] = hotUpdate[moduleId];
/******/ 					addAllToSet(outdatedModules, result.outdatedModules);
/******/ 					for(moduleId in result.outdatedDependencies) {
/******/ 						if(Object.prototype.hasOwnProperty.call(result.outdatedDependencies, moduleId)) {
/******/ 							if(!outdatedDependencies[moduleId])
/******/ 								outdatedDependencies[moduleId] = [];
/******/ 							addAllToSet(outdatedDependencies[moduleId], result.outdatedDependencies[moduleId]);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 				if(doDispose) {
/******/ 					addAllToSet(outdatedModules, [result.moduleId]);
/******/ 					appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Store self accepted outdated modules to require them later by the module system
/******/ 		var outdatedSelfAcceptedModules = [];
/******/ 		for(i = 0; i < outdatedModules.length; i++) {
/******/ 			moduleId = outdatedModules[i];
/******/ 			if(installedModules[moduleId] && installedModules[moduleId].hot._selfAccepted)
/******/ 				outdatedSelfAcceptedModules.push({
/******/ 					module: moduleId,
/******/ 					errorHandler: installedModules[moduleId].hot._selfAccepted
/******/ 				});
/******/ 		}
/******/ 	
/******/ 		// Now in "dispose" phase
/******/ 		hotSetStatus("dispose");
/******/ 		Object.keys(hotAvailableFilesMap).forEach(function(chunkId) {
/******/ 			if(hotAvailableFilesMap[chunkId] === false) {
/******/ 				hotDisposeChunk(chunkId);
/******/ 			}
/******/ 		});
/******/ 	
/******/ 		var idx;
/******/ 		var queue = outdatedModules.slice();
/******/ 		while(queue.length > 0) {
/******/ 			moduleId = queue.pop();
/******/ 			module = installedModules[moduleId];
/******/ 			if(!module) continue;
/******/ 	
/******/ 			var data = {};
/******/ 	
/******/ 			// Call dispose handlers
/******/ 			var disposeHandlers = module.hot._disposeHandlers;
/******/ 			for(j = 0; j < disposeHandlers.length; j++) {
/******/ 				cb = disposeHandlers[j];
/******/ 				cb(data);
/******/ 			}
/******/ 			hotCurrentModuleData[moduleId] = data;
/******/ 	
/******/ 			// disable module (this disables requires from this module)
/******/ 			module.hot.active = false;
/******/ 	
/******/ 			// remove module from cache
/******/ 			delete installedModules[moduleId];
/******/ 	
/******/ 			// when disposing there is no need to call dispose handler
/******/ 			delete outdatedDependencies[moduleId];
/******/ 	
/******/ 			// remove "parents" references from all children
/******/ 			for(j = 0; j < module.children.length; j++) {
/******/ 				var child = installedModules[module.children[j]];
/******/ 				if(!child) continue;
/******/ 				idx = child.parents.indexOf(moduleId);
/******/ 				if(idx >= 0) {
/******/ 					child.parents.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// remove outdated dependency from module children
/******/ 		var dependency;
/******/ 		var moduleOutdatedDependencies;
/******/ 		for(moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				module = installedModules[moduleId];
/******/ 				if(module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					for(j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 						dependency = moduleOutdatedDependencies[j];
/******/ 						idx = module.children.indexOf(dependency);
/******/ 						if(idx >= 0) module.children.splice(idx, 1);
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Not in "apply" phase
/******/ 		hotSetStatus("apply");
/******/ 	
/******/ 		hotCurrentHash = hotUpdateNewHash;
/******/ 	
/******/ 		// insert new code
/******/ 		for(moduleId in appliedUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)) {
/******/ 				modules[moduleId] = appliedUpdate[moduleId];
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// call accept handlers
/******/ 		var error = null;
/******/ 		for(moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				module = installedModules[moduleId];
/******/ 				if(module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					var callbacks = [];
/******/ 					for(i = 0; i < moduleOutdatedDependencies.length; i++) {
/******/ 						dependency = moduleOutdatedDependencies[i];
/******/ 						cb = module.hot._acceptedDependencies[dependency];
/******/ 						if(cb) {
/******/ 							if(callbacks.indexOf(cb) >= 0) continue;
/******/ 							callbacks.push(cb);
/******/ 						}
/******/ 					}
/******/ 					for(i = 0; i < callbacks.length; i++) {
/******/ 						cb = callbacks[i];
/******/ 						try {
/******/ 							cb(moduleOutdatedDependencies);
/******/ 						} catch(err) {
/******/ 							if(options.onErrored) {
/******/ 								options.onErrored({
/******/ 									type: "accept-errored",
/******/ 									moduleId: moduleId,
/******/ 									dependencyId: moduleOutdatedDependencies[i],
/******/ 									error: err
/******/ 								});
/******/ 							}
/******/ 							if(!options.ignoreErrored) {
/******/ 								if(!error)
/******/ 									error = err;
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Load self accepted modules
/******/ 		for(i = 0; i < outdatedSelfAcceptedModules.length; i++) {
/******/ 			var item = outdatedSelfAcceptedModules[i];
/******/ 			moduleId = item.module;
/******/ 			hotCurrentParents = [moduleId];
/******/ 			try {
/******/ 				__webpack_require__(moduleId);
/******/ 			} catch(err) {
/******/ 				if(typeof item.errorHandler === "function") {
/******/ 					try {
/******/ 						item.errorHandler(err);
/******/ 					} catch(err2) {
/******/ 						if(options.onErrored) {
/******/ 							options.onErrored({
/******/ 								type: "self-accept-error-handler-errored",
/******/ 								moduleId: moduleId,
/******/ 								error: err2,
/******/ 								orginalError: err, // TODO remove in webpack 4
/******/ 								originalError: err
/******/ 							});
/******/ 						}
/******/ 						if(!options.ignoreErrored) {
/******/ 							if(!error)
/******/ 								error = err2;
/******/ 						}
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				} else {
/******/ 					if(options.onErrored) {
/******/ 						options.onErrored({
/******/ 							type: "self-accept-errored",
/******/ 							moduleId: moduleId,
/******/ 							error: err
/******/ 						});
/******/ 					}
/******/ 					if(!options.ignoreErrored) {
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// handle errors in accept handlers and self accepted module load
/******/ 		if(error) {
/******/ 			hotSetStatus("fail");
/******/ 			return Promise.reject(error);
/******/ 		}
/******/ 	
/******/ 		hotSetStatus("idle");
/******/ 		return new Promise(function(resolve) {
/******/ 			resolve(outdatedModules);
/******/ 		});
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {},
/******/ 			hot: hotCreateModule(moduleId),
/******/ 			parents: (hotCurrentParentsTemp = hotCurrentParents, hotCurrentParents = [], hotCurrentParentsTemp),
/******/ 			children: []
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// __webpack_hash__
/******/ 	__webpack_require__.h = function() { return hotCurrentHash; };
/******/
/******/ 	// Load entry module and return exports
/******/ 	return hotCreateRequire("./src/app.js")(__webpack_require__.s = "./src/app.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../../libraries/botbuilder-schema/lib/index.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * @module botbuilder-schema
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Defines values for ActivityTypes.
 * Possible values include: 'message', 'contactRelationUpdate',
 * 'conversationUpdate', 'typing', 'ping', 'endOfConversation', 'event',
 * 'invoke', 'deleteUserData', 'messageUpdate', 'messageDelete',
 * 'installationUpdate', 'messageReaction', 'suggestion'
 * There could be more values for this enum apart from the ones defined here.If
 * you want to set a value that is not from the known values then you can do
 * the following:
 * let param: ActivityTypes =
 * <ActivityTypes>"someUnknownValueThatWillStillBeValid";
 * @readonly
 * @enum {string}
 */
var ActivityTypes;
(function (ActivityTypes) {
    ActivityTypes["Message"] = "message";
    ActivityTypes["ContactRelationUpdate"] = "contactRelationUpdate";
    ActivityTypes["ConversationUpdate"] = "conversationUpdate";
    ActivityTypes["Typing"] = "typing";
    ActivityTypes["Ping"] = "ping";
    ActivityTypes["EndOfConversation"] = "endOfConversation";
    ActivityTypes["Event"] = "event";
    ActivityTypes["Invoke"] = "invoke";
    ActivityTypes["DeleteUserData"] = "deleteUserData";
    ActivityTypes["MessageUpdate"] = "messageUpdate";
    ActivityTypes["MessageDelete"] = "messageDelete";
    ActivityTypes["InstallationUpdate"] = "installationUpdate";
    ActivityTypes["MessageReaction"] = "messageReaction";
    ActivityTypes["Suggestion"] = "suggestion";
})(ActivityTypes = exports.ActivityTypes || (exports.ActivityTypes = {}));
/**
 * Defines values for TextFormatTypes.
 * Possible values include: 'markdown', 'plain', 'xml'
 * There could be more values for this enum apart from the ones defined here.If
 * you want to set a value that is not from the known values then you can do
 * the following:
 * let param: TextFormatTypes =
 * <TextFormatTypes>"someUnknownValueThatWillStillBeValid";
 * @readonly
 * @enum {string}
 */
var TextFormatTypes;
(function (TextFormatTypes) {
    TextFormatTypes["Markdown"] = "markdown";
    TextFormatTypes["Plain"] = "plain";
    TextFormatTypes["Xml"] = "xml";
})(TextFormatTypes = exports.TextFormatTypes || (exports.TextFormatTypes = {}));
/**
 * Defines values for AttachmentLayoutTypes.
 * Possible values include: 'list', 'carousel'
 * There could be more values for this enum apart from the ones defined here.If
 * you want to set a value that is not from the known values then you can do
 * the following:
 * let param: AttachmentLayoutTypes =
 * <AttachmentLayoutTypes>"someUnknownValueThatWillStillBeValid";
 * @readonly
 * @enum {string}
 */
var AttachmentLayoutTypes;
(function (AttachmentLayoutTypes) {
    AttachmentLayoutTypes["List"] = "list";
    AttachmentLayoutTypes["Carousel"] = "carousel";
})(AttachmentLayoutTypes = exports.AttachmentLayoutTypes || (exports.AttachmentLayoutTypes = {}));
/**
 * Defines values for MessageReactionTypes.
 * Possible values include: 'like', 'plusOne'
 * There could be more values for this enum apart from the ones defined here.If
 * you want to set a value that is not from the known values then you can do
 * the following:
 * let param: MessageReactionTypes =
 * <MessageReactionTypes>"someUnknownValueThatWillStillBeValid";
 * @readonly
 * @enum {string}
 */
var MessageReactionTypes;
(function (MessageReactionTypes) {
    MessageReactionTypes["Like"] = "like";
    MessageReactionTypes["PlusOne"] = "plusOne";
})(MessageReactionTypes = exports.MessageReactionTypes || (exports.MessageReactionTypes = {}));
/**
 * Defines values for InputHints.
 * Possible values include: 'acceptingInput', 'ignoringInput', 'expectingInput'
 * There could be more values for this enum apart from the ones defined here.If
 * you want to set a value that is not from the known values then you can do
 * the following:
 * let param: InputHints = <InputHints>"someUnknownValueThatWillStillBeValid";
 * @readonly
 * @enum {string}
 */
var InputHints;
(function (InputHints) {
    InputHints["AcceptingInput"] = "acceptingInput";
    InputHints["IgnoringInput"] = "ignoringInput";
    InputHints["ExpectingInput"] = "expectingInput";
})(InputHints = exports.InputHints || (exports.InputHints = {}));
/**
 * Defines values for ActionTypes.
 * Possible values include: 'openUrl', 'imBack', 'postBack', 'playAudio',
 * 'playVideo', 'showImage', 'downloadFile', 'signin', 'call', 'payment',
 * 'messageBack'
 * There could be more values for this enum apart from the ones defined here.If
 * you want to set a value that is not from the known values then you can do
 * the following:
 * let param: ActionTypes =
 * <ActionTypes>"someUnknownValueThatWillStillBeValid";
 * @readonly
 * @enum {string}
 */
var ActionTypes;
(function (ActionTypes) {
    ActionTypes["OpenUrl"] = "openUrl";
    ActionTypes["ImBack"] = "imBack";
    ActionTypes["PostBack"] = "postBack";
    ActionTypes["PlayAudio"] = "playAudio";
    ActionTypes["PlayVideo"] = "playVideo";
    ActionTypes["ShowImage"] = "showImage";
    ActionTypes["DownloadFile"] = "downloadFile";
    ActionTypes["Signin"] = "signin";
    ActionTypes["Call"] = "call";
    ActionTypes["Payment"] = "payment";
    ActionTypes["MessageBack"] = "messageBack";
})(ActionTypes = exports.ActionTypes || (exports.ActionTypes = {}));
/**
 * Defines values for EndOfConversationCodes.
 * Possible values include: 'unknown', 'completedSuccessfully',
 * 'userCancelled', 'botTimedOut', 'botIssuedInvalidMessage', 'channelFailed'
 * There could be more values for this enum apart from the ones defined here.If
 * you want to set a value that is not from the known values then you can do
 * the following:
 * let param: EndOfConversationCodes =
 * <EndOfConversationCodes>"someUnknownValueThatWillStillBeValid";
 * @readonly
 * @enum {string}
 */
var EndOfConversationCodes;
(function (EndOfConversationCodes) {
    EndOfConversationCodes["Unknown"] = "unknown";
    EndOfConversationCodes["CompletedSuccessfully"] = "completedSuccessfully";
    EndOfConversationCodes["UserCancelled"] = "userCancelled";
    EndOfConversationCodes["BotTimedOut"] = "botTimedOut";
    EndOfConversationCodes["BotIssuedInvalidMessage"] = "botIssuedInvalidMessage";
    EndOfConversationCodes["ChannelFailed"] = "channelFailed";
})(EndOfConversationCodes = exports.EndOfConversationCodes || (exports.EndOfConversationCodes = {}));
/**
 * Defines values for ContactRelationUpdateActionTypes.
 * Possible values include: 'add', 'remove'
 * There could be more values for this enum apart from the ones defined here.If
 * you want to set a value that is not from the known values then you can do
 * the following:
 * let param: ContactRelationUpdateActionTypes =
 * <ContactRelationUpdateActionTypes>"someUnknownValueThatWillStillBeValid";
 * @readonly
 * @enum {string}
 */
var ContactRelationUpdateActionTypes;
(function (ContactRelationUpdateActionTypes) {
    ContactRelationUpdateActionTypes["Add"] = "add";
    ContactRelationUpdateActionTypes["Remove"] = "remove";
})(ContactRelationUpdateActionTypes = exports.ContactRelationUpdateActionTypes || (exports.ContactRelationUpdateActionTypes = {}));
/**
 * Defines values for InstallationUpdateActionTypes.
 * Possible values include: 'add', 'remove'
 * There could be more values for this enum apart from the ones defined here.If
 * you want to set a value that is not from the known values then you can do
 * the following:
 * let param: InstallationUpdateActionTypes =
 * <InstallationUpdateActionTypes>"someUnknownValueThatWillStillBeValid";
 * @readonly
 * @enum {string}
 */
var InstallationUpdateActionTypes;
(function (InstallationUpdateActionTypes) {
    InstallationUpdateActionTypes["Add"] = "add";
    InstallationUpdateActionTypes["Remove"] = "remove";
})(InstallationUpdateActionTypes = exports.InstallationUpdateActionTypes || (exports.InstallationUpdateActionTypes = {}));
/**
 * Defines values for ActivityImportance.
 * Possible values include: 'low', 'normal', 'high'
 * There could be more values for this enum apart from the ones defined here.If
 * you want to set a value that is not from the known values then you can do
 * the following:
 * let param: ActivityImportance =
 * <ActivityImportance>"someUnknownValueThatWillStillBeValid";
 * @readonly
 * @enum {string}
 */
var ActivityImportance;
(function (ActivityImportance) {
    ActivityImportance["Low"] = "low";
    ActivityImportance["Normal"] = "normal";
    ActivityImportance["High"] = "high";
})(ActivityImportance = exports.ActivityImportance || (exports.ActivityImportance = {}));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../../libraries/botbuilder/lib/attachmentRecognizer.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const intentRecognizer_1 = __webpack_require__("../../libraries/botbuilder/lib/intentRecognizer.js");
const entityObject_1 = __webpack_require__("../../libraries/botbuilder/lib/entityObject.js");
/**
 * An intent recognizer for detecting that the user has uploaded an attachment.
 *
 * **Usage Example**
 *
 * ```js
 * const bot = new Bot(adapter)
 *      .use(new AttachmentRecognizer())
 *      .onReceive((context) => {
 *          if (context.ifIntent('Intents.AttachmentsReceived')) {
 *              // ... process uploaded file
 *          } else {
 *              // ... default logic
 *          }
 *      });
 * ```
 */
class AttachmentRecognizer extends intentRecognizer_1.IntentRecognizer {
    /**
     * Creates a new instance of the recognizer.
     *
     * @param settings (Optional) settings to customize the recognizer.
     */
    constructor(settings) {
        super();
        this.typeFilters = [];
        this.settings = Object.assign({
            intentName: 'Intents.AttachmentsReceived'
        }, settings);
        this.onRecognize((context) => {
            const intents = [];
            if (context.request.attachments && context.request.attachments.length > 0) {
                // Map attachments to entities
                const entities = [];
                context.request.attachments.forEach((a) => entities.push({
                    type: a.contentType || entityObject_1.EntityTypes.attachment,
                    score: 1.0,
                    value: a
                }));
                // Filter by content type
                if (this.typeFilters.length > 0) {
                    // Sort by content type
                    const matches = {};
                    entities.forEach((entity) => {
                        if (matches.hasOwnProperty(entity.type)) {
                            matches[entity.type].push(entity);
                        }
                        else {
                            matches[entity.type] = [entity];
                        }
                    });
                    // Return intents for matches
                    this.typeFilters.forEach((filter) => {
                        const stringFilter = typeof filter.type === 'string';
                        for (const type in matches) {
                            let addIntent;
                            if (stringFilter) {
                                addIntent = type === filter.type;
                            }
                            else {
                                addIntent = filter.type.test(type);
                            }
                            if (addIntent) {
                                intents.push({
                                    score: 1.0,
                                    name: filter.intentName,
                                    entities: matches[type]
                                });
                            }
                        }
                    });
                }
                else {
                    // Return a single intent for all attachments
                    intents.push({
                        score: 1.0,
                        name: this.settings.intentName,
                        entities: entities
                    });
                }
            }
            return intents;
        });
    }
    /**
     * Add a new content type filter to the recognizer. Adding one or more `contentType()` filters
     * will result in only attachments of the specified type(s) being recognized.
     *
     * @param contentType The `Attachment.contentType` to look for.
     * @param intentName Name of the intent to return when the given type is matched.
     */
    contentType(contentType, intentName) {
        this.typeFilters.push({ type: contentType, intentName: intentName });
        return this;
    }
}
exports.AttachmentRecognizer = AttachmentRecognizer;
//# sourceMappingURL=attachmentRecognizer.js.map

/***/ }),

/***/ "../../libraries/botbuilder/lib/bot.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const middlewareSet_1 = __webpack_require__("../../libraries/botbuilder/lib/middlewareSet.js");
const botbuilder_schema_1 = __webpack_require__("../../libraries/botbuilder-schema/lib/index.js");
const botContext_1 = __webpack_require__("../../libraries/botbuilder/lib/botContext.js");
const templateManager_1 = __webpack_require__("../../libraries/botbuilder/lib/templateManager.js");
const botbuilder_1 = __webpack_require__("../../libraries/botbuilder/lib/botbuilder.js");
/**
 * Manages all communication between the bot and a user.
 *
 * **Usage Example**
 *
 * ```js
 * import { Bot } from 'botbuilder'; // typescript
 *
 * const bot = new Bot(adapter); // init bot and bind to adapter
 *
 * bot.onReceive((context) => { // define the bot's onReceive handler
 *   context.reply(`Hello World`); // send message to user
 * });
 * ```
 */
class Bot extends middlewareSet_1.MiddlewareSet {
    /**
     * Creates a new instance of a bot
     *
     * @param adapter Connector used to link the bot to the user communication wise.
     */
    constructor(adapter) {
        super();
        this.receivers = [];
        // Bind to adapter
        this._adapter = adapter;
        this._adapter.onReceive = (activity) => this.receive(activity).then(() => { });
        // built in middleware
        // QUESTION: Should we really have built-in middleware?
        this.use(new templateManager_1.TemplateManager());
    }
    /** Returns the current adapter. */
    get adapter() {
        return this._adapter;
    }
    /**
     * Creates a new context object given an activity or conversation reference. The context object
     * will be disposed of automatically once the callback completes or the promise it returns
     * completes.
     *
     * **Usage Example**
     *
     * ```js
     * subscribers.forEach((subscriber) => {
     *      bot.createContext(subscriber.savedReference, (context) => {
     *          context.reply(`Hi ${subscriber.name}... Here's what's new with us.`)
     *                 .reply(newsFlash);
     *      });
     * });
     * ```
     *
     * @param activityOrReference Activity or ConversationReference to initialize the context object with.
     * @param onReady Function that will use the created context object.
     */
    createContext(activityOrReference, onReady) {
        // Initialize context object
        let context;
        if (activityOrReference.type) {
            context = botContext_1.createBotContext(this, activityOrReference);
        }
        else {
            context = botContext_1.createBotContext(this);
            context.conversationReference = activityOrReference;
        }
        // Run context created pipeline
        return this.contextCreated(context, function contextReady() {
            // Run proactive or reactive logic
            return Promise.resolve(onReady(context));
        }).then(() => {
            // Next flush any queued up responses
            return context.flushResponses();
        }).then(() => {
            // Dispose of the context object
            context.dispose();
        });
    }
    /**
     * Registers a new receiver with the bot. All incoming activities are routed to receivers in
     * the order they're registered. The first receiver to return `{ handled: true }` prevents
     * the receivers after it from being called.
     *
     * **Usage Example**
     *
     * ```js
     * const bot = new Bot(adapter)
     *      .onReceive((context) => {
     *         context.reply(`Hello World`);
     *      });
     * ```
     *
     * @param receivers One or more receivers to register.
     */
    onReceive(...receivers) {
        receivers.forEach((fn) => {
            this.use({
                receiveActivity: function onReceive(context, next) {
                    return Promise.resolve(fn(context)).then(() => next());
                }
            });
        });
        return this;
    }
    /**
     * Register template renderer  as middleware
     * @param templateRenderer templateRenderer
     */
    useTemplateRenderer(templateRenderer) {
        return this.use({
            contextCreated: (ctx, next) => {
                ctx.templateManager.register(templateRenderer);
                return next();
            }
        });
    }
    /**
     * Register TemplateDictionary as templates
     * @param templates templateDictionary to register
     */
    useTemplates(templates) {
        return this.use(new botbuilder_1.DictionaryRenderer(templates));
    }
    /**
     * INTERNAL sends an outgoing set of activities to the user. Calling `context.flushResponses()` achieves the same
     * effect and is the preferred way of sending activities to the user.
     *
     * @param context Context for the current turn of the conversation.
     * @param activities Set of activities to send.
     */
    post(context, ...activities) {
        // Ensure activities are well formed.
        for (let i = 0; i < activities.length; i++) {
            let activity = activities[i];
            if (!activity.type) {
                activity.type = botbuilder_schema_1.ActivityTypes.Message;
            }
            botContext_1.applyConversationReference(activity, context.conversationReference);
        }
        // Run post activity pipeline
        const adapter = this.adapter;
        return this.postActivity(context, activities, function postActivities() {
            // Post the set of output activities
            return adapter.post(activities)
                .then((responses) => {
                // Ensure responses array populated
                if (!Array.isArray(responses)) {
                    let mockResponses = [];
                    for (let i = 0; i < activities.length; i++) {
                        mockResponses.push({});
                    }
                    return mockResponses;
                }
                return responses;
            });
        });
    }
    /**
     * Dispatches an incoming set of activities. This method can be used to dispatch an activity
     * to the bot as if a user had sent it which is sometimes useful.
     *
     * @param activity The activity that was received.
     * @returns `{ handled: true }` if the activity was handled by a middleware plugin or one of the bots receivers.
     */
    receive(activity) {
        // Create context and run receive activity pipeline
        return this.createContext(activity, (context) => this.receiveActivity(context, () => Promise.resolve()));
    }
}
exports.Bot = Bot;
//# sourceMappingURL=bot.js.map

/***/ }),

/***/ "../../libraries/botbuilder/lib/botContext.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botbuilder_schema_1 = __webpack_require__("../../libraries/botbuilder-schema/lib/index.js");
const bot_1 = __webpack_require__("../../libraries/botbuilder/lib/bot.js");
/**
 * Creates a new BotContext instance.
 *
 * @param bot Bot the context is for.
 * @param request (Optional) request to initialize the context with.
 */
function createBotContext(bot, request) {
    const context = {};
    context.bot = bot;
    context.request = request || {};
    context.responses = [];
    context.conversationReference = {};
    context.state = {};
    context.templateEngines = [];
    // Populate conversation reference
    if (request) {
        context.conversationReference = getConversationReference(request);
    }
    // Add methods
    // !!!!!!! Be sure to use "this." when accessing members of the context object because
    // !!!!!!! you could be working with a clone.
    function throwIfDisposed(method) {
        if (disposed) {
            throw new Error(`BotContext.${method}(): error calling method after context has been disposed.`);
        }
    }
    let disposed = false;
    context.delay = function delay(duration) {
        throwIfDisposed('delay');
        this.responses.push({ type: 'delay', value: duration });
        return this;
    };
    context.dispose = function dispose() {
        disposed = true;
    };
    context.endOfConversation = function endOfConversation(code) {
        throwIfDisposed('endOfConversation');
        const activity = {
            type: botbuilder_schema_1.ActivityTypes.EndOfConversation,
            code: code || botbuilder_schema_1.EndOfConversationCodes.CompletedSuccessfully
        };
        this.responses.push(activity);
        return this;
    };
    context.reply = function reply(textOrActivity, speak, additional) {
        throwIfDisposed('reply');
        // Check other parameters
        if (!additional && typeof speak === 'object') {
            additional = speak;
            speak = undefined;
        }
        if (typeof textOrActivity === 'object') {
            if (!textOrActivity.type) {
                textOrActivity.type = botbuilder_schema_1.ActivityTypes.Message;
            }
            this.responses.push(textOrActivity);
        }
        else {
            const activity = Object.assign({
                type: botbuilder_schema_1.ActivityTypes.Message,
                text: textOrActivity || '',
            }, additional || {});
            if (typeof speak === 'string') {
                activity.speak = speak;
            }
            this.responses.push(activity);
        }
        return this;
    };
    context.replyWith = function replyWith(templateId, data) {
        throwIfDisposed('replyTemplate');
        // push internal template record
        const activity = {
            type: "template",
        };
        activity.text = templateId;
        activity.value = data;
        this.responses.push(activity);
        return this;
    };
    let responded = false;
    context.flushResponses = function flushResponses() {
        throwIfDisposed('flushResponses');
        const args = this.responses.slice(0);
        const cnt = args.length;
        args.unshift(this);
        return bot_1.Bot.prototype.post.apply(this.bot, args)
            .then((results) => {
            if (cnt > 0) {
                this.responses.splice(0, cnt);
                responded = true;
            }
            return results;
        });
    };
    context.showTyping = function showTyping() {
        throwIfDisposed('showTyping');
        this.responses.push({ type: botbuilder_schema_1.ActivityTypes.Typing });
        return this;
    };
    Object.defineProperty(context, 'responded', {
        get: function () {
            return this.responses.length > 0 || responded;
        }
    });
    return context;
}
exports.createBotContext = createBotContext;
function getConversationReference(activity) {
    return {
        activityId: activity.id,
        user: activity.from,
        bot: activity.recipient,
        conversation: activity.conversation,
        channelId: activity.channelId,
        serviceUrl: activity.serviceUrl
    };
}
exports.getConversationReference = getConversationReference;
function applyConversationReference(activity, reference) {
    activity.channelId = reference.channelId;
    activity.serviceUrl = reference.serviceUrl;
    activity.conversation = reference.conversation;
    activity.from = reference.bot;
    activity.recipient = reference.user;
    activity.replyToId = reference.activityId;
}
exports.applyConversationReference = applyConversationReference;
//# sourceMappingURL=botContext.js.map

/***/ }),

/***/ "../../libraries/botbuilder/lib/botService.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Middleware that simplifies adding a new service to the BotContext. Services expose themselves
 * as a new property of the BotContext and this class formalizes that process.
 *
 * This class is typically derived from but can also be used like
 * `bot.use(new BotService('myService', new MyService()));`. The registered service would be
 * accessible globally by developers through `context.myService`.
 *
 * __Extends BotContext:__
 * * context.<service name> - New service
 */
class BotService {
    /**
     * Creates a new instance of a service definition.
     *
     * @param name Name of the service being registered. This is the property off the context object
     * that will be used by developers to access the service.
     * @param instance (Optional) singleton instance of the service to add to the context object.
     * Dynamic instances can be added by implementing [getService()](#getservice).
     */
    constructor(name, instance) {
        this.name = name;
        this.instance = instance;
    }
    contextCreated(context, next) {
        context[this.name] = this.getService(context);
        return next();
    }
    /**
     * Overrided by derived classes to register a dynamic instance of the service.
     *
     * @param context Context for the current turn of the conversation.
     */
    getService(context) {
        return this.instance;
    }
}
exports.BotService = BotService;
//# sourceMappingURL=botService.js.map

/***/ }),

/***/ "../../libraries/botbuilder/lib/botStateManager.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Middleware for tracking conversation and user state using the `context.storage` provider.
 *
 * __Extends BotContext:__
 * * context.state.user - User persisted state
 * * context.state.conversation - Conversation persisted data
 *
 * __Depends on:__
 * * context.storage - Storage provider for storing and retrieving objects
 *
 * **Usage Example**
 *
 * ```js
 * const bot = new Bot(adapter)
 *      .use(new MemoryStorage())
 *      .use(new BotStateManager())
 *      .onReceive((context) => {
 *          context.reply(`Hello World`);
 *      })
 * ```
 */
class BotStateManager {
    /**
     * Creates a new instance of the state manager.
     *
     * @param settings (Optional) settings to adjust the behavior of the state manager.
     */
    constructor(settings) {
        this.settings = Object.assign({
            persistUserState: true,
            persistConversationState: true,
            writeBeforePost: true,
            lastWriterWins: true
        }, settings || {});
    }
    contextCreated(context, next) {
        // read state from storage
        return this.read(context, []).then(() => next());
    }
    postActivity(context, activities, next) {
        if (this.settings.writeBeforePost) {
            // save state
            return this.write(context, {}).then(() => next());
        }
        else {
            return next();
        }
    }
    contextDone(context, next) {
        // save state
        return this.write(context, {}).then(() => next());
    }
    read(context, keys) {
        // Ensure storage
        if (!context.storage) {
            return Promise.reject(new Error(`BotStateManager: context.storage not found.`));
        }
        // Calculate keys
        if (this.settings.persistUserState) {
            keys.push(this.userKey(context));
        }
        if (this.settings.persistConversationState) {
            keys.push(this.conversationKey(context));
        }
        // Read values
        return context.storage.read(keys).then((data) => {
            // Copy data to context
            keys.forEach((key) => {
                switch (key.split('/')[0]) {
                    case 'user':
                        context.state.user = data[key] || {};
                        break;
                    case 'conversation':
                        context.state.conversation = data[key] || {};
                        break;
                }
            });
            return data;
        });
    }
    write(context, changes) {
        // Ensure storage
        if (!context.storage) {
            return Promise.reject(new Error(`BotStateManager: context.storage not found.`));
        }
        // Append changes
        if (this.settings.persistUserState) {
            changes[this.userKey(context)] = context.state.user || {};
        }
        if (this.settings.persistConversationState) {
            changes[this.conversationKey(context)] = context.state.conversation || {};
        }
        // Update eTags
        if (this.settings.lastWriterWins) {
            for (const key in changes) {
                changes[key].eTag = '*';
            }
        }
        // Write changes
        return context.storage.write(changes);
    }
    userKey(context) {
        const ref = context.conversationReference;
        return 'user/' + ref.channelId + '/' + ref.user.id;
    }
    conversationKey(context) {
        const ref = context.conversationReference;
        return 'conversation/' + ref.channelId + '/' + ref.conversation.id;
    }
}
exports.BotStateManager = BotStateManager;
//# sourceMappingURL=botStateManager.js.map

/***/ }),

/***/ "../../libraries/botbuilder/lib/botbuilder.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__("../../libraries/botbuilder/lib/attachmentRecognizer.js"));
__export(__webpack_require__("../../libraries/botbuilder/lib/bot.js"));
__export(__webpack_require__("../../libraries/botbuilder/lib/botService.js"));
__export(__webpack_require__("../../libraries/botbuilder/lib/botStateManager.js"));
__export(__webpack_require__("../../libraries/botbuilder/lib/browserStorage.js"));
__export(__webpack_require__("../../libraries/botbuilder/lib/cardStyler.js"));
__export(__webpack_require__("../../libraries/botbuilder/lib/entityObject.js"));
__export(__webpack_require__("../../libraries/botbuilder/lib/intentRecognizer.js"));
__export(__webpack_require__("../../libraries/botbuilder/lib/intentRecognizerSet.js"));
__export(__webpack_require__("../../libraries/botbuilder/lib/jsonTemplates.test.suite.js"));
__export(__webpack_require__("../../libraries/botbuilder/lib/middleware.js"));
__export(__webpack_require__("../../libraries/botbuilder/lib/memoryStorage.js"));
__export(__webpack_require__("../../libraries/botbuilder/lib/messageStyler.js"));
__export(__webpack_require__("../../libraries/botbuilder/lib/middleware.js"));
__export(__webpack_require__("../../libraries/botbuilder/lib/middlewareSet.js"));
__export(__webpack_require__("../../libraries/botbuilder/lib/regExpRecognizer.js"));
__export(__webpack_require__("../../libraries/botbuilder/lib/storageMiddleware.js"));
__export(__webpack_require__("../../libraries/botbuilder/lib/templateManager.js"));
__export(__webpack_require__("../../libraries/botbuilder/lib/dictionaryRenderer.js"));
__export(__webpack_require__("../../libraries/botbuilder/lib/testAdapter.js"));
__export(__webpack_require__("../../libraries/botbuilder-schema/lib/index.js"));
//# sourceMappingURL=botbuilder.js.map

/***/ }),

/***/ "../../libraries/botbuilder/lib/browserStorage.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const memoryStorage_1 = __webpack_require__("../../libraries/botbuilder/lib/memoryStorage.js");
/**
 * Storage middleware that uses browser local storage.
 *
 * __Extends BotContext:__
 * * context.storage - Storage provider for storing and retrieving objects.
 *
 * **Usage Example**
 *
 * ```js
 * const bot = new Bot(adapter)
 *      .use(new BrowserLocalStorage())
 *      .use(new BotStateManage())
 *      .onReceive((context) => {
 *          context.reply(`Hello World`);
 *      })
 * ```
 */
class BrowserLocalStorage extends memoryStorage_1.MemoryStorage {
    constructor(options) {
        super(options, localStorage);
    }
}
exports.BrowserLocalStorage = BrowserLocalStorage;
/**
 * Storage middleware that uses browser session storage.
 *
 * __Extends BotContext:__
 * * context.storage - Storage provider for storing and retrieving objects.
 *
 * **Usage Example**
 *
 * ```js
 * const bot = new Bot(adapter)
 *      .use(new BrowserSessionStorage())
 *      .use(new BotStateManage())
 *      .onReceive((context) => {
 *          context.reply(`Hello World`);
 *      })
 * ```
 */
class BrowserSessionStorage extends memoryStorage_1.MemoryStorage {
    constructor(options) {
        super(options, sessionStorage);
    }
}
exports.BrowserSessionStorage = BrowserSessionStorage;
//# sourceMappingURL=browserStorage.js.map

/***/ }),

/***/ "../../libraries/botbuilder/lib/cardStyler.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botbuilder_schema_1 = __webpack_require__("../../libraries/botbuilder-schema/lib/index.js");
/**
 * A set of utility functions designed to assist with the formatting of the various card types a
 * bot can return. All of these functions return an `Attachment` which can be added to an `Activity`
 * directly or passed as input to a `MessageStyler` function.
 *
 * **Usage Example**
 *
 * ```js
 * const card = CardStyler.heroCard(
 *      'White T-Shirt',
 *      ['https://example.com/whiteShirt.jpg'],
 *      ['buy']
 * );
 * ```
 */
class CardStyler {
    /**
     * Returns an attachment for an adaptive card. The attachment will contain the card and the
     * appropriate `contentType`.
     *
     * Adaptive Cards are a new way for bots to send interactive and immersive card content to
     * users. For channels that don't yet support Adaptive Cards natively, the Bot Framework will
     * down render the card to an image that's been styled to look good on the target channel. For
     * channels that support [hero cards](#herocards) you can continue to include Adaptive Card
     * actions and they will be sent as buttons along with the rendered version of the card.
     *
     * For more information about Adaptive Cards and to download the latest SDK, visit
     * [adaptivecards.io](http://adaptivecards.io/).
     *
     * @param card The adaptive card to return as an attachment.
     */
    static adaptiveCard(card) {
        return { contentType: CardStyler.contentTypes.adaptiveCard, content: card };
    }
    /**
     * Returns an attachment for an animation card.
     *
     * @param title The cards title.
     * @param media Media URL's for the card.
     * @param buttons (Optional) set of buttons to include on the card.
     * @param other (Optional) additional properties to include on the card.
     */
    static animationCard(title, media, buttons, other) {
        return mediaCard(CardStyler.contentTypes.animationCard, title, media, buttons, other);
    }
    /**
     * Returns an attachment for an audio card.
     *
     * @param title The cards title.
     * @param media Media URL's for the card.
     * @param buttons (Optional) set of buttons to include on the card.
     * @param other (Optional) additional properties to include on the card.
     */
    static audioCard(title, media, buttons, other) {
        return mediaCard(CardStyler.contentTypes.audioCard, title, media, buttons, other);
    }
    static heroCard(title, text, images, buttons, other) {
        const a = CardStyler.thumbnailCard(title, text, images, buttons, other);
        a.contentType = CardStyler.contentTypes.heroCard;
        return a;
    }
    /**
     * Returns an attachment for a receipt card. The attachment will contain the card and the
     * appropriate `contentType`.
     *
     * @param card The adaptive card to return as an attachment.
     */
    static receiptCard(card) {
        return { contentType: CardStyler.contentTypes.receiptCard, content: card };
    }
    /**
     * Returns an attachment for a signin card. For channels that don't natively support signin
     * cards an alternative message will be rendered.
     *
     * @param title The cards title.
     * @param url The link to the signin page the user needs to visit.
     * @param text (Optional) additional text to include on the card.
     */
    static signinCard(title, url, text) {
        const card = { buttons: [{ type: botbuilder_schema_1.ActionTypes.Signin, title: title, value: url }] };
        if (text) {
            card.text = text;
        }
        return { contentType: CardStyler.contentTypes.signinCard, content: card };
    }
    static thumbnailCard(title, text, images, buttons, other) {
        if (typeof text !== 'string') {
            other = buttons;
            buttons = images;
            images = text;
            text = undefined;
        }
        const card = Object.assign({}, other);
        if (title) {
            card.title = title;
        }
        if (text) {
            card.text = text;
        }
        if (images) {
            card.images = CardStyler.images(images);
        }
        if (buttons) {
            card.buttons = CardStyler.actions(buttons);
        }
        return { contentType: CardStyler.contentTypes.thumbnailCard, content: card };
    }
    /**
     * Returns an attachment for a video card.
     *
     * @param title The cards title.
     * @param media Media URL's for the card.
     * @param buttons (Optional) set of buttons to include on the card.
     * @param other (Optional) additional properties to include on the card.
     */
    static videoCard(title, media, buttons, other) {
        return mediaCard(CardStyler.contentTypes.videoCard, title, media, buttons, other);
    }
    /**
     * Returns a properly formatted array of actions. Supports converting strings to `messageBack`
     * actions (note: using 'imBack' for now as 'messageBack' doesn't work properly in emulator.)
     *
     * @param actions Array of card actions or strings. Strings will be converted to `messageBack` actions.
     */
    static actions(actions) {
        const list = [];
        (actions || []).forEach((a) => {
            if (typeof a === 'object') {
                list.push(a);
            }
            else {
                list.push({ type: botbuilder_schema_1.ActionTypes.ImBack, value: a.toString(), title: a.toString() });
            }
        });
        return list;
    }
    /**
     * Returns a properly formatted array of card images.
     *
     * @param images Array of card images or strings. Strings will be converted to card images.
     */
    static images(images) {
        const list = [];
        (images || []).forEach((img) => {
            if (typeof img === 'object') {
                list.push(img);
            }
            else {
                list.push({ url: img });
            }
        });
        return list;
    }
    /**
     * Returns a properly formatted array of media url objects.
     *
     * @param links Array of media url objects or strings. Strings will be converted to a media url object.
     */
    static media(links) {
        const list = [];
        (links || []).forEach((lnk) => {
            if (typeof lnk === 'object') {
                list.push(lnk);
            }
            else {
                list.push({ url: lnk });
            }
        });
        return list;
    }
}
/** List of content types for each card style. */
CardStyler.contentTypes = {
    adaptiveCard: 'application/vnd.microsoft.card.adaptive',
    animationCard: 'application/vnd.microsoft.card.animation',
    audioCard: 'application/vnd.microsoft.card.audio',
    heroCard: 'application/vnd.microsoft.card.hero',
    receiptCard: 'application/vnd.microsoft.card.receipt',
    signinCard: 'application/vnd.microsoft.card.signin',
    thumbnailCard: 'application/vnd.microsoft.card.thumbnail',
    videoCard: 'application/vnd.microsoft.card.video'
};
exports.CardStyler = CardStyler;
function mediaCard(contentType, title, media, buttons, other) {
    const card = Object.assign({}, other);
    if (title) {
        card.title = title;
    }
    if (media) {
        card.media = CardStyler.media(media);
    }
    if (buttons) {
        card.buttons = CardStyler.actions(buttons);
    }
    return { contentType: contentType, content: card };
}
//# sourceMappingURL=cardStyler.js.map

/***/ }),

/***/ "../../libraries/botbuilder/lib/dictionaryRenderer.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This is a simple template renderer which has a resource map of template functions
 * let myTemplates  = {
 *      "en" : {
 *          "templateId": (context, data) => `your name  is ${data.name}`
 *      }
 * }
 *
 * To use, simply add to your pipeline
 * bot.use(new DictionaryRenderer(myTemplates))
 */
class DictionaryRenderer {
    constructor(templates) {
        this.templates = templates;
    }
    contextCreated(context, next) {
        context.templateManager.register(this);
        return next();
    }
    renderTemplate(context, language, templateId, data) {
        if (!(language in this.templates)) {
            //console.warn(`didn't find language ${language}`);
            return Promise.resolve(undefined);
        }
        let languageResource = this.templates[language];
        if (!(templateId in languageResource)) {
            //console.warn(`didn't find templateId ${templateId}`);
            return Promise.resolve(undefined);
        }
        let template = languageResource[templateId];
        return Promise.resolve(template(context, data));
    }
}
exports.DictionaryRenderer = DictionaryRenderer;
//# sourceMappingURL=dictionaryRenderer.js.map

/***/ }),

/***/ "../../libraries/botbuilder/lib/entityObject.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** Well known entity types. */
exports.EntityTypes = {
    attachment: 'attachment',
    string: 'string',
    number: 'number',
    boolean: 'boolean'
};
//# sourceMappingURL=entityObject.js.map

/***/ }),

/***/ "../../libraries/botbuilder/lib/intentRecognizer.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Middleware that's the base class for all intent recognizers.
 *
 * __Extends BotContext:__
 * * context.topIntent - The top recognized `Intent` for the users utterance.
 */
class IntentRecognizer {
    constructor() {
        this.enabledChain = [];
        this.recognizeChain = [];
        this.filterChain = [];
    }
    receiveActivity(context, next) {
        return this.recognize(context)
            .then((intents) => IntentRecognizer.findTopIntent(intents))
            .then((intent) => {
            if (intent && intent.score > 0.0) {
                context.topIntent = intent;
            }
            return next();
        });
    }
    /**
     * Recognizes intents for the current context. The return value is 0 or more recognized intents.
     *
     * @param context Context for the current turn of the conversation.
     */
    recognize(context) {
        return new Promise((resolve, reject) => {
            this.runEnabled(context)
                .then((enabled) => {
                if (enabled) {
                    this.runRecognize(context)
                        .then((intents) => this.runFilter(context, intents || []))
                        .then((intents) => resolve(intents))
                        .catch((err) => reject(err));
                }
                else {
                    resolve([]);
                }
            })
                .catch((err) => reject(err));
        });
    }
    /**
     * Adds a handler that lets you conditionally determine if a recognizer should run. Multiple
     * handlers can be registered and they will be called in the reverse order they are added
     * so the last handler added will be the first called.
     *
     * @param handler Function that will be called anytime the recognizer is run. If the handler
     * returns true the recognizer will be run. Returning false disables the recognizer.
     */
    onEnabled(handler) {
        this.enabledChain.unshift(handler);
        return this;
    }
    /**
     * Adds a handler that will be called to recognize the users intent. Multiple handlers can
     * be registered and they will be called in the reverse order they are added so the last
     * handler added will be the first called.
     *
     * @param handler Function that will be called to recognize a users intent.
     */
    onRecognize(handler) {
        this.recognizeChain.unshift(handler);
        return this;
    }
    /**
     * Adds a handler that will be called post recognition to filter the output of the recognizer.
     * The filter receives all of the intents that were recognized and can return a subset, or
     * additional, or even all new intents as its response. This filtering adds a convenient second
     * layer of processing to intent recognition. Multiple handlers can be registered and they will
     * be called in the order they are added.
     *
     * @param handler Function that will be called to filter the output intents. If an array is returned
     * that will become the new set of output intents passed on to the next filter. The final filter in
     * the chain will reduce the output set of intents to a single top scoring intent.
     */
    onFilter(handler) {
        this.filterChain.push(handler);
        return this;
    }
    runEnabled(context) {
        return new Promise((resolve, reject) => {
            const chain = this.enabledChain.slice();
            function next(i) {
                if (i < chain.length) {
                    try {
                        Promise.resolve(chain[i](context)).then((enabled) => {
                            if (typeof enabled === 'boolean' && enabled === false) {
                                resolve(false); // Short-circuit chain
                            }
                            else {
                                next(i + 1);
                            }
                        }).catch((err) => reject(err));
                    }
                    catch (err) {
                        reject(err);
                    }
                }
                else {
                    resolve(true);
                }
            }
            next(0);
        });
    }
    runRecognize(context) {
        return new Promise((resolve, reject) => {
            let intents = [];
            const chain = this.recognizeChain.slice();
            function next(i) {
                if (i < chain.length) {
                    try {
                        Promise.resolve(chain[i](context)).then((result) => {
                            if (Array.isArray(result)) {
                                intents = intents.concat(result);
                            }
                            next(i + 1);
                        }).catch((err) => reject(err));
                    }
                    catch (err) {
                        reject(err);
                    }
                }
                else {
                    resolve(intents);
                }
            }
            next(0);
        });
    }
    runFilter(context, intents) {
        return new Promise((resolve, reject) => {
            let filtered = intents;
            const chain = this.filterChain.slice();
            function next(i) {
                if (i < chain.length) {
                    try {
                        Promise.resolve(chain[i](context, filtered)).then((result) => {
                            if (Array.isArray(result)) {
                                filtered = result;
                            }
                            next(i + 1);
                        }).catch((err) => reject(err));
                    }
                    catch (err) {
                        reject(err);
                    }
                }
                else {
                    resolve(filtered);
                }
            }
            next(0);
        });
    }
    /**
     * Finds the top scoring intent given a set of intents.
     *
     * @param intents Array of intents to filter.
     */
    static findTopIntent(intents) {
        return new Promise((resolve, reject) => {
            let top = undefined;
            (intents || []).forEach((intent) => {
                if (!top || intent.score > top.score) {
                    top = intent;
                }
            });
            resolve(top);
        });
    }
}
exports.IntentRecognizer = IntentRecognizer;
//# sourceMappingURL=intentRecognizer.js.map

/***/ }),

/***/ "../../libraries/botbuilder/lib/intentRecognizerSet.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const intentRecognizer_1 = __webpack_require__("../../libraries/botbuilder/lib/intentRecognizer.js");
var RecognizeOrder;
(function (RecognizeOrder) {
    RecognizeOrder[RecognizeOrder["parallel"] = 0] = "parallel";
    RecognizeOrder[RecognizeOrder["series"] = 1] = "series";
})(RecognizeOrder = exports.RecognizeOrder || (exports.RecognizeOrder = {}));
/**
 * Optimizes the execution of multiple intent recognizers. An intent recognizer set can be
 * configured to execute its recognizers either in parallel (the default) or in series. The
 * output of the set will be a single intent that had the highest score.
 *
 * The intent recognizer set is itself an intent recognizer which means that it can be
 * conditionally disabled or have its output filtered just like any other recognizer. It can
 * even be composed into other recognizer sets allowing for sophisticated recognizer
 * hierarchies to be created.
 *
 * **Usage Example**
 *
 * ```js
 * // Define RegExp's for well known commands.
 * const recognizer = new RegExpRecognizer({ minScore: 1.0 })
 *      .addIntent('HelpIntent', /^help/i)
 *      .addIntent('CancelIntent', /^cancel/i);
 *
 * // Create a set that will only call LUIS for unknown commands.
 * const recognizerSet = new IntentRecognizerSet({ recognizeOrder: RecognizeOrder.series })
 *      .add(recognizer)
 *      .add(new LuisRecognizer('Model ID', 'Subscription Key'));
 *
 * // Add set to bot.
 * const bot = new Bot(adapter)
 *      .use(recognizerSet)
 *      .onReceive((context) => {
 *          if (context.ifIntent('HelpIntent')) {
 *              // ... help
 *          } else if (context.ifIntent('CancelIntent')) {
 *              // ... cancel
 *          } else {
 *              // ... default logic
 *          }
 *      });
 * ```
 */
class IntentRecognizerSet extends intentRecognizer_1.IntentRecognizer {
    /**
     * Creates a new instance of a recognizer set.
     *
     * @param settings (Optional) settings to customize the sets execution strategy.
     */
    constructor(settings) {
        super();
        this.recognizers = [];
        this.settings = Object.assign({
            recognizeOrder: RecognizeOrder.parallel,
            stopOnExactMatch: true
        }, settings);
        this.onRecognize((context) => {
            if (this.settings.recognizeOrder === RecognizeOrder.parallel) {
                return this.recognizeInParallel(context);
            }
            else {
                return this.recognizeInSeries(context);
            }
        });
    }
    /**
     * Adds recognizer(s) to the set. Recognizers will be evaluated in the order they're
     * added to the set.
     *
     * @param recognizers One or more recognizers to add to the set.
     */
    add(...recognizers) {
        Array.prototype.push.apply(this.recognizers, recognizers);
        return this;
    }
    recognizeInParallel(context) {
        // Call recognize on all children
        const promises = [];
        this.recognizers.forEach((r) => promises.push(r.recognize(context)));
        // Wait for all of the promises to resolve
        return Promise.all(promises).then((results) => {
            // Merge intents
            let intents = [];
            results.forEach((r) => intents = intents.concat(r));
            return intents;
        });
    }
    recognizeInSeries(context) {
        return new Promise((resolve, reject) => {
            let intents = [];
            const that = this;
            function next(i) {
                if (i < that.recognizers.length) {
                    that.recognizers[i].recognize(context)
                        .then((r) => {
                        intents = intents.concat(r);
                        if (that.settings.stopOnExactMatch && that.hasExactMatch(r)) {
                            resolve(intents);
                        }
                        else {
                            next(i + 1);
                        }
                    })
                        .catch((err) => reject(err));
                }
                else {
                    resolve(intents);
                }
            }
            next(0);
        });
    }
    hasExactMatch(intents) {
        return intents.filter((intent) => intent.score >= 1.0).length > 0;
    }
}
exports.IntentRecognizerSet = IntentRecognizerSet;
//# sourceMappingURL=intentRecognizerSet.js.map

/***/ }),

/***/ "../../libraries/botbuilder/lib/jsonTemplates.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Template source for rendering dynamic JSON objects. To use add to the pipeline
 * bot
 *    .use(new JsonTemplateEngine()
 *          .add('templateId', function()=>{} ))
 */
class JsonTemplates {
    constructor() {
        this.templates = {};
    }
    contextCreated(context, next) {
        context.templateManager.register(this);
        return next();
    }
    renderTemplate(context, language, templateId, data) {
        var result = this.render(`${language}-${templateId}`, data);
        if (result)
            return Promise.resolve(JSON.parse(result));
        return Promise.resolve(undefined);
    }
    /**
     * Registers a new JSON template. The template will be compiled and cached.
     *
     * @param name Name of the template to register.
     * @param json JSON template.
     */
    add(name, json) {
        this.templates[name] = JsonTemplates.compile(json, this.templates);
        return this;
    }
    /**
     * Registers a named function that can be called within a template.
     *
     * @param name Name of the function to register.
     * @param fn Function to register.
     */
    addFunction(name, fn) {
        this.templates[name] = fn;
        return this;
    }
    /**
     * Renders a registered JSON template to a string using the given data object.
     *
     * @param name Name of the registered template to render.
     * @param data Data object to render template against.
     */
    render(name, data) {
        let template = this.templates[name];
        if (!template)
            return undefined;
        return template(data);
    }
    /**
     * Renders a registered JSON template using the given data object. The rendered string will
     * be `JSON.parsed()` into a JSON object prior to returning.
     *
     * @param name Name of the registered template to render.
     * @param data Data object to render template against.
     * @param postProcess (Optional) if `true` the rendered output object will be scanned looking
     * for any processing directives, such as @prune. The default value is `true`.
     */
    renderAsJSON(name, data, postProcess) {
        var json = this.render(name, data);
        if (!json)
            return null;
        let obj = JSON.parse(json);
        if (postProcess || postProcess === undefined) {
            obj = this.postProcess(obj);
        }
        return obj;
    }
    /**
     * Post processes a JSON object by walking the object and evaluating any processing directives
     * like @prune.
     * @param object Object to post process.
     */
    postProcess(object) {
        if (!processNode(object, {})) {
            // Failed top level @if condition
            return undefined;
        }
        return object;
    }
    /**
     * Compiles a JSON template into a function that can be called to render a JSON object using
     * a data object.
     *
     * @param json The JSON template to compile.
     * @param templates (Optional) map of template functions (and other compiled templates) that
     * can be called at render time.
     */
    static compile(json, templates) {
        // Convert objects to strings for parsing
        if (typeof json !== 'string') {
            json = JSON.stringify(json);
        }
        // Parse JSON into an array of template functions. These will be called in order
        // to build up the output JSON object as a string.
        const parsed = parse(json, templates);
        // Return closure that will execute the parsed template.
        return (data, path) => {
            // Check for optional path.
            // - Templates can be executed as children of other templates so the path
            //   specifies the property off the parent to execute the template for.
            let obj = '';
            if (path) {
                const value = getValue(data, path);
                if (Array.isArray(value)) {
                    // Execute for each child object
                    let connector = '';
                    obj += '[';
                    value.forEach((child) => {
                        obj += connector;
                        parsed.forEach((fn) => obj += fn(child));
                        connector = ',';
                    });
                    obj += ']';
                }
                else if (typeof value === 'object') {
                    parsed.forEach((fn) => obj += fn(value));
                }
            }
            else {
                parsed.forEach((fn) => obj += fn(data));
            }
            return obj;
        };
    }
}
exports.JsonTemplates = JsonTemplates;
var ParseState;
(function (ParseState) {
    ParseState[ParseState["none"] = 0] = "none";
    ParseState[ParseState["string"] = 1] = "string";
    ParseState[ParseState["path"] = 2] = "path";
})(ParseState || (ParseState = {}));
function parse(json, templates) {
    const parsed = [];
    let txt = '';
    let endString = '';
    let endPath = '';
    let nextState = ParseState.none;
    let state = ParseState.none;
    for (let i = 0, l = json.length; i < l; i++) {
        const char = json[i];
        switch (state) {
            case ParseState.none:
            default:
                if ((char == '\'' || char == '"') && i < (l - 1)) {
                    // Check for literal
                    if (json[i + 1] == '!') {
                        i++; // <- skip next char
                        state = ParseState.path;
                        parsed.push(appendText(txt));
                        endPath = char;
                        nextState = ParseState.none;
                        txt = '';
                    }
                    else {
                        state = ParseState.string;
                        endString = char;
                        txt += char;
                    }
                }
                else {
                    txt += char;
                }
                break;
            case ParseState.string:
                if (char == '$' && i < (l - 1) && json[i + 1] == '{') {
                    i++; // <- skip next char
                    state = ParseState.path;
                    parsed.push(appendText(txt));
                    endPath = '}';
                    nextState = ParseState.string;
                    txt = '';
                }
                else if (char == endString && json[i - 1] !== '\\') {
                    state = ParseState.none;
                    txt += char;
                }
                else {
                    txt += char;
                }
                break;
            case ParseState.path:
                if (char == endPath) {
                    state = nextState;
                    const trimmed = txt.trim();
                    if (trimmed && trimmed[trimmed.length - 1] == ')') {
                        let open = txt.indexOf('(');
                        const close = txt.lastIndexOf(')');
                        if (open && close) {
                            const name = txt.substr(0, open++);
                            const args = close > open ? txt.substr(open, close - open) : '';
                            parsed.push(appendFunction(name, args, templates));
                        }
                        else {
                            parsed.push(appendProperty(txt));
                        }
                    }
                    else {
                        parsed.push(appendProperty(txt));
                    }
                    txt = '';
                }
                else {
                    txt += char;
                }
                break;
        }
    }
    if (txt.length > 0) {
        parsed.push(appendText(txt));
    }
    return parsed;
}
function appendText(text) {
    return (data) => text;
}
function appendFunction(name, args, templates) {
    return (data) => {
        const result = templates[name](data, args);
        return typeof result === 'string' ? result : JSON.stringify(result);
    };
}
function appendProperty(path) {
    return (data) => {
        const result = getValue(data, path);
        if (typeof result === 'string') {
            return result;
        }
        else if (result === undefined || result === null) {
            return '';
        }
        return JSON.stringify(result);
    };
}
function getValue(data, path) {
    let value = data;
    const parts = path.split('.');
    for (let i = 0, l = parts.length; i < l; i++) {
        const member = parts[i].trim();
        if (typeof value === 'object') {
            value = value[member];
        }
        else {
            value = undefined;
            break;
        }
    }
    return value;
}
function processNode(node, prune) {
    if (Array.isArray(node)) {
        // Process array members
        for (let i = node.length - 1; i >= 0; i--) {
            const value = node[i];
            if ((prune.nullMembers && (value === undefined || value === null)) ||
                !processNode(value, prune)) {
                // Remove array member
                node.splice(i, 1);
            }
        }
        // Prune out the array if it's now empty
        if (prune.emptyArrays && node.length == 0) {
            return false;
        }
    }
    else if (typeof node === 'object') {
        // Process object members
        let conditions = [];
        for (const key in node) {
            const value = node[key];
            if (key === '@prune') {
                // Clone and update pruning options
                prune = Object.assign({}, prune, value);
                delete node[key];
            }
            else if (key === '@if') {
                // Defer processing of condition until after the entire node and
                // children have been evaluated.
                conditions.push(value);
                delete node[key];
            }
            else {
                // Prune members
                if (prune.nullMembers && (value === undefined || value === null)) {
                    delete node[key];
                }
                else if (prune.emptyStrings && typeof value === 'string' && value.trim().length == 0) {
                    delete node[key];
                }
                else if (prune.emptyArrays && Array.isArray(value) && value.length == 0) {
                    delete node[key];
                }
                else if (!processNode(value, prune)) {
                    // @if condition failed so prune it.
                    delete node[key];
                }
            }
        }
        // Process @if conditions
        // - multiple @if conditions are AND'ed
        for (let i = 0; i < conditions.length; i++) {
            if (!getValue(node, conditions[i])) {
                return false;
            }
        }
    }
    return true;
}
//# sourceMappingURL=jsonTemplates.js.map

/***/ }),

/***/ "../../libraries/botbuilder/lib/memoryStorage.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const storageMiddleware_1 = __webpack_require__("../../libraries/botbuilder/lib/storageMiddleware.js");
/**
 * Middleware that implements an in memory based storage provider for a bot.
 *
 * __Extends BotContext:__
 * * context.storage - Storage provider for storing and retrieving objects.
 *
 * **Usage Example**
 *
 * ```js
 * const bot = new Bot(adapter)
 *      .use(new MemoryStorage())
 *      .use(new BotStateManage())
 *      .onReceive((context) => {
 *          context.reply(`Hello World`);
 *      })
 * ```
 */
class MemoryStorage extends storageMiddleware_1.StorageMiddleware {
    /**
     * Creates a new instance of the storage provider.
     *
     * @param settings (Optional) setting to configure the provider.
     * @param memory (Optional) memory to use for storing items.
     */
    constructor(settings, memory = {}) {
        super(settings || {});
        this.memory = memory;
        this.etag = 1;
    }
    read(keys) {
        return new Promise((resolve, reject) => {
            const data = {};
            (keys || []).forEach((key) => {
                const item = this.memory[key];
                if (item) {
                    data[key] = JSON.parse(item);
                }
            });
            resolve(data);
        });
    }
    ;
    write(changes) {
        const that = this;
        function saveItem(key, item) {
            const clone = Object.assign({}, item);
            clone.eTag = (that.etag++).toString();
            that.memory[key] = JSON.stringify(clone);
        }
        return new Promise((resolve, reject) => {
            for (const key in changes) {
                const newItem = changes[key];
                const old = this.memory[key];
                if (!old || newItem.eTag === '*') {
                    saveItem(key, newItem);
                }
                else {
                    const oldItem = JSON.parse(old);
                    if (newItem.eTag === oldItem.eTag) {
                        saveItem(key, newItem);
                    }
                    else {
                        reject(new Error(`Storage: error writing "${key}" due to eTag conflict.`));
                    }
                }
            }
            resolve();
        });
    }
    ;
    delete(keys) {
        return new Promise((resolve, reject) => {
            (keys || []).forEach((key) => this.memory[key] = undefined);
            resolve();
        });
    }
    getStorage(context) {
        return this;
    }
}
exports.MemoryStorage = MemoryStorage;
//# sourceMappingURL=memoryStorage.js.map

/***/ }),

/***/ "../../libraries/botbuilder/lib/messageStyler.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const cardStyler_1 = __webpack_require__("../../libraries/botbuilder/lib/cardStyler.js");
const botbuilder_schema_1 = __webpack_require__("../../libraries/botbuilder-schema/lib/index.js");
/**
 * A set of utility functions to assist with the formatting of the various message types a bot can
 * return.
 *
 * **Usage Example**
 *
 * ```js
 * // init message object
 * const message = MessageStyler.attachment(
 *     CardStyler.heroCard(
 *         'White T-Shirt',
 *         ['https://example.com/whiteShirt.jpg'],
 *         ['buy']
 *      )
 * );
 *
 * context.reply(message); // send message
 * ```
 */
class MessageStyler {
    /**
     * Returns a simple text message.
     *
     * **Usage Example**
     *
     * ```js
     * // init message object
     * const basicMessage = MessageStyler.text('Greetings from example message');
     *
     * context.reply(basicMessage); // send message
     * ```
     *
     * @param text Text to include in the message.
     * @param speak (Optional) SSML to include in the message.
     */
    static text(text, speak) {
        const msg = {
            type: botbuilder_schema_1.ActivityTypes.Message,
            text: text || ''
        };
        if (speak) {
            msg.speak = speak;
        }
        return msg;
    }
    /**
     * Returns a message that includes a set of suggested actions and optional text.
     *
     * @param actions Array of card actions or strings to include. Strings will be converted to `messageBack` actions.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to include with the message.
     */
    static suggestedActions(actions, text, speak) {
        const msg = {
            type: botbuilder_schema_1.ActivityTypes.Message,
            suggestedActions: {
                actions: cardStyler_1.CardStyler.actions(actions)
            }
        };
        if (text) {
            msg.text = text;
        }
        if (speak) {
            msg.speak = speak;
        }
        return msg;
    }
    /**
     * Returns a single message activity containing an attachment.
     *
     * @param attachment Adaptive card to include in the message.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to include with the message.
     */
    static attachment(attachment, text, speak) {
        return attachmentActivity(botbuilder_schema_1.AttachmentLayoutTypes.List, [attachment], text, speak);
    }
    /**
     * Returns a message that will display a set of attachments in list form.
     *
     * @param attachments Array of attachments to include in the message.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to include with the message.
     */
    static list(attachments, text, speak) {
        return attachmentActivity(botbuilder_schema_1.AttachmentLayoutTypes.List, attachments, text, speak);
    }
    /**
     * Returns a message that will display a set of attachments using a carousel layout.
     *
     * **Usage Example**
     *
     * ```js
     * // init message object
     * let messageWithCarouselOfCards = MessageStyler.carousel([
     *   CardStyler.heroCard('title1', ['imageUrl1'], ['button1']),
     *   CardStyler.heroCard('title2', ['imageUrl2'], ['button2']),
     *   CardStyler.heroCard('title3', ['imageUrl3'], ['button3'])
     * ]);
     *
     * context.reply(messageWithCarouselOfCards); // send the message
     * ```
     *
     * @param attachments Array of attachments to include in the message.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to include with the message.
     */
    static carousel(attachments, text, speak) {
        return attachmentActivity(botbuilder_schema_1.AttachmentLayoutTypes.Carousel, attachments, text, speak);
    }
    /**
     * Returns a message that will display a single image or video to a user.
     *
     * **Usage Example**
     *
     * ```js
     * // init message object
     * let imageOrVideoMessage = MessageStyler.contentUrl('url', 'content-type', 'optional-name', 'optional-text', 'optional-speak');
     *
     * context.reply(imageOrVideoMessage); // send the message
     * ```
     *
     * @param url Url of the image/video to send.
     * @param contentType The MIME type of the image/video.
     * @param name (Optional) Name of the image/video file.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to include with the message.
     */
    static contentUrl(url, contentType, name, text, speak) {
        const a = { contentType: contentType, contentUrl: url };
        if (name) {
            a.name = name;
        }
        return attachmentActivity(botbuilder_schema_1.AttachmentLayoutTypes.List, [a], text, speak);
    }
}
exports.MessageStyler = MessageStyler;
function attachmentActivity(attachmentLayout, attachments, text, speak) {
    const msg = {
        type: botbuilder_schema_1.ActivityTypes.Message,
        attachmentLayout: attachmentLayout,
        attachments: attachments
    };
    if (text) {
        msg.text = text;
    }
    if (speak) {
        msg.speak = speak;
    }
    return msg;
}
//# sourceMappingURL=messageStyler.js.map

/***/ }),

/***/ "../../libraries/botbuilder/lib/middleware.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns true if a result that can (Optionally) be a Promise looks like a Promise.
 * @param result The result to test.
 */
function isPromised(result) {
    return result && result.then !== undefined;
}
exports.isPromised = isPromised;
//# sourceMappingURL=middleware.js.map

/***/ }),

/***/ "../../libraries/botbuilder/lib/middlewareSet.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A set of `Middleware` plugins. The set itself is middleware so you can easily package up a set
 * of middleware that can be composed into a bot with a single `bot.use(mySet)` call or even into
 * another middleware set using `set.use(mySet)`.
 */
class MiddlewareSet {
    constructor() {
        this._middleware = [];
    }
    /**
     * Returns the underlying array of middleware.
     */
    get middleware() {
        return this._middleware;
    }
    /**
     * Registers middleware plugin(s) with the bot or set.
     *
     * @param middleware One or more middleware plugin(s) to register.
     */
    use(...middleware) {
        Array.prototype.push.apply(this._middleware, middleware);
        return this;
    }
    contextCreated(context, next) {
        function callMiddleware(set, i) {
            try {
                if (i < set.length) {
                    const plugin = set[i];
                    if (plugin.contextCreated !== undefined) {
                        return plugin.contextCreated(context, () => callMiddleware(set, i + 1));
                    }
                    else {
                        return callMiddleware(set, i + 1);
                    }
                }
                else {
                    return next();
                }
            }
            catch (err) {
                return Promise.reject(err);
            }
        }
        return callMiddleware(this._middleware.slice(0), 0);
    }
    receiveActivity(context, next) {
        function callMiddleware(set, i) {
            try {
                if (i < set.length) {
                    const plugin = set[i];
                    if (plugin.receiveActivity !== undefined) {
                        return plugin.receiveActivity(context, () => callMiddleware(set, i + 1));
                    }
                    else {
                        return callMiddleware(set, i + 1);
                    }
                }
                else {
                    return next();
                }
            }
            catch (err) {
                return Promise.reject(err);
            }
        }
        return callMiddleware(this._middleware.slice(0), 0);
    }
    postActivity(context, activities, next) {
        function callMiddleware(set, i) {
            try {
                if (i < set.length) {
                    const plugin = set[i];
                    if (plugin.postActivity !== undefined) {
                        return plugin.postActivity(context, activities, () => callMiddleware(set, i + 1));
                    }
                    else {
                        return callMiddleware(set, i + 1);
                    }
                }
                else {
                    return next();
                }
            }
            catch (err) {
                return Promise.reject(err);
            }
        }
        return callMiddleware(this._middleware.slice(0), 0);
    }
}
exports.MiddlewareSet = MiddlewareSet;
//# sourceMappingURL=middlewareSet.js.map

/***/ }),

/***/ "../../libraries/botbuilder/lib/regExpRecognizer.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const intentRecognizer_1 = __webpack_require__("../../libraries/botbuilder/lib/intentRecognizer.js");
const entityObject_1 = __webpack_require__("../../libraries/botbuilder/lib/entityObject.js");
/**
 * An intent recognizer for detecting the users intent using a series of regular expressions.
 *
 * One of the primary advantages of using a RegExpRecognizer is that you can easily switch between
 * the use of regular expressions and a LUIS model. This could be useful for running unit tests
 * locally without having to make a cloud request.
 *
 * The other advantage for non-LUIS bots is that it potentially lets your bot support multiple
 * languages by providing a unique set of expressions for each language.
 *
 * **Usage Example**
 *
 * ```js
 * import { RegExpRecognizer } from 'botbuilder';
 *
 * // Define RegExp's for well known commands.
 * const recognizer = new RegExpRecognizer()
 *      .addIntent('HelpIntent', /^help/i)
 *      .addIntent('CancelIntent', /^cancel/i);
 *
 * // init bot and bind to adapter
 * const bot = new Bot(adapter);
 * // bind recognizer to bot
 * bot.use(recognizer);
 * // define bot's message handlers
 * bot.onReceive((context) => {
 *     if (context.ifIntent('HelpIntent')) {
 *         // handle help intent
 *         context.reply('You selected HelpIntent');
 *     } else if (context.ifIntent('CancelIntent')) {
 *        // handle cancel intent
 *        context.reply('You selected CancelIntent');
 *     } else {
 *        // handle all other messages
 *        context.reply('Welcome to the RegExpRecognizer example. Type "help" for commands, "cancel" to quit');
 *     }
 * });
 * ```
 */
class RegExpRecognizer extends intentRecognizer_1.IntentRecognizer {
    /**
     * Creates a new instance of the recognizer.
     *
     * @param settings (Optional) settings to customize the recognizer.
     */
    constructor(settings) {
        super();
        this.intents = {};
        this.settings = Object.assign({
            minScore: 0.0
        }, settings);
        if (this.settings.minScore < 0 || this.settings.minScore > 1.0) {
            throw new Error(`RegExpRecognizer: a minScore of '${this.settings.minScore}' is out of range.`);
        }
        this.onRecognize((context) => {
            const intents = [];
            const utterance = (context.request.text || '').trim();
            const minScore = this.settings.minScore;
            for (const name in this.intents) {
                const map = this.intents[name];
                const expressions = this.getExpressions(context, map);
                let top;
                (expressions || []).forEach((exp) => {
                    const intent = RegExpRecognizer.recognize(utterance, exp, [], minScore);
                    if (intent && (!top || intent.score > top.score)) {
                        top = intent;
                    }
                });
                if (top) {
                    top.name = name;
                    intents.push(top);
                }
            }
            return intents;
        });
    }
    /**
     * Adds a definition for a named intent to the recognizer.
     *
     * **Usage Example**
     *
     * ```js
     * // init recognizer
     * let foodRecognizer = new RegExpRecognizer();
     *
     * // add intents to recognizer
     * foodRecognizer.addIntent('TacosIntent', /taco/i);
     * foodRecognizer.addIntent('BurritosIntent', /burrito/i);
     * foodRecognizer.addIntent('EnchiladasIntent', /enchiladas/i);
     *
     * // add recognizer to bot
     * bot.use(foodRecognizer);
     * bot.onRecognize((context) => {
     *     if (context.ifIntent('TacosIntent')) {
     *         // handle tacos intent
     *         context.reply('Added one taco to your order');
     *     }
     *     else if (context.ifIntent('BurritosIntent')) {
     *         // handle burritos intent
     *         context.reply('Added one burrito to your order');
     *     }
     *     else if (context.ifIntent('EnchiladasIntent')) {
     *         // handle enchiladas intent
     *         context.reply('Added one enchilada to your order');
     *     }
     *     else {
     *        // handle other messages
     *     }
     * })
     * ```
     *
     * @param name Name of the intent to return when one of the expression(s) is matched.
     * @param expressions Expression(s) to match for this intent. Passing a `RegExpLocaleMap` lets
     * specify an alternate set of expressions for each language that your bot supports.
     */
    addIntent(name, expressions) {
        if (this.intents.hasOwnProperty(name)) {
            throw new Error(`RegExpRecognizer: an intent name '${name}' already exists.`);
        }
        // Register as locale map
        if (Array.isArray(expressions)) {
            this.intents[name] = { '*': expressions };
        }
        else if (expressions instanceof RegExp) {
            this.intents[name] = { '*': [expressions] };
        }
        else {
            this.intents[name] = expressions;
        }
        return this;
    }
    getExpressions(context, map) {
        const locale = context.request.locale || '*';
        const entry = map.hasOwnProperty(locale) ? map[locale] : map['*'];
        return entry ? (Array.isArray(entry) ? entry : [entry]) : undefined;
    }
    /**
     * Matches a text string using the given expression. If matched, an `Intent` will be returned
     * containing a coverage score, from 0.0 to 1.0, indicating how much of the text matched
     * the expression. The more of the text the matched the greater the score. The name of
     * the intent will be the value of `expression.toString()` and any capture groups will be
     * returned as individual entities of type `string`.
     *
     * @param text The text string to match against.
     * @param expression The expression to match.
     * @param entityTypes (Optional) array of types to assign to each entity returned for a numbered
     * capture group. As an example, for the expression `/flight from (.*) to (.*)/i` you could
     * pass a value of `['fromCity', 'toCity']`. The entity returned for the first capture group will
     * have a type of `fromCity` and the entity for the second capture group will have a type of
     * `toCity`. The default entity type returned when not specified is `string`.
     * @param minScore (Optional) minimum score to return for the coverage score. The default value
     * is 0.0 but if provided, the calculated coverage score will be scaled to a value between the
     * minScore and 1.0. For example, a expression that matches 50% of the text will result in a
     * base coverage score of 0.5. If the minScore supplied is also 0.5 the returned score will be
     * scaled to be 0.75 or 50% between 0.5 and 1.0. As another example, providing a minScore of 1.0
     * will always result in a match returning a score of 1.0.
     */
    static recognize(text, expression, entityTypes = [], minScore = 0.0) {
        if (typeof minScore !== 'number' || minScore < 0 || minScore > 1.0) {
            throw new Error(`RegExpRecognizer: a minScore of '${minScore}' is out of range for expression '${expression.toString()}'.`);
        }
        const matched = expression.exec(text);
        if (matched) {
            // Calculate coverage
            const coverage = matched[0].length / text.length;
            const score = minScore + ((1.0 - minScore) * coverage);
            // Populate entities
            const entities = [];
            if (matched.length > 1) {
                for (let i = 1; i < matched.length; i++) {
                    const type = (i - 1) < entityTypes.length ? entityTypes[i - 1] : entityObject_1.EntityTypes.string;
                    entities.push({ type: type, score: 1.0, value: matched[i] });
                }
            }
            // Return intent
            return { name: expression.toString(), score: score, entities: entities };
        }
        return undefined;
    }
}
exports.RegExpRecognizer = RegExpRecognizer;
//# sourceMappingURL=regExpRecognizer.js.map

/***/ }),

/***/ "../../libraries/botbuilder/lib/storageMiddleware.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botService_1 = __webpack_require__("../../libraries/botbuilder/lib/botService.js");
/**
 * Abstract base class for all storage middleware.
 *
 * @param SETTINGS (Optional) settings to configure additional features of the storage provider.
 */
class StorageMiddleware extends botService_1.BotService {
    /**
     * Creates a new instance of the storage provider.
     *
     * @param settings (Optional) settings to configure additional features of the storage provider.
     */
    constructor(settings) {
        super('storage');
        this.warningLogged = false;
        this.settings = Object.assign({
            optimizeWrites: true
        }, settings);
    }
    getService(context) {
        const storage = this.getStorage(context);
        return this.settings.optimizeWrites ? new WriteOptimizer(context, storage) : storage;
    }
}
exports.StorageMiddleware = StorageMiddleware;
class WriteOptimizer {
    constructor(context, storage) {
        this.context = context;
        this.storage = storage;
    }
    read(keys) {
        return this.storage.read(keys).then((items) => {
            // Remember hashes
            keys.forEach((key) => this.updatheashes(key, items[key]));
            return items;
        });
    }
    /** save StoreItems to storage  **/
    write(changes) {
        // Identify changes to commit
        let count = 0;
        const hashes = this.context.state.writeOptimizer || {};
        const newHashes = {};
        const commits = {};
        for (const key in changes) {
            const item = changes[key] || {};
            const hash = this.getHash(item);
            if (hashes[key] !== hash) {
                // New or changed item
                commits[key] = item;
                newHashes[key] = hash;
                count++;
            }
        }
        // Commit changes to storage
        if (count > 0) {
            return this.storage.write(commits).then(() => {
                // Update hashes
                for (const key in newHashes) {
                    this.updatheashes(key, newHashes[key]);
                }
            });
        }
        else {
            return Promise.resolve();
        }
    }
    /** Delete storeItems from storage **/
    delete(keys) {
        return this.storage.delete(keys).then(() => {
            // Remove hashes
            (keys || []).forEach((key) => this.updatheashes(key));
        });
    }
    updatheashes(key, itemOrHash) {
        // Ensure hashes
        let hashes = this.context.state.writeOptimizer;
        if (!hashes) {
            hashes = this.context.state.writeOptimizer = {};
        }
        // Update entry
        if (typeof itemOrHash === 'string') {
            hashes[key] = itemOrHash;
        }
        else if (itemOrHash) {
            hashes[key] = this.getHash(itemOrHash);
        }
        else if (hashes && hashes.hasOwnProperty(key)) {
            delete hashes[key];
        }
    }
    getHash(item) {
        const clone = Object.assign({}, item);
        if (clone.eTag) {
            delete clone.eTag;
        }
        ;
        return JSON.stringify(clone);
    }
}
//# sourceMappingURL=storageMiddleware.js.map

/***/ }),

/***/ "../../libraries/botbuilder/lib/templateManager.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_schema_1 = __webpack_require__("../../libraries/botbuilder-schema/lib/index.js");
class TemplateManager {
    constructor() {
        this.templateRenderers = [];
        this.languageFallback = [];
    }
    contextCreated(context, next) {
        context.templateManager = this;
        return next();
    }
    postActivity(context, activities, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // Ensure activities are well formed.
            for (let i = 0; i < activities.length; i++) {
                let activity = activities[i];
                if (activity.type == "template") {
                    yield this.bindActivityTemplate(context, activity);
                }
            }
            return next();
        });
    }
    /**
     * register template renderer
     * @param renderer
     */
    register(renderer) {
        this.templateRenderers.push(renderer);
        return this;
    }
    /**
     * list of registered template renderers
     */
    list() {
        return this.templateRenderers;
    }
    /**
     * SetLanguagePolicy allows you to set the fallback strategy
     * @param fallback array of languages to try when binding templates
     */
    setLanguagePolicy(fallback) {
        this.languageFallback = fallback;
    }
    /**
     * Get the current language fallback policy
     */
    getLanguagePolicy() {
        return this.languageFallback;
    }
    findAndApplyTemplate(context, language, templateId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            for (var renderer of this.templateRenderers) {
                let templateOutput = yield renderer.renderTemplate(context, language, templateId, data);
                if (templateOutput) {
                    if (typeof templateOutput === 'object') {
                        if (!templateOutput.type) {
                            templateOutput.type = botbuilder_schema_1.ActivityTypes.Message;
                        }
                        return templateOutput;
                    }
                    else {
                        const activity = {
                            type: botbuilder_schema_1.ActivityTypes.Message,
                            text: templateOutput || '',
                        };
                        return activity;
                    }
                }
            }
            return undefined;
        });
    }
    bindActivityTemplate(context, activity) {
        return __awaiter(this, void 0, void 0, function* () {
            const fallbackLocales = this.languageFallback.slice(0); // clone fallback
            if (!!context.request.locale)
                fallbackLocales.push(context.request.locale);
            fallbackLocales.push('default');
            // Ensure activities are well formed.
            // bind any template activity
            if (activity.type == "template") {
                // try each locale until successful
                for (let locale of fallbackLocales) {
                    // apply template
                    let boundActivity = yield this.findAndApplyTemplate(context, locale, activity.text, activity.value);
                    if (boundActivity) {
                        Object.assign(activity, boundActivity);
                        return;
                    }
                }
                throw new Error(`Could not resolve template id:${activity.text}`);
            }
        });
    }
}
exports.TemplateManager = TemplateManager;
//# sourceMappingURL=templateManager.js.map

/***/ }),

/***/ "../../libraries/botbuilder/lib/testAdapter.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_schema_1 = __webpack_require__("../../libraries/botbuilder-schema/lib/index.js");
const assert = __webpack_require__("../../node_modules/assert/assert.js");
/**
 * Test adapter used for unit tests.
 * @example
 * <pre><code>
 * const adapter = new TestAdapater();
 * const bot = new Bot(adapter)
 *      .use(new MemoryStorage())
 *      .use(new BotStateManage())
 *      .onReceive((context) => {
 *          const cnt = context.state.conversation.next || 1;
 *          context.reply(`reply: ${cnt}`);
 *          context.state.conversation.next = cnt + 1;
 *      });
 * adapter.test('inc', 'reply: 1')
 *          .test('inc', 'reply: 2')
 *          .test('inc', 'reply: 3')
 *          .then(() => done());
 * </code></pre>
 */
class TestAdapter {
    /**
     * Creates a new instance of the test adapter.
     * @param reference (Optional) conversation reference that lets you customize the address
     * information for messages sent during a test.
     */
    constructor(reference) {
        this.nextId = 0;
        this.botReplies = [];
        this.onReceive = undefined;
        this.reference = Object.assign({}, reference, {
            channelId: 'test',
            serviceUrl: 'https://test.com',
            user: { id: 'user', name: 'User1' },
            bot: { id: 'bot', name: 'Bot' },
            conversation: { id: 'Convo1' }
        });
    }
    /** INTERNAL implementation of `Adapter.post()`. */
    post(activities) {
        activities.forEach((activity) => this.botReplies.push(activity));
        return Promise.resolve(undefined);
    }
    /* INTERNAL */
    _sendActivityToBot(userSays) {
        // ready for next reply
        let activity = (typeof userSays === 'string' ? { type: botbuilder_schema_1.ActivityTypes.Message, text: userSays } : userSays);
        if (!activity.type)
            throw new Error("Missing activity.type");
        activity.channelId = this.reference.channelId;
        activity.from = this.reference.user;
        activity.recipient = this.reference.bot;
        activity.conversation = this.reference.conversation;
        activity.serviceUrl = this.reference.serviceUrl;
        const id = activity.id = (this.nextId++).toString();
        return this.onReceive(activity).then(result => { });
    }
    /**
     * Send something to the bot
     * @param userSays text or activity simulating user input
     */
    send(userSays) {
        return new TestFlow(this._sendActivityToBot(userSays), this);
    }
    /**
     * wait for time period to pass before continuing
     * @param ms ms to wait for
     */
    delay(ms) {
        return new TestFlow(new Promise((resolve, reject) => { setTimeout(() => resolve(), ms); }), this);
    }
    /**
     * Send something to the bot and expect the bot to reply
     * @param userSays text or activity simulating user input
     * @param expected expected text or activity from the bot
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    test(userSays, expected, description, timeout) {
        return this.send(userSays)
            .assertReply(expected, description);
    }
    /**
     * Throws if the bot's response doesn't match the expected text/activity
     * @param expected expected text or activity from the bot
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    assertReply(expected, description, timeout) {
        return new TestFlow(Promise.resolve(), this).assertReply(expected, description, timeout);
    }
    /**
     * throws if the bot's response is not one of the candidate strings
     * @param candidates candidate responses
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    assertReplyOneOf(candidates, description, timeout) {
        return new TestFlow(Promise.resolve(), this).assertReplyOneOf(candidates, description, timeout);
    }
}
exports.TestAdapter = TestAdapter;
/** INTERNAL support class for `TestAdapter`. */
class TestFlow {
    constructor(previous, adapter) {
        this.previous = previous;
        this.adapter = adapter;
        if (!this.previous)
            this.previous = Promise.resolve();
    }
    /**
     * Send something to the bot and expect the bot to reply
     * @param userSays text or activity simulating user input
     * @param expected expected text or activity from the bot
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    test(userSays, expected, description, timeout) {
        if (!expected)
            throw new Error(".test() Missing expected parameter");
        return this.send(userSays)
            .assertReply(expected, description || `test("${userSays}", "${expected}")`, timeout);
    }
    /**
     * Send something to the bot
     * @param userSays text or activity simulating user input
     */
    send(userSays) {
        return new TestFlow(this.previous.then(() => this.adapter._sendActivityToBot(userSays)), this.adapter);
    }
    /**
     * Throws if the bot's response doesn't match the expected text/activity
     * @param expected expected text or activity from the bot, or callback to inspect object
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    assertReply(expected, description, timeout) {
        if (!expected)
            throw new Error(".assertReply() Missing expected parameter");
        return new TestFlow(this.previous.then(() => {
            return new Promise((resolve, reject) => {
                if (!timeout)
                    timeout = 3000;
                let interval = 0;
                let start = new Date().getTime();
                let myInterval = setInterval(() => {
                    let current = new Date().getTime();
                    if ((current - start) > timeout) {
                        let expectedActivity = (typeof expected === 'string' ? { type: botbuilder_schema_1.ActivityTypes.Message, text: expected } : expected);
                        throw new Error(`${timeout}ms Timed out waiting for:${description || expectedActivity.text}`);
                    }
                    // if we have replies
                    if (this.adapter.botReplies.length > 0) {
                        clearInterval(myInterval);
                        let botReply = this.adapter.botReplies[0];
                        this.adapter.botReplies.splice(0, 1);
                        if (typeof expected === 'function') {
                            expected(botReply, description);
                        }
                        else if (typeof expected === 'string') {
                            assert.equal(botReply.type, botbuilder_schema_1.ActivityTypes.Message, (description || '') + ` type === '${botReply.type}'. `);
                            assert.equal(botReply.text, expected, (description || '') + ` text === "${botReply.text}"`);
                        }
                        else {
                            this.validateActivity(botReply, expected);
                        }
                        resolve();
                        return;
                    }
                }, interval);
            });
        }), this.adapter);
    }
    /**
     * throws if the bot's response is not one of the candidate strings
     * @param candidates candidate responses
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    assertReplyOneOf(candidates, description, timeout) {
        return this.assertReply((activity) => {
            for (let candidate of candidates) {
                if (activity.text == candidate) {
                    return;
                }
            }
            assert.fail(`${description} FAILED, Expected one of :${JSON.stringify(candidates)}`);
        });
    }
    /**
     * Insert delay before continuing
     * @param ms ms to wait
     */
    delay(ms) {
        return new TestFlow(this.previous.then(() => {
            return new Promise((resolve, reject) => { setTimeout(() => resolve(), ms); });
        }), this.adapter);
    }
    validateActivity(activity, expected) {
        for (let prop in expected) {
            assert.equal(activity[prop], expected[prop]);
        }
    }
    then(onFulfilled) {
        return new TestFlow(this.previous.then(onFulfilled), this.adapter);
    }
    catch(onRejected) {
        return new TestFlow(this.previous.catch(onRejected), this.adapter);
    }
}
exports.TestFlow = TestFlow;
//# sourceMappingURL=testAdapter.js.map

/***/ }),

/***/ "../../node_modules/assert/assert.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

// compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
// original notice:

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
function compare(a, b) {
  if (a === b) {
    return 0;
  }

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
function isBuffer(b) {
  if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
    return global.Buffer.isBuffer(b);
  }
  return !!(b != null && b._isBuffer);
}

// based on node assert, original notice:

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = __webpack_require__("../../node_modules/util/util.js");
var hasOwn = Object.prototype.hasOwnProperty;
var pSlice = Array.prototype.slice;
var functionsHaveNames = (function () {
  return function foo() {}.name === 'foo';
}());
function pToString (obj) {
  return Object.prototype.toString.call(obj);
}
function isView(arrbuf) {
  if (isBuffer(arrbuf)) {
    return false;
  }
  if (typeof global.ArrayBuffer !== 'function') {
    return false;
  }
  if (typeof ArrayBuffer.isView === 'function') {
    return ArrayBuffer.isView(arrbuf);
  }
  if (!arrbuf) {
    return false;
  }
  if (arrbuf instanceof DataView) {
    return true;
  }
  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
    return true;
  }
  return false;
}
// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

var regex = /\s*function\s+([^\(\s]*)\s*/;
// based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
function getName(func) {
  if (!util.isFunction(func)) {
    return;
  }
  if (functionsHaveNames) {
    return func.name;
  }
  var str = func.toString();
  var match = str.match(regex);
  return match && match[1];
}
assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = getName(stackStartFunction);
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function truncate(s, n) {
  if (typeof s === 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}
function inspect(something) {
  if (functionsHaveNames || !util.isFunction(something)) {
    return util.inspect(something);
  }
  var rawname = getName(something);
  var name = rawname ? ': ' + rawname : '';
  return '[Function' +  name + ']';
}
function getMessage(self) {
  return truncate(inspect(self.actual), 128) + ' ' +
         self.operator + ' ' +
         truncate(inspect(self.expected), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
  }
};

function _deepEqual(actual, expected, strict, memos) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  } else if (isBuffer(actual) && isBuffer(expected)) {
    return compare(actual, expected) === 0;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if ((actual === null || typeof actual !== 'object') &&
             (expected === null || typeof expected !== 'object')) {
    return strict ? actual === expected : actual == expected;

  // If both values are instances of typed arrays, wrap their underlying
  // ArrayBuffers in a Buffer each to increase performance
  // This optimization requires the arrays to have the same type as checked by
  // Object.prototype.toString (aka pToString). Never perform binary
  // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
  // bit patterns are not identical.
  } else if (isView(actual) && isView(expected) &&
             pToString(actual) === pToString(expected) &&
             !(actual instanceof Float32Array ||
               actual instanceof Float64Array)) {
    return compare(new Uint8Array(actual.buffer),
                   new Uint8Array(expected.buffer)) === 0;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else if (isBuffer(actual) !== isBuffer(expected)) {
    return false;
  } else {
    memos = memos || {actual: [], expected: []};

    var actualIndex = memos.actual.indexOf(actual);
    if (actualIndex !== -1) {
      if (actualIndex === memos.expected.indexOf(expected)) {
        return true;
      }
    }

    memos.actual.push(actual);
    memos.expected.push(expected);

    return objEquiv(actual, expected, strict, memos);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b))
    return a === b;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
    return false;
  var aIsArgs = isArguments(a);
  var bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, strict);
  }
  var ka = objectKeys(a);
  var kb = objectKeys(b);
  var key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length !== kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
      return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

assert.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
  }
}


// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  }

  try {
    if (actual instanceof expected) {
      return true;
    }
  } catch (e) {
    // Ignore.  The instanceof check doesn't work for arrow functions.
  }

  if (Error.isPrototypeOf(expected)) {
    return false;
  }

  return expected.call({}, actual) === true;
}

function _tryBlock(block) {
  var error;
  try {
    block();
  } catch (e) {
    error = e;
  }
  return error;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof block !== 'function') {
    throw new TypeError('"block" argument must be a function');
  }

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  actual = _tryBlock(block);

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  var userProvidedMessage = typeof message === 'string';
  var isUnwantedException = !shouldThrow && util.isError(actual);
  var isUnexpectedException = !shouldThrow && actual && !expected;

  if ((isUnwantedException &&
      userProvidedMessage &&
      expectedException(actual, expected)) ||
      isUnexpectedException) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws(true, block, error, message);
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws(false, block, error, message);
};

assert.ifError = function(err) { if (err) throw err; };

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("../../node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "../../node_modules/css-loader/index.js!../../node_modules/skeleton-css/css/normalize.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "/*! normalize.css v3.0.2 | MIT License | git.io/normalize */\n\n/**\n * 1. Set default font family to sans-serif.\n * 2. Prevent iOS text size adjust after orientation change, without disabling\n *    user zoom.\n */\n\nhtml {\n  font-family: sans-serif; /* 1 */\n  -ms-text-size-adjust: 100%; /* 2 */\n  -webkit-text-size-adjust: 100%; /* 2 */\n}\n\n/**\n * Remove default margin.\n */\n\nbody {\n  margin: 0;\n}\n\n/* HTML5 display definitions\n   ========================================================================== */\n\n/**\n * Correct `block` display not defined for any HTML5 element in IE 8/9.\n * Correct `block` display not defined for `details` or `summary` in IE 10/11\n * and Firefox.\n * Correct `block` display not defined for `main` in IE 11.\n */\n\narticle,\naside,\ndetails,\nfigcaption,\nfigure,\nfooter,\nheader,\nhgroup,\nmain,\nmenu,\nnav,\nsection,\nsummary {\n  display: block;\n}\n\n/**\n * 1. Correct `inline-block` display not defined in IE 8/9.\n * 2. Normalize vertical alignment of `progress` in Chrome, Firefox, and Opera.\n */\n\naudio,\ncanvas,\nprogress,\nvideo {\n  display: inline-block; /* 1 */\n  vertical-align: baseline; /* 2 */\n}\n\n/**\n * Prevent modern browsers from displaying `audio` without controls.\n * Remove excess height in iOS 5 devices.\n */\n\naudio:not([controls]) {\n  display: none;\n  height: 0;\n}\n\n/**\n * Address `[hidden]` styling not present in IE 8/9/10.\n * Hide the `template` element in IE 8/9/11, Safari, and Firefox < 22.\n */\n\n[hidden],\ntemplate {\n  display: none;\n}\n\n/* Links\n   ========================================================================== */\n\n/**\n * Remove the gray background color from active links in IE 10.\n */\n\na {\n  background-color: transparent;\n}\n\n/**\n * Improve readability when focused and also mouse hovered in all browsers.\n */\n\na:active,\na:hover {\n  outline: 0;\n}\n\n/* Text-level semantics\n   ========================================================================== */\n\n/**\n * Address styling not present in IE 8/9/10/11, Safari, and Chrome.\n */\n\nabbr[title] {\n  border-bottom: 1px dotted;\n}\n\n/**\n * Address style set to `bolder` in Firefox 4+, Safari, and Chrome.\n */\n\nb,\nstrong {\n  font-weight: bold;\n}\n\n/**\n * Address styling not present in Safari and Chrome.\n */\n\ndfn {\n  font-style: italic;\n}\n\n/**\n * Address variable `h1` font-size and margin within `section` and `article`\n * contexts in Firefox 4+, Safari, and Chrome.\n */\n\nh1 {\n  font-size: 2em;\n  margin: 0.67em 0;\n}\n\n/**\n * Address styling not present in IE 8/9.\n */\n\nmark {\n  background: #ff0;\n  color: #000;\n}\n\n/**\n * Address inconsistent and variable font size in all browsers.\n */\n\nsmall {\n  font-size: 80%;\n}\n\n/**\n * Prevent `sub` and `sup` affecting `line-height` in all browsers.\n */\n\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline;\n}\n\nsup {\n  top: -0.5em;\n}\n\nsub {\n  bottom: -0.25em;\n}\n\n/* Embedded content\n   ========================================================================== */\n\n/**\n * Remove border when inside `a` element in IE 8/9/10.\n */\n\nimg {\n  border: 0;\n}\n\n/**\n * Correct overflow not hidden in IE 9/10/11.\n */\n\nsvg:not(:root) {\n  overflow: hidden;\n}\n\n/* Grouping content\n   ========================================================================== */\n\n/**\n * Address margin not present in IE 8/9 and Safari.\n */\n\nfigure {\n  margin: 1em 40px;\n}\n\n/**\n * Address differences between Firefox and other browsers.\n */\n\nhr {\n  -moz-box-sizing: content-box;\n  box-sizing: content-box;\n  height: 0;\n}\n\n/**\n * Contain overflow in all browsers.\n */\n\npre {\n  overflow: auto;\n}\n\n/**\n * Address odd `em`-unit font size rendering in all browsers.\n */\n\ncode,\nkbd,\npre,\nsamp {\n  font-family: monospace, monospace;\n  font-size: 1em;\n}\n\n/* Forms\n   ========================================================================== */\n\n/**\n * Known limitation: by default, Chrome and Safari on OS X allow very limited\n * styling of `select`, unless a `border` property is set.\n */\n\n/**\n * 1. Correct color not being inherited.\n *    Known issue: affects color of disabled elements.\n * 2. Correct font properties not being inherited.\n * 3. Address margins set differently in Firefox 4+, Safari, and Chrome.\n */\n\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  color: inherit; /* 1 */\n  font: inherit; /* 2 */\n  margin: 0; /* 3 */\n}\n\n/**\n * Address `overflow` set to `hidden` in IE 8/9/10/11.\n */\n\nbutton {\n  overflow: visible;\n}\n\n/**\n * Address inconsistent `text-transform` inheritance for `button` and `select`.\n * All other form control elements do not inherit `text-transform` values.\n * Correct `button` style inheritance in Firefox, IE 8/9/10/11, and Opera.\n * Correct `select` style inheritance in Firefox.\n */\n\nbutton,\nselect {\n  text-transform: none;\n}\n\n/**\n * 1. Avoid the WebKit bug in Android 4.0.* where (2) destroys native `audio`\n *    and `video` controls.\n * 2. Correct inability to style clickable `input` types in iOS.\n * 3. Improve usability and consistency of cursor style between image-type\n *    `input` and others.\n */\n\nbutton,\nhtml input[type=\"button\"], /* 1 */\ninput[type=\"reset\"],\ninput[type=\"submit\"] {\n  -webkit-appearance: button; /* 2 */\n  cursor: pointer; /* 3 */\n}\n\n/**\n * Re-set default cursor for disabled elements.\n */\n\nbutton[disabled],\nhtml input[disabled] {\n  cursor: default;\n}\n\n/**\n * Remove inner padding and border in Firefox 4+.\n */\n\nbutton::-moz-focus-inner,\ninput::-moz-focus-inner {\n  border: 0;\n  padding: 0;\n}\n\n/**\n * Address Firefox 4+ setting `line-height` on `input` using `!important` in\n * the UA stylesheet.\n */\n\ninput {\n  line-height: normal;\n}\n\n/**\n * It's recommended that you don't attempt to style these elements.\n * Firefox's implementation doesn't respect box-sizing, padding, or width.\n *\n * 1. Address box sizing set to `content-box` in IE 8/9/10.\n * 2. Remove excess padding in IE 8/9/10.\n */\n\ninput[type=\"checkbox\"],\ninput[type=\"radio\"] {\n  box-sizing: border-box; /* 1 */\n  padding: 0; /* 2 */\n}\n\n/**\n * Fix the cursor style for Chrome's increment/decrement buttons. For certain\n * `font-size` values of the `input`, it causes the cursor style of the\n * decrement button to change from `default` to `text`.\n */\n\ninput[type=\"number\"]::-webkit-inner-spin-button,\ninput[type=\"number\"]::-webkit-outer-spin-button {\n  height: auto;\n}\n\n/**\n * 1. Address `appearance` set to `searchfield` in Safari and Chrome.\n * 2. Address `box-sizing` set to `border-box` in Safari and Chrome\n *    (include `-moz` to future-proof).\n */\n\ninput[type=\"search\"] {\n  -webkit-appearance: textfield; /* 1 */\n  -moz-box-sizing: content-box;\n  -webkit-box-sizing: content-box; /* 2 */\n  box-sizing: content-box;\n}\n\n/**\n * Remove inner padding and search cancel button in Safari and Chrome on OS X.\n * Safari (but not Chrome) clips the cancel button when the search input has\n * padding (and `textfield` appearance).\n */\n\ninput[type=\"search\"]::-webkit-search-cancel-button,\ninput[type=\"search\"]::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n\n/**\n * Define consistent border, margin, and padding.\n */\n\nfieldset {\n  border: 1px solid #c0c0c0;\n  margin: 0 2px;\n  padding: 0.35em 0.625em 0.75em;\n}\n\n/**\n * 1. Correct `color` not being inherited in IE 8/9/10/11.\n * 2. Remove padding so people aren't caught out if they zero out fieldsets.\n */\n\nlegend {\n  border: 0; /* 1 */\n  padding: 0; /* 2 */\n}\n\n/**\n * Remove default vertical scrollbar in IE 8/9/10/11.\n */\n\ntextarea {\n  overflow: auto;\n}\n\n/**\n * Don't inherit the `font-weight` (applied by a rule above).\n * NOTE: the default cannot safely be changed in Chrome and Safari on OS X.\n */\n\noptgroup {\n  font-weight: bold;\n}\n\n/* Tables\n   ========================================================================== */\n\n/**\n * Remove most spacing between table cells.\n */\n\ntable {\n  border-collapse: collapse;\n  border-spacing: 0;\n}\n\ntd,\nth {\n  padding: 0;\n}", ""]);

// exports


/***/ }),

/***/ "../../node_modules/css-loader/index.js!../../node_modules/skeleton-css/css/skeleton.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "/*\n* Skeleton V2.0.4\n* Copyright 2014, Dave Gamache\n* www.getskeleton.com\n* Free to use under the MIT license.\n* http://www.opensource.org/licenses/mit-license.php\n* 12/29/2014\n*/\n\n\n/* Table of contents\n––––––––––––––––––––––––––––––––––––––––––––––––––\n- Grid\n- Base Styles\n- Typography\n- Links\n- Buttons\n- Forms\n- Lists\n- Code\n- Tables\n- Spacing\n- Utilities\n- Clearing\n- Media Queries\n*/\n\n\n/* Grid\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\n.container {\n  position: relative;\n  width: 100%;\n  max-width: 960px;\n  margin: 0 auto;\n  padding: 0 20px;\n  box-sizing: border-box; }\n.column,\n.columns {\n  width: 100%;\n  float: left;\n  box-sizing: border-box; }\n\n/* For devices larger than 400px */\n@media (min-width: 400px) {\n  .container {\n    width: 85%;\n    padding: 0; }\n}\n\n/* For devices larger than 550px */\n@media (min-width: 550px) {\n  .container {\n    width: 80%; }\n  .column,\n  .columns {\n    margin-left: 4%; }\n  .column:first-child,\n  .columns:first-child {\n    margin-left: 0; }\n\n  .one.column,\n  .one.columns                    { width: 4.66666666667%; }\n  .two.columns                    { width: 13.3333333333%; }\n  .three.columns                  { width: 22%;            }\n  .four.columns                   { width: 30.6666666667%; }\n  .five.columns                   { width: 39.3333333333%; }\n  .six.columns                    { width: 48%;            }\n  .seven.columns                  { width: 56.6666666667%; }\n  .eight.columns                  { width: 65.3333333333%; }\n  .nine.columns                   { width: 74.0%;          }\n  .ten.columns                    { width: 82.6666666667%; }\n  .eleven.columns                 { width: 91.3333333333%; }\n  .twelve.columns                 { width: 100%; margin-left: 0; }\n\n  .one-third.column               { width: 30.6666666667%; }\n  .two-thirds.column              { width: 65.3333333333%; }\n\n  .one-half.column                { width: 48%; }\n\n  /* Offsets */\n  .offset-by-one.column,\n  .offset-by-one.columns          { margin-left: 8.66666666667%; }\n  .offset-by-two.column,\n  .offset-by-two.columns          { margin-left: 17.3333333333%; }\n  .offset-by-three.column,\n  .offset-by-three.columns        { margin-left: 26%;            }\n  .offset-by-four.column,\n  .offset-by-four.columns         { margin-left: 34.6666666667%; }\n  .offset-by-five.column,\n  .offset-by-five.columns         { margin-left: 43.3333333333%; }\n  .offset-by-six.column,\n  .offset-by-six.columns          { margin-left: 52%;            }\n  .offset-by-seven.column,\n  .offset-by-seven.columns        { margin-left: 60.6666666667%; }\n  .offset-by-eight.column,\n  .offset-by-eight.columns        { margin-left: 69.3333333333%; }\n  .offset-by-nine.column,\n  .offset-by-nine.columns         { margin-left: 78.0%;          }\n  .offset-by-ten.column,\n  .offset-by-ten.columns          { margin-left: 86.6666666667%; }\n  .offset-by-eleven.column,\n  .offset-by-eleven.columns       { margin-left: 95.3333333333%; }\n\n  .offset-by-one-third.column,\n  .offset-by-one-third.columns    { margin-left: 34.6666666667%; }\n  .offset-by-two-thirds.column,\n  .offset-by-two-thirds.columns   { margin-left: 69.3333333333%; }\n\n  .offset-by-one-half.column,\n  .offset-by-one-half.columns     { margin-left: 52%; }\n\n}\n\n\n/* Base Styles\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\n/* NOTE\nhtml is set to 62.5% so that all the REM measurements throughout Skeleton\nare based on 10px sizing. So basically 1.5rem = 15px :) */\nhtml {\n  font-size: 62.5%; }\nbody {\n  font-size: 1.5em; /* currently ems cause chrome bug misinterpreting rems on body element */\n  line-height: 1.6;\n  font-weight: 400;\n  font-family: \"Raleway\", \"HelveticaNeue\", \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n  color: #222; }\n\n\n/* Typography\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\nh1, h2, h3, h4, h5, h6 {\n  margin-top: 0;\n  margin-bottom: 2rem;\n  font-weight: 300; }\nh1 { font-size: 4.0rem; line-height: 1.2;  letter-spacing: -.1rem;}\nh2 { font-size: 3.6rem; line-height: 1.25; letter-spacing: -.1rem; }\nh3 { font-size: 3.0rem; line-height: 1.3;  letter-spacing: -.1rem; }\nh4 { font-size: 2.4rem; line-height: 1.35; letter-spacing: -.08rem; }\nh5 { font-size: 1.8rem; line-height: 1.5;  letter-spacing: -.05rem; }\nh6 { font-size: 1.5rem; line-height: 1.6;  letter-spacing: 0; }\n\n/* Larger than phablet */\n@media (min-width: 550px) {\n  h1 { font-size: 5.0rem; }\n  h2 { font-size: 4.2rem; }\n  h3 { font-size: 3.6rem; }\n  h4 { font-size: 3.0rem; }\n  h5 { font-size: 2.4rem; }\n  h6 { font-size: 1.5rem; }\n}\n\np {\n  margin-top: 0; }\n\n\n/* Links\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\na {\n  color: #1EAEDB; }\na:hover {\n  color: #0FA0CE; }\n\n\n/* Buttons\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\n.button,\nbutton,\ninput[type=\"submit\"],\ninput[type=\"reset\"],\ninput[type=\"button\"] {\n  display: inline-block;\n  height: 38px;\n  padding: 0 30px;\n  color: #555;\n  text-align: center;\n  font-size: 11px;\n  font-weight: 600;\n  line-height: 38px;\n  letter-spacing: .1rem;\n  text-transform: uppercase;\n  text-decoration: none;\n  white-space: nowrap;\n  background-color: transparent;\n  border-radius: 4px;\n  border: 1px solid #bbb;\n  cursor: pointer;\n  box-sizing: border-box; }\n.button:hover,\nbutton:hover,\ninput[type=\"submit\"]:hover,\ninput[type=\"reset\"]:hover,\ninput[type=\"button\"]:hover,\n.button:focus,\nbutton:focus,\ninput[type=\"submit\"]:focus,\ninput[type=\"reset\"]:focus,\ninput[type=\"button\"]:focus {\n  color: #333;\n  border-color: #888;\n  outline: 0; }\n.button.button-primary,\nbutton.button-primary,\ninput[type=\"submit\"].button-primary,\ninput[type=\"reset\"].button-primary,\ninput[type=\"button\"].button-primary {\n  color: #FFF;\n  background-color: #33C3F0;\n  border-color: #33C3F0; }\n.button.button-primary:hover,\nbutton.button-primary:hover,\ninput[type=\"submit\"].button-primary:hover,\ninput[type=\"reset\"].button-primary:hover,\ninput[type=\"button\"].button-primary:hover,\n.button.button-primary:focus,\nbutton.button-primary:focus,\ninput[type=\"submit\"].button-primary:focus,\ninput[type=\"reset\"].button-primary:focus,\ninput[type=\"button\"].button-primary:focus {\n  color: #FFF;\n  background-color: #1EAEDB;\n  border-color: #1EAEDB; }\n\n\n/* Forms\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\ninput[type=\"email\"],\ninput[type=\"number\"],\ninput[type=\"search\"],\ninput[type=\"text\"],\ninput[type=\"tel\"],\ninput[type=\"url\"],\ninput[type=\"password\"],\ntextarea,\nselect {\n  height: 38px;\n  padding: 6px 10px; /* The 6px vertically centers text on FF, ignored by Webkit */\n  background-color: #fff;\n  border: 1px solid #D1D1D1;\n  border-radius: 4px;\n  box-shadow: none;\n  box-sizing: border-box; }\n/* Removes awkward default styles on some inputs for iOS */\ninput[type=\"email\"],\ninput[type=\"number\"],\ninput[type=\"search\"],\ninput[type=\"text\"],\ninput[type=\"tel\"],\ninput[type=\"url\"],\ninput[type=\"password\"],\ntextarea {\n  -webkit-appearance: none;\n     -moz-appearance: none;\n          appearance: none; }\ntextarea {\n  min-height: 65px;\n  padding-top: 6px;\n  padding-bottom: 6px; }\ninput[type=\"email\"]:focus,\ninput[type=\"number\"]:focus,\ninput[type=\"search\"]:focus,\ninput[type=\"text\"]:focus,\ninput[type=\"tel\"]:focus,\ninput[type=\"url\"]:focus,\ninput[type=\"password\"]:focus,\ntextarea:focus,\nselect:focus {\n  border: 1px solid #33C3F0;\n  outline: 0; }\nlabel,\nlegend {\n  display: block;\n  margin-bottom: .5rem;\n  font-weight: 600; }\nfieldset {\n  padding: 0;\n  border-width: 0; }\ninput[type=\"checkbox\"],\ninput[type=\"radio\"] {\n  display: inline; }\nlabel > .label-body {\n  display: inline-block;\n  margin-left: .5rem;\n  font-weight: normal; }\n\n\n/* Lists\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\nul {\n  list-style: circle inside; }\nol {\n  list-style: decimal inside; }\nol, ul {\n  padding-left: 0;\n  margin-top: 0; }\nul ul,\nul ol,\nol ol,\nol ul {\n  margin: 1.5rem 0 1.5rem 3rem;\n  font-size: 90%; }\nli {\n  margin-bottom: 1rem; }\n\n\n/* Code\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\ncode {\n  padding: .2rem .5rem;\n  margin: 0 .2rem;\n  font-size: 90%;\n  white-space: nowrap;\n  background: #F1F1F1;\n  border: 1px solid #E1E1E1;\n  border-radius: 4px; }\npre > code {\n  display: block;\n  padding: 1rem 1.5rem;\n  white-space: pre; }\n\n\n/* Tables\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\nth,\ntd {\n  padding: 12px 15px;\n  text-align: left;\n  border-bottom: 1px solid #E1E1E1; }\nth:first-child,\ntd:first-child {\n  padding-left: 0; }\nth:last-child,\ntd:last-child {\n  padding-right: 0; }\n\n\n/* Spacing\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\nbutton,\n.button {\n  margin-bottom: 1rem; }\ninput,\ntextarea,\nselect,\nfieldset {\n  margin-bottom: 1.5rem; }\npre,\nblockquote,\ndl,\nfigure,\ntable,\np,\nul,\nol,\nform {\n  margin-bottom: 2.5rem; }\n\n\n/* Utilities\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\n.u-full-width {\n  width: 100%;\n  box-sizing: border-box; }\n.u-max-full-width {\n  max-width: 100%;\n  box-sizing: border-box; }\n.u-pull-right {\n  float: right; }\n.u-pull-left {\n  float: left; }\n\n\n/* Misc\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\nhr {\n  margin-top: 3rem;\n  margin-bottom: 3.5rem;\n  border-width: 0;\n  border-top: 1px solid #E1E1E1; }\n\n\n/* Clearing\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\n\n/* Self Clearing Goodness */\n.container:after,\n.row:after,\n.u-cf {\n  content: \"\";\n  display: table;\n  clear: both; }\n\n\n/* Media Queries\n–––––––––––––––––––––––––––––––––––––––––––––––––– */\n/*\nNote: The best way to structure the use of media queries is to create the queries\nnear the relevant code. For example, if you wanted to change the styles for buttons\non small devices, paste the mobile query code up in the buttons section and style it\nthere.\n*/\n\n\n/* Larger than mobile */\n@media (min-width: 400px) {}\n\n/* Larger than phablet (also point when grid becomes active) */\n@media (min-width: 550px) {}\n\n/* Larger than tablet */\n@media (min-width: 750px) {}\n\n/* Larger than desktop */\n@media (min-width: 1000px) {}\n\n/* Larger than Desktop HD */\n@media (min-width: 1200px) {}\n", ""]);

// exports


/***/ }),

/***/ "../../node_modules/css-loader/index.js!./src/css/alarmBot.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "section {\r\n    margin: 10px;\r\n    padding: 10px;\r\n    border: 1px solid #d1d1d1;\r\n}\r\n\r\nsection > div:first-child {\r\n    display: flex;\r\n    height: 500px;\r\n    overflow: hidden;\r\n}\r\n\r\nsection > div > div:first-child {\r\n    width: 100%;\r\n}\r\n\r\nsection > div > div:last-child {\r\n    width: 200px;\r\n}\r\n\r\nsection > form {\r\n    padding: 10px 10px 5px 10px;\r\n    margin: 0;\r\n}\r\n\r\nh5 {\r\n    text-align: center;\r\n}\r\n\r\ninput[type=\"text\"] {\r\n    height: 39px;\r\n    width: calc(100% - 105px);\r\n    margin: 0;\r\n}\r\n\r\nbutton.button-primary {\r\n    margin: 0;\r\n}\r\n\r\n.col {\r\n    display: flex;\r\n    flex-direction: column;\r\n}\r\n\r\n.border-left {\r\n    border-left: 1px solid #D1D1D1;\r\n}\r\n\r\n.user-message, .bot-message {\r\n    position: relative;\r\n    margin-left: 10px;\r\n    margin-right: 10px;\r\n}\r\n\r\n.user-message p {\r\n    border-radius: 3px;\r\n    border: 1px solid #15afc0;\r\n    position: relative;\r\n    background: #16cbda;\r\n    color: white;\r\n    display: inline-block;\r\n    transform: translateX(-100%);\r\n    right: calc(-100% + 10px);\r\n}\r\n\r\n.user-message p:after {\r\n    content: '';\r\n    background: #16cbda;\r\n    width: 10px;\r\n    height: 10px;\r\n    position: absolute;\r\n    right: -2px;\r\n    transform: rotate(45deg) translateY(-50%);\r\n    z-index: -1;\r\n    top: 50%;\r\n}\r\n\r\n.bot-message p {\r\n    border-radius: 3px;\r\n    border: 1px solid #0078d7;\r\n    position: relative;\r\n    background: #0092ff;\r\n    color: white;\r\n    display: inline-block;\r\n}\r\n\r\n.bot-message p:after {\r\n    content: '';\r\n    background: #0092ff;\r\n    width: 10px;\r\n    height: 10px;\r\n    position: absolute;\r\n    left: -9px;\r\n    transform: rotate(45deg) translateY(-50%);\r\n    z-index: -1;\r\n    top: 50%;\r\n}\r\n\r\n.bot-message p, .user-message p {\r\n    padding: 5px;\r\n}\r\n\r\n.user-message + .bot-message {\r\n    margin-top: 5px;\r\n}\r\n\r\n.content-mask {\r\n    height: 100%;\r\n    overflow: hidden;\r\n}\r\n\r\n.messages-container {\r\n    transform: translateY(0);\r\n    transition: transform .5s ease-out;\r\n}\r\n\r\nh5 {\r\n    margin: 0;\r\n    padding: 10px;\r\n    font-size: 18px;\r\n    text-transform: uppercase;\r\n}\r\n\r\nul.alarms-list {\r\n    height: 100%;\r\n    margin: 0;\r\n}\r\n\r\nul.alarms-list {\r\n    list-style: none;\r\n    margin: 0;\r\n    padding: 0 5px;\r\n    height: calc(100% - 30px);\r\n}\r\n\r\nul.alarms-list li {\r\n    margin-top: 5px;\r\n    border-radius: 5px;\r\n    border: 1px solid #d5d5d7;\r\n    min-height: 120px;\r\n}\r\n\r\nul.alarms-list li h5 {\r\n    white-space: nowrap;\r\n    overflow: hidden;\r\n    text-overflow: ellipsis;\r\n    text-transform: uppercase;\r\n    font-size: 12px;\r\n    border-top-left-radius: 5px;\r\n    border-top-right-radius: 5px;\r\n    background: #f7f7f9;\r\n    border-bottom: 1px solid #d5d5d7;\r\n    margin: 0;\r\n    padding: 10px;\r\n}\r\n\r\nul.alarms-list li p {\r\n    margin: 5px 0 0 0;\r\n    font-size: 11px;\r\n    padding: 5px;\r\n}", ""]);

// exports


/***/ }),

/***/ "../../node_modules/css-loader/lib/css-base.js":
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),

/***/ "../../node_modules/process/browser.js":
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "../../node_modules/skeleton-css/css/normalize.css":
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__("../../node_modules/css-loader/index.js!../../node_modules/skeleton-css/css/normalize.css");

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__("../../node_modules/style-loader/lib/addStyles.js")(content, options);

if(content.locals) module.exports = content.locals;

if(true) {
	module.hot.accept("../../node_modules/css-loader/index.js!../../node_modules/skeleton-css/css/normalize.css", function() {
		var newContent = __webpack_require__("../../node_modules/css-loader/index.js!../../node_modules/skeleton-css/css/normalize.css");

		if(typeof newContent === 'string') newContent = [[module.i, newContent, '']];

		var locals = (function(a, b) {
			var key, idx = 0;

			for(key in a) {
				if(!b || a[key] !== b[key]) return false;
				idx++;
			}

			for(key in b) idx--;

			return idx === 0;
		}(content.locals, newContent.locals));

		if(!locals) throw new Error('Aborting CSS HMR due to changed css-modules locals.');

		update(newContent);
	});

	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ "../../node_modules/skeleton-css/css/skeleton.css":
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__("../../node_modules/css-loader/index.js!../../node_modules/skeleton-css/css/skeleton.css");

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__("../../node_modules/style-loader/lib/addStyles.js")(content, options);

if(content.locals) module.exports = content.locals;

if(true) {
	module.hot.accept("../../node_modules/css-loader/index.js!../../node_modules/skeleton-css/css/skeleton.css", function() {
		var newContent = __webpack_require__("../../node_modules/css-loader/index.js!../../node_modules/skeleton-css/css/skeleton.css");

		if(typeof newContent === 'string') newContent = [[module.i, newContent, '']];

		var locals = (function(a, b) {
			var key, idx = 0;

			for(key in a) {
				if(!b || a[key] !== b[key]) return false;
				idx++;
			}

			for(key in b) idx--;

			return idx === 0;
		}(content.locals, newContent.locals));

		if(!locals) throw new Error('Aborting CSS HMR due to changed css-modules locals.');

		update(newContent);
	});

	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ "../../node_modules/style-loader/lib/addStyles.js":
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getTarget = function (target) {
  return document.querySelector(target);
};

var getElement = (function (fn) {
	var memo = {};

	return function(target) {
                // If passing function in options, then use it for resolve "head" element.
                // Useful for Shadow Root style i.e
                // {
                //   insertInto: function () { return document.querySelector("#foo").shadowRoot }
                // }
                if (typeof target === 'function') {
                        return target();
                }
                if (typeof memo[target] === "undefined") {
			var styleTarget = getTarget.call(this, target);
			// Special case to return head of iframe instead of iframe itself
			if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[target] = styleTarget;
		}
		return memo[target]
	};
})();

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__("../../node_modules/style-loader/lib/urls.js");

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton && typeof options.singleton !== "boolean") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
        if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertInto + " " + options.insertAt.before);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),

/***/ "../../node_modules/style-loader/lib/urls.js":
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),

/***/ "../../node_modules/util/node_modules/inherits/inherits_browser.js":
/***/ (function(module, exports) {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}


/***/ }),

/***/ "../../node_modules/util/support/isBufferBrowser.js":
/***/ (function(module, exports) {

module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}

/***/ }),

/***/ "../../node_modules/util/util.js":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = __webpack_require__("../../node_modules/util/support/isBufferBrowser.js");

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = __webpack_require__("../../node_modules/util/node_modules/inherits/inherits_browser.js");

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("../../node_modules/webpack/buildin/global.js"), __webpack_require__("../../node_modules/process/browser.js")))

/***/ }),

/***/ "../../node_modules/webpack/buildin/global.js":
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./src/alarmRenderer.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class AlarmRenderer {

    contextCreated(context, next) {
        context.templateManager.register(this);
        return next();
    }

    renderTemplate(context, language, templateId, value) {
        return {type: 'event', id: templateId, value};
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = AlarmRenderer;


/***/ }),

/***/ "./src/alarms/addAlarm.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = begin;
/* harmony export (immutable) */ __webpack_exports__["b"] = routeReply;
function begin(context) {
    // Set topic and initialize empty alarm
    context.state.conversation.topic = 'addAlarm';
    context.state.conversation.alarm = {};
    return nextField(context);
}

function routeReply(context) {
    // Handle users reply to prompt
    const utterance = context.request.text.trim();
    switch (context.state.conversation.prompt) {
        case 'title':
            // Validate reply and save to alarm
            if (utterance.length > 2) {
                context.state.conversation.alarm.title = utterance;
            } else {
                context.reply(`I'm sorry. Your alarm should have a title at least 3 characters long.`);
            }
            break;
        case 'time':
            // TODO: validate time user replied with
            context.state.conversation.alarm.time = utterance;
            break;
    }
    return nextField(context);
}


function nextField(context) {
    // Prompt user for next missing field
    const alarm = context.state.conversation.alarm;
    if (alarm.title === undefined) {
        context.reply(`What would you like to call your alarm?`);
        context.state.conversation.prompt = 'title';
    } else if (alarm.time === undefined) {
        context.reply(`What time would you like to set the "${alarm.title}" alarm for?`);
        context.state.conversation.prompt = 'time';
    } else {
        // Alarm completed so set alarm.
        const list = context.state.user.alarms || [];
        list.push(alarm);
        context.state.user.alarms = list;

        // TODO: set alarm

        // Notify user and cleanup topic state
        context.reply(`Your alarm named "${alarm.title}" is set for "${alarm.time}".`);
        context.replyWith('newAlarm', alarm);
        context.state.conversation.topic = undefined;
        context.state.conversation.alarm = undefined;
        context.state.conversation.prompt = undefined;
    }
    return Promise.resolve();
}

/***/ }),

/***/ "./src/alarms/cancel.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = begin;
function begin(context) {
    // Cancel the current topic
    if (context.state.conversation.topic) {
        context.state.conversation.topic = undefined;
        context.reply(`Ok... Canceled.`);
    } else {
        context.reply(`Nothing to cancel.`);
    }
    return Promise.resolve();
}


/***/ }),

/***/ "./src/alarms/deleteAlarm.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = begin;
/* harmony export (immutable) */ __webpack_exports__["b"] = routeReply;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__showAlarms__ = __webpack_require__("./src/alarms/showAlarms.js");


function begin(context) {
    // Delete any existing topic
    context.state.conversation.topic = undefined;

    // Render list of topics to user
    const count = Object(__WEBPACK_IMPORTED_MODULE_0__showAlarms__["b" /* renderAlarms */])(context);
    if (count > 0) {
        // Set topic and prompt user for alarm to delete.
        context.state.conversation.topic = 'deleteAlarm';
        context.reply(`Which alarm would you like to delete?`);
    }
    return Promise.resolve();
}

function routeReply(context) {
    // Validate users reply and delete alarm
    let deleted = false;
    const title = context.request.text.trim();
    const list = context.state.user.alarms || [];
    for (let i = 0; i < list.length; i++) {
        if (list[i].title.toLowerCase() === title.toLowerCase()) {
            context.replyWith('deleteAlarm', list.splice(i, 1)[0]);
            deleted = true;
            break;
        }
    }

    // Notify user of deletion or re-prompt
    if (deleted) {
        context.reply(`Deleted the "${title}" alarm.`);
        context.state.conversation.topic = undefined;
    } else {
        context.reply(`An alarm named "${title}" doesn't exist. Which alarm would you like to delete? Say "cancel" to quit.`)
    }

    return Promise.resolve();
}


/***/ }),

/***/ "./src/alarms/showAlarms.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = begin;
/* harmony export (immutable) */ __webpack_exports__["b"] = renderAlarms;
function begin(context) {
    // Delete any existing topic
    context.state.conversation.topic = undefined;

    // Render alarms to user.
    // - No reply is expected so we don't set a new topic.
    this.renderAlarms(context);
    return Promise.resolve();
}

function renderAlarms(context) {
    const list = context.state.user.alarms || [];
    if (list.length > 0) {
        let msg = `**Current Alarms**\n\n`;
        let connector = '';
        list.forEach((alarm) => {
            msg += connector + `- ${alarm.title} (${alarm.time})`;
            connector = '\n';
        });
        context.reply(msg);
    } else {
        context.reply(`No alarms found.`);
    }
    return list.length;
}


/***/ }),

/***/ "./src/app.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_skeleton_css_css_normalize_css__ = __webpack_require__("../../node_modules/skeleton-css/css/normalize.css");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_skeleton_css_css_normalize_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_skeleton_css_css_normalize_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_skeleton_css_css_skeleton_css__ = __webpack_require__("../../node_modules/skeleton-css/css/skeleton.css");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_skeleton_css_css_skeleton_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_skeleton_css_css_skeleton_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__css_alarmBot_css__ = __webpack_require__("./src/css/alarmBot.css");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__css_alarmBot_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__css_alarmBot_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_botbuilder__ = __webpack_require__("../../libraries/botbuilder/lib/botbuilder.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_botbuilder___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_botbuilder__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__webChatAdapter__ = __webpack_require__("./src/webChatAdapter.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__chatComponent__ = __webpack_require__("./src/chatComponent.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__alarmRenderer__ = __webpack_require__("./src/alarmRenderer.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__routes__ = __webpack_require__("./src/routes.js");










const webChatAdapter = new __WEBPACK_IMPORTED_MODULE_4__webChatAdapter__["a" /* WebChatAdapter */]();

const bot = new __WEBPACK_IMPORTED_MODULE_3_botbuilder__["Bot"](webChatAdapter)
    .use(new __WEBPACK_IMPORTED_MODULE_3_botbuilder__["MemoryStorage"](),
        new __WEBPACK_IMPORTED_MODULE_3_botbuilder__["BotStateManager"](),
        new __WEBPACK_IMPORTED_MODULE_6__alarmRenderer__["a" /* AlarmRenderer */]());

__WEBPACK_IMPORTED_MODULE_5__chatComponent__["a" /* ChatComponent */].bootstrap(webChatAdapter.getMessagePipelineToBot(), document.querySelector('section'));
// handle activities
bot.onReceive((context) => Object(__WEBPACK_IMPORTED_MODULE_7__routes__["a" /* routes */])(context));

// FOUC
document.addEventListener('DOMContentLoaded', function () {
    requestAnimationFrame(() => document.body.style.visibility = 'visible');
});

/***/ }),

/***/ "./src/chatComponent.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class ChatComponent {

    /**
     * @property {Function} messagePipeline
     */

    /**
     * @property {Element} domContext
     */

    /**
     * @property {Activity} lastActivity
     */

    /**
     * @property {number} animationFrame
     */

    /**
     *
     * @param {Promise} messagePipeline
     * @param {Element} domContext
     */
    constructor(messagePipeline, domContext) {
        Object.assign(this, {messagePipeline, domContext});
        this.addEventListeners();
        this.animateScroll(domContext.querySelector('.messages-container')); // initial positioning
    }

    /**
     *
     */
    addEventListeners() {
        this.domContext.querySelector('form').addEventListener('submit', this.onFormSubmit.bind(this));
    }

    /**
     * Handler for form submission events.
     * Triggered after the user presses enter
     * while a form element is in focus or
     * when the send button is presses
     *
     * @param {Event} event
     */
    onFormSubmit(event) {
        event.preventDefault();
        const input = event.target.querySelector('input');
        const message = input.value;
        if (message) {
            this.messagePipeline(message)
                .then(this.activitiesReceived.bind(this))
                .catch(this.errorHandler.bind(this, message));
            this.addMessageToChat(message, 'user-message');
            input.value = '';
        }
    }

    activitiesReceived(activities) {
        const messages = activities.filter(message => message.type === 'message');
        if (messages.length) {
            messages.forEach(message => setTimeout(this.addMessageToChat.bind(this, message.text, 'bot-message'), 1000));
            this.lastActivity = messages[messages.length - 1]; // Not sure if its safe to pop this element
        }
        const events = activities.filter(event => event.type === 'event');
        if (events.length) {
            events.forEach(this.eventReceived.bind(this));
        }
    }

    eventReceived(event) {
        if (event.text === 'newAlarm') {
            return this.addAlarm(event);
        }
        if (event.text === 'deleteAlarm') {
            this.removeAlarm(event);
        }
    }

    errorHandler() {
        this.addMessageToChat(`Oops!. I didn't quite get that. Let's try again`, 'bot-message');
        setTimeout(this.addMessageToChat.bind(this.lastActivity.text, 'bot-message'), 1000);
    }

    addMessageToChat(message, className) {
        const div = document.createElement('div');
        const p = document.createElement('p');
        p.textContent = message;
        div.appendChild(p);

        const chat = this.domContext.querySelector('.messages-container');
        chat.appendChild(div).className = className;
        requestAnimationFrame(this.animateScroll.bind(this, chat));
    }

    addAlarm(alarm) {
        const alarmTemplate = document.getElementById('alarm-template');
        const fields = alarmTemplate.content.querySelectorAll('[data-field]');
        const alarms = this.domContext.querySelector('ul');

        fields[0].textContent = alarm.value.title;
        fields[1].textContent = `Set for: ${alarm.value.time}`;
        alarmTemplate.content.firstElementChild.setAttribute('data-alarm', alarm.value.title.toLowerCase());

        alarms.appendChild(document.importNode(alarmTemplate.content, true));
    }

    removeAlarm(alarm) {
        const li = this.domContext.querySelector(`ul > li[data-alarm="${alarm.value.title.toLowerCase()}"`);
        if (li) {
            li.parentElement.removeChild(li);
        }
    }

    animateScroll(element) {
        const clientHeight = element.clientHeight;
        const tY = element.parentElement.clientHeight - clientHeight;

        element.style.transform = `translateY(${tY}px)`;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = ChatComponent;


let instance;
ChatComponent.bootstrap = function (messagePipeline, domContext) {
    return instance || (instance = new ChatComponent(messagePipeline, domContext));
};

/***/ }),

/***/ "./src/css/alarmBot.css":
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__("../../node_modules/css-loader/index.js!./src/css/alarmBot.css");

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__("../../node_modules/style-loader/lib/addStyles.js")(content, options);

if(content.locals) module.exports = content.locals;

if(true) {
	module.hot.accept("../../node_modules/css-loader/index.js!./src/css/alarmBot.css", function() {
		var newContent = __webpack_require__("../../node_modules/css-loader/index.js!./src/css/alarmBot.css");

		if(typeof newContent === 'string') newContent = [[module.i, newContent, '']];

		var locals = (function(a, b) {
			var key, idx = 0;

			for(key in a) {
				if(!b || a[key] !== b[key]) return false;
				idx++;
			}

			for(key in b) idx--;

			return idx === 0;
		}(content.locals, newContent.locals));

		if(!locals) throw new Error('Aborting CSS HMR due to changed css-modules locals.');

		update(newContent);
	});

	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ "./src/routes.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = routes;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__alarms_addAlarm__ = __webpack_require__("./src/alarms/addAlarm.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__alarms_showAlarms__ = __webpack_require__("./src/alarms/showAlarms.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__alarms_deleteAlarm__ = __webpack_require__("./src/alarms/deleteAlarm.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__alarms_cancel__ = __webpack_require__("./src/alarms/cancel.js");
// configure bots routing table





function routes(context) {
    if (context.request.type === 'message') {
        // Check for the triggering of a new topic
        const utterance = (context.request.text || '').trim().toLowerCase();
        if (utterance.includes('add alarm')) {
            return __WEBPACK_IMPORTED_MODULE_0__alarms_addAlarm__["a" /* begin */](context);
        } else if (utterance.includes('delete alarm')) {
            return __WEBPACK_IMPORTED_MODULE_2__alarms_deleteAlarm__["a" /* begin */](context);
        } else if (utterance.includes('show alarms')) {
            return __WEBPACK_IMPORTED_MODULE_1__alarms_showAlarms__["a" /* begin */](context);
        } else if (utterance === 'cancel') {
            return __WEBPACK_IMPORTED_MODULE_3__alarms_cancel__["a" /* begin */](context);
        } else {
            // Continue the current topic
            switch (context.state.conversation.topic) {
                case 'addAlarm':
                    return __WEBPACK_IMPORTED_MODULE_0__alarms_addAlarm__["b" /* routeReply */](context);
                case 'deleteAlarm':
                    return __WEBPACK_IMPORTED_MODULE_2__alarms_deleteAlarm__["b" /* routeReply */](context);
                default:
                    context.reply(`Hi! I'm a simple alarm bot. Say "add alarm", "delete alarm", or "show alarms".`);
                    return Promise.resolve();
            }
        }
    }
}

/***/ }),

/***/ "./src/webChatAdapter.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_botbuilder__ = __webpack_require__("../../libraries/botbuilder/lib/botbuilder.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_botbuilder___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_botbuilder__);


const activitiesById = {};

class WebChatAdapter {
    post(activities) {
        activitiesById[activities[0].replyToId] = activities;
        return Promise.resolve(activities);
    }

    onReceive(activity) {
        // overwritten by bot
    }

    getMessagePipelineToBot() {
        return async text => {
            const id = Date.now();
            const payload = {
                id,
                text,
                type: __WEBPACK_IMPORTED_MODULE_0_botbuilder__["ActivityTypes"].message,
                channelId: -1,
                from: {id: -1},
                conversation: {id: -1}
            };
            await this.onReceive(payload);
            const activities = activitiesById[id];
            delete activitiesById[id];
            return Promise.resolve(activities);
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = WebChatAdapter;


/***/ })

/******/ });