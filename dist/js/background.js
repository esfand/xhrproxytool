!function(){"use strict";var e={init:function(){this.initConnect(),this.initWebRequest()},initConnect:function(){var e=this;chrome.runtime.onConnect.addListener(function(t){switch(t.name){case"send-request":e.sendRequestHandler(t);break;case"page-script-error":e.showPageScriptError(t);break;case"exec-scripts":e.execScriptsHandler(t)}}),chrome.runtime.onMessageExternal.addListener(function(e,t,n){"inject-content-script"===e.name&&chrome.tabs.executeScript(t.tab.id,{file:"js/xhrproxy.page.js"})})},initWebRequest:function(){chrome.webRequest.onBeforeSendHeaders.addListener(function(e){var t=chrome.i18n.getMessage("@@extension_id"),n=function(e,t,n){return e&&e.length>0?e.filter(function(e){return e[t]===n})[0]:null},r=n(e.requestHeaders,"name","Origin");if(e.initiator&&e.initiator.substring(19)===t||r&&r.value&&r.value.substring(19)===t){var a=JSON.parse(n(e.requestHeaders,"name","X-Set-Headers").value);for(var s in a){var i=n(e.requestHeaders,"name",s);i?"Cookie"===s?i.value+=";"+a[s]:i.value=a[s]:e.requestHeaders.push({name:s,value:a[s]})}return e.requestHeaders.splice(e.requestHeaders.findIndex(function(e){return"X-Set-Headers"===e.name}),1),{requestHeaders:e.requestHeaders}}},{urls:["<all_urls>"]},["blocking","requestHeaders"])},sendRequestHandler:function(e){e.onMessage.addListener(function(t){var n=new XMLHttpRequest,r="",a=t.method.toUpperCase(),s=t.url.trim();/^https?\:/.test(s)||(s="http://"+s);var i=t.headers||{};if(i["Content-Type"]||(i["Content-Type"]="application/x-www-form-urlencoded; charset=UTF-8"),/^(number|string|boolean)$/.test(typeof t.data))r=String(t.data);else for(var o in t.data)r&&(r+="&"),r+=o+"="+t.data[o];var d=[];if(Object.keys(t.data).forEach(function(e){var n=t.data[e];n.__isFile__&&d.push(new Promise(function(r,a){var s=new XMLHttpRequest;s.open("GET",n.blobUrl,!0),s.responseType="blob",s.onload=function(a){if(200===this.status){var s=this.response;t.data[e]=new File([s],n.filename,{type:s.type}),r()}},s.send()}))}),"GET"===a)r&&(s+="?"+r);else if("application/json"===i["Content-Type"])r=JSON.stringify(t.data);else if("multipart/form-data"===i["Content-Type"]){var u=new FormData;d.length?Promise.all(d).then(function(){Object.keys(t.data).forEach(function(e){u.append(e,t.data[e])}),n.send(u)}):(Object.keys(t.data).forEach(function(e){u.append(e,t.data[e])}),r=u),delete i["Content-Type"]}n.open(a,s,!0);var c={},p=["Referer","Accept-Charset","Accept-Encoding","Cookie","Date","Origin","User-Agent"];for(var f in i)p.indexOf(f)!==-1?c[f]=i[f]:n.setRequestHeader(f,i[f]);n.setRequestHeader("X-Set-Headers",JSON.stringify(c)),n.onreadystatechange=function(){if(4===this.readyState){var r={},a=["readyState","response","responseText","responseType","responseURL","responseXML","status","statusText","timeout","withCredentials"];a.forEach(function(e){r[e]=n[e]}),r.responseHeaders=this.getAllResponseHeaders(),r.responseHeaders=r.responseHeaders.split(/\n/).map(function(e){var t=e.indexOf(":");return t>0?e.substring(0,t).split("-").map(function(e){return e[0].toUpperCase()+e.substring(1)}).join("-")+":"+e.substring(t+1):""}).join("\n"),chrome.tabs.sendMessage(e.sender.tab.id,{name:"send-request-res",data:n.responseText,reqData:t,xhr:r})}},d.length||n.send(r)})},showPageScriptError:function(e){var t=localStorage.xhr_proxy_tool_js_error_notify;"true"===t&&e.onMessage.addListener(function(e){var t=new Notification("脚本错误:",{icon:"./js/image.png",body:e.data.message+"\n"+e.data.filename+"\n"+e.data.lineno});setTimeout(function(){t.close()},3e3)})},execScriptsHandler:function(e){e.onMessage.addListener(function(t){var n=e.sender.tab.id,r=t.data;chrome.webNavigation.getAllFrames({tabId:n},function(e){console.log(r);var t=e.find(function(e){return e.url.startsWith(r.targetFrameUrl)});t?chrome.tabs.executeScript({code:r.scripts+";jasmineRun();",frameId:t.frameId}):console.log("没有找到目标 iframe 地址: "+r.targetFrameUrl)})})}};e.init()}();