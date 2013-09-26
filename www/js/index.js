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
    // Application Constructor
    initialize: function() {
        this.registerGCM();
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        alert ('events registered');
    },

    registerGCM: function () {
        alert ('Registering GCM');        
        try {
            var pushNotification = window.plugins.pushNotification;
            pushNotification.register(app.gcmSuccessHandler, app.gcmErrorHandler,{"senderID":"690639424128","ecb":"app.onNotificationGCM"});
        } catch (e) {
            alert (e.message);
        }
        alert ('GCM Registered');        
    },

    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },

    // Process received events
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);

        console.log('Received Event: ' + id);
    },

    // result contains any message sent from the gcm plugin call
    gcmSuccessHandler: function(result) {
        alert('Callback Success! Result = '+result)
    },

    // gcm Error
    gcmErrorHandler:function(error) {
        alert(error);
    },

    // gcm Notification Message
    onNotificationGCM: function(e) {
        switch (e.event) {
            case 'registered':
            if (e.regid.length > 0) {
                console.log("Regid " + e.regid);
                alert('registration id = '+e.regid);
            }
            break;
 
            case 'message':
            // this is the actual push notification. its format depends on the data model from the push server
            alert('message = '+e.message+' msgcnt = '+e.msgcnt);
            break;
 
            case 'error':
            alert('GCM error = '+e.msg);
            break;
 
            default:
            alert('An unknown GCM event has occurred');
            break;
        }
    }

};
