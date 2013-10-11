
var pushNotification;
var storage = window.localStorage;
        
function onDeviceReady() {

    debug('deviceready event received');
        
    document.addEventListener("backbutton", function(e) {
            debug('backbutton event received');
  	
            if( $("#home").length > 0) {
                // call this to get a new token each time. don't call it to reuse existing token.
                //pushNotification.unregister(successHandler, errorHandler);
                e.preventDefault();
                navigator.app.exitApp();
            } else {
                navigator.app.backHistory();
            }
        }, false);
	
    try { 
        pushNotification = window.plugins.pushNotification;
        if (device.platform == 'android' || device.platform == 'Android') {
            debug('registering android');
            pushNotification.register(successHandler, errorHandler, {"senderID":"690639424128","ecb":"onNotificationGCM"});
            // required!
        } else {
            debug('registering iOS');
            pushNotification.register(tokenHandler, errorHandler, {"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"});	// required!
        }
    } catch(err) { 
        alert(am.phonegap_error(err.message)); 
    } 
    // Prepare UI
    drawAllNotifications();
}
        
// handle APNS notifications for iOS
function onNotificationAPN(e) {
    if (e.alert) {
        debug('push-notification: ' + e.alert );
        navigator.notification.alert(e.alert);
    }
        
    if (e.sound) {
        var snd = new Media('sounds/'.e.sound);
        snd.play();
    }
        
    if (e.badge) {
        pushNotification.setApplicationIconBadgeNumber(successHandler, e.badge);
    }
}
        
// handle GCM notifications for Android
function onNotificationGCM(e) {
    debug('EVENT -> RECEIVED:' + e.event );
        
    switch( e.event ) {
    case 'registered':
        if ( e.regid.length > 0 ) {
            debug('REGISTERED -> REGID:' + e.regid);
            // Your GCM push server needs to know the regID before it can push to this device
            // here is where you might want to send it the regID for later use.
            $.post ('https://app.innovalue.ch/traffic/registration.php', { 
                        registration: e.regid,
                        uuid: device.uuid,
                        name: device.name,
                        platform: device.platform,
                        version: device.version
                        });
        }
        break;
        
    case 'message':
        // if this flag is set, this notification happened while we were in the foreground.
        // you might want to play a sound to get the user's attention, throw up a dialog, etc.
        /*
          if (e.foreground) {
          debug('--INLINE NOTIFICATION--' );
	
          // if the notification contains a soundname, play it.
          var my_media = new Media("/android_asset/www/sounds/"+e.soundname);
          my_media.play();
          } else {	// otherwise we were launched because the user touched a notification in the notification tray.
          if (e.coldstart) {
          debug('--COLDSTART NOTIFICATION--' );
          } else {
          debug('--BACKGROUND NOTIFICATION--' );
          }
          }
	
          debug('MESSAGE -> MSG: ' + e.payload.message );
          debug('MESSAGE -> MSGCNT: ' + e.payload.msgcnt );
        */

        /* //this seems to make it miss certain notifications
        if (e.foreground) {
            //navigator.notification.vibrate(500); // this causes issues
            var my_media = new Media("/android_asset/www/sounds/"+e.payload.type+".wav");
            my_media.play();
        }
        */
        addNotification (e.payload);
        break;
        
    case 'error':
        alert(am.error_event('laurent.piguet@gmail.com') + e.msg );
        debug('ERROR -> MSG:' + e.msg );
        break;
        
    default:
        alert(am.unknown_event('laurent.piguet@gmail.com'));
        debug('EVENT -> Unknown, an event was received and we do not know what it is: ' + e.msg);
        break;
    }
}

function debug (msg) {
    console.log (msg);
}

function drawNotification (pl) {
    var uid = pl.timestamp;
    uid = uid.replace (" ", "_").replace (":", "_");
    txt = '<div class="service-event" id="'+uid+'">';
    txt += '<div class="row">';
    txt += '<div class="col-xs-2 text-center"><img class="service-type" src="img/'+pl.type+'.png" alt="" /></div>';

    var curMsg = pl.message;
    curMsg = curMsg.replace ("'", "\'");
    var onclickstr = 'window.plugins.socialsharing.share(\''+curMsg+ ' ('+pl.url+')\', \''+pl.title+'\');';

    txt += '<div class="col-xs-8 clickable" onclick="'+onclickstr+'"><span class="title">'+pl.title+'</span><br/><span class="">'+pl.message+'</span><br/><span class="timestamp text-muted">' +pl.timestamp+' - '+pl.type+'</span>';
    txt += '</div>';
    txt += '<div class="col-xs-1"><a class="clickable" onclick="deleteNotification(\''+uid+'\')"><span class="glyphicon glyphicon-remove-circle"></span></a></div>';
    txt += '</div>';
    txt += '</div>';

    $("#notifications-div").prepend(txt);
}

function openURL (url) {
    //    var ref = window.open (url, '_system');
    var ref = window.open (url, '_blank', 'location=no');
}

function addNotification (pl) {
    drawNotification (pl);
    var value = JSON.stringify (pl);
    var key = pl.timestamp.replace (" ", "_").replace (":", "_");
    storage.setItem (key, value);

    if ($('#welcome')) {
        $('#welcome').remove();
    }

    debug ('Stored:'+storage.getItem(key));    // Verify

    // Play sound
    /*
    var sound_file = "/android_asset/www/sounds/"+pl.type+".mp3";
    var my_media = new Media(sound_file);
    debug ('Playing sound:'+sound_file);
    my_media.play();
    */
}

function deleteNotification (uid) {

    debug ('Removing item '+uid);

    // Remove from UI
    $("#"+uid).remove();

    // Remove from storage
    storage.removeItem (uid);

    if (storage.length == 0) {
        drawWelcome();
    }

}

function drawFooter () {
    txt = '<div class="navbar">';
    txt += '<p class="navbar-text" style="padding-left:10px;"><a class="clickable" onclick="openURL(\'https://app.innovalue.ch/traffic\');"><span class="glyphicon glyphicon-home"></span>&nbsp;'+am.app_name+'</a></p>';
    txt += '<p class="navbar-text pull-right" style="padding-right:10px;"><a class="clickable" onclick="clearAllNotifications();"><span class="glyphicon glyphicon-remove-circle"></span>&nbsp;'+am.clear_all+'</a></p>';
    txt += '</div>';

    $("#footer-div").append (txt);
}

function drawWelcome() {
    $("#notifications-div").append('<p style="padding:20px 30px;" id="welcome">'+am.no_notifications_msg+'</p>');
}

function drawAllNotifications () {

    $("#notifications-div").empty();

    for (var i=0; i < storage.length; i++) {
        pl = JSON.parse (storage.getItem(storage.key(i)));
        drawNotification (pl);
    }

    if (storage.length == 0) {
        drawWelcome();
    }

    drawFooter();
}

function clearAllNotifications () {
    if (confirm (am.confirm_clear_all)) {
        $("#notifications-div").empty();
        drawWelcome();

        storage.clear();
        debug ('All notifications cleared');
    }
}
        
function tokenHandler (result) {
    debug('token: '+ result);
    // Your iOS push server needs to know the token before it can push to this device
    // here is where you might want to send it the token for later use.
}
	
function successHandler (result) {
    debug('success:'+ result);
}
        
function errorHandler (error) {
    debug('error:'+ error);
}
        
document.addEventListener('deviceready', onDeviceReady, true);

