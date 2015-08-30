var NotificationManager = function(name, addr) {

    var pushNotification;
    var storage = window.localStorage;

    debug ('in NotificationManager');

    this.storageKey = name+'-'+addr+'-notifications';

    this.initializePushNotification();

    // Methods ------------------------------

    this.initializePushNotification = function () {
        var pushNotification = PushNotification.init({ "android": {"senderID": "690639424128"},
                                                           "ios": {}, "windows": {} } );

        pushNotification.on ('registration', onRegistration);
        pushNotification.on ('notification', onNotification);
        pushNotification.on ('error', onError);
    }

    this.onError = function (data) {
        debug('ERROR -> MSG:' + data.message );
        alert('ERROR -> MSG:' + data.message );
    }

    this.onRegistration = function (data) {
            if ( data.registrationId.length > 0 ) {
                debug('REGISTERED -> REGID:' + data.registrationId);
                alert('REGISTERED -> REGID:' + data.registrationId);
                // Your GCM push server needs to know the regID before it can push to this device
                // here is where you might want to send it the regID for later use.
                $.post (this.registrationBackend, { 
                    registration: data.registrationId,
                    uuid: device.uuid,
                    name: device.name,
                    platform: device.platform,
                    version: device.version
                });
            }
    }
    
    // handle GCM notifications for Android
    this.onNotification = function (data) {

        debug('EVENT -> RECEIVED:' + data.title + '/' + data.message + '/' + data.count );
        alert('EVENT -> RECEIVED:' + data.title + '/' + data.message + '/' + data.count );
        
//        addNotification (data);
    }

    this.addNotification = function (pl) {
        // data.message,
        // data.title,
        // data.count,
        // data.sound,
        // data.image, 
        // data.additionalData


        var curNotifStr = storage.getItem (app.backend.notificationManager.storageKey);

        if (curNotifStr) {
            curNotif = JSON.parse (curNotifStr);
        } else {
            curNotif = new Array();
        }

        curNotif.push(data);

        // Sort the array
        curNotif.sort(function(a, b) {
            return parseInt (a.timestamp) - parseInt (b.timestamp);
        });

        curNotifStr = JSON.stringify (curNotif);
        storage.setItem (app.backend.notificationManager.storageKey, curNotifStr);

//        debug ('Key: '+app.backend.notificationManager.storageKey);
//        debug ('Stored:'+storage.getItem(app.backend.notificationManager.storageKey));    // Verify

        // Play sound
        /*
    var sound_file = "/android_asset/www/sounds/"+pl.type+".mp3";
    var my_media = new Media(sound_file);
    debug ('Playing sound:'+sound_file);
    my_media.play();
    */
    }

    this.deleteNotification = function (uid) {

        debug ('Removing item '+uid);

        var curNotifStr = storage.getItem (app.backend.notificationManager.storageKey);
        if (curNotifStr == 'undefined') {
            debug ('deleteNotification:  '+app.backend.notificationManager.storageKey+ ' not found');
            return;
        }

        curNotif = JSON.parse (curNotifStr);
        var len = curNotif.length;
        var deletedItem = false;
        for (var i=0;i<len;i++) {

            if (curNotif[i].timestamp == uid) {
                debug ('Removed: ' + JSON.stringify (curNotif[i]));
                curNotif.splice (i, 1);
                deletedItem = true;
                break;
            }
        }
        if (deletedItem) {
            if (curNotif.length > 0) {
                curNotifStr = JSON.stringify (curNotif);
                storage.setItem (app.backend.notificationManager.storageKey, curNotifStr);
                debug ('Key: '+app.backend.notificationManager.storageKey);
//                debug ('Stored:'+storage.getItem(app.backend.notificationManager.storageKey));    // Verify
            } else {
                storage.removeItem (app.backend.notificationManager.storageKey);
                debug ('Key: '+app.backend.notificationManager.storageKey+': no more elements');            
            }
        }
        this.render();
    }

    this.render = function () {

        var out = '';

        var curNotifStr = storage.getItem (app.backend.notificationManager.storageKey);
        if (curNotifStr) {
            curNotif = JSON.parse (curNotifStr);
            var len = curNotif.length;
            for (var i=0;i<len;i++) {
                out = out + this.drawNotification (curNotif[i]);
            }
            this.clearWelcome();
        } else {
            this.drawWelcome();
        }

        $("#notifications-div").html(out);
    }

    this.clearAllNotifications = function () {
        if (confirm (am.confirm_clear_all)) {
            $("#notifications-div").empty();
            storage.removeItem(app.backend.notificationManager.storageKey);
            this.render();
            debug ('All notifications cleared');
        }
    }
   
    this.tokenHandler = function (result) {
        debug('token: '+ result);
        // Your iOS push server needs to know the token before it can push to this device
        // here is where you might want to send it the token for later use.
    }
    
    this.successHandler = function (result) {
        debug('success:'+ result);
    }
    
    this.errorHandler = function (error) {
        debug('error:'+ error);
    }

    this.debug = function () {
        var now = new Date().valueOf();
        var pl = { title: 'Test - '+now,
                   message:"A1 - Geneve -> Lausanne - Entre la jonction d'Aubonne et la jonction de Morges-Est trafic en accordeon",
                   timestamp: now ,
                   type:"traffic",
                   url: this.addr };

        this.addNotification(pl);
        app.route('home');
    }

    this.drawWelcome = function () {
        $("#messages-div").html('<div class="row service-event"><p id="welcome">'+am.no_notifications_msg+'</p></div>');
    }

    this.clearWelcome = function () {
        $("#messages-div").empty();
    }

    this.drawNotification = function (pl) {

        if (typeof pl.timestamp === 'undefined' || pl.timestamp == 0) {
            var date = new Date();
            pl.timestamp = date.valueOf();
        }

        var uid = pl.timestamp;
        
        if (typeof uid === 'undefined') { return; }

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

        return txt;
    }
}