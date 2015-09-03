/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {

    backend: null,

    // Application Constructor
    initialize: function() {
        this.bindEvents();

        this.backend = new Backend ('alert-me', 'app.innovalue.ch', 'alertme', '/users/login', '/users/logout');

        if (!this.homePage) {
            var page = new HomeView(this).render();
            $('body').append(page.el);

        }
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        var push = PushNotification.init({
            "android": {
                "senderID": "690639424128"
            },
            "ios": {}, 
            "windows": {} 
        });
        
        push.on('registration', function(data) {

            if (typeof device === 'undefined') {
                uuid = 'browser';
                name = navigator.appCodeName;
                platform = navigator.platform;
                version = navigator.appVersion;
            } else {
                uuid = device.uuid;
                name = device.name;
                platform = device.platform;
                version = device.version;
            }

            var reginfo = { 
                'uuid': uuid,
                'name': name,
                'platform': platform,
                'version': version,
                'registration': data.registrationId
            };

            console.log("registration event");
            document.getElementById("regId").innerHTML = data.registrationId;
            console.log(JSON.stringify(reginfo));
        });

        push.on('notification', function(data) {
            console.log("notification event");
//            console.log(JSON.stringify(data));



/*

            var push = '<div class="row">' +
		  		  '<div class="col s12 m6">' +
				  '  <div class="card darken-1">' +
				  '    <div class="card-content black-text">' +
				  '      <span class="card-title black-text">' + data.title + '</span>' +
				  '      <p>' + data.message + '</p>' +
				  '    </div>' +
				  '  </div>' +
				  ' </div>' +
				  '</div>';

*/
            var uid = '01';
            var pl = {type: "traffic",
                      url: "https://app.innovalue.ch/traffic",
                      timestamp: now,
                      title: data.title,
                      message: data.message };

            var txt = '<div class="row service-event" id="'+uid+'">';

            txt += '<div class="small-2 columns" style="text-align:center"><img class="service-type" src="img/'+pl.type+'.png" alt="" /></div>';

        var curMsg = pl.message;
        curMsg = curMsg.replace (/'/g, "\\'"); 

        //    debug ('share msg:'+curMsg);
        var shareonclickstr = 'window.plugins.socialsharing.share(\''+curMsg+ ' ('+pl.url+')\', \''+pl.title+'\');';

        txt += '<div class="small-9 columns"><p class="title">'+pl.title+'</p><p class="message">'+pl.message+'</p><p class="timestamp">' +pr_date(pl.timestamp)+' - '+pl.type;
        txt += '<a class="clickable" onclick="'+shareonclickstr+'"><i class="fi-share action-icon-sm"></i></a>';
        txt += '</p>';

        txt += '</div>';
        txt += '<div class="small-1 column"><a class="clickable right" onclick="app.backend.notificationManager.deleteNotification(\''+uid+'\')"><i class="fi-x-circle action-icon"></i></a></div>';
        txt += '</div>';

            var notifications = document.getElementById("notifications-div");
            notifications.innerHTML += txt;
        });

        push.on('error', function(e) {
            alert ("error");
            console.log("push error");
        });
    }
};

app.initialize();