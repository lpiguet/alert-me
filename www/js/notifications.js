
var pushNotification;
var storage = window.localStorage;
        
function onDeviceReady() {

    drawStatus('deviceready event received');
        
    document.addEventListener("backbutton", function(e) {
            drawStatus('backbutton event received');
  	
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
            drawStatus('registering android');
            pushNotification.register(successHandler, errorHandler, {"senderID":"690639424128","ecb":"onNotificationGCM"});
            // required!
        } else {
            drawStatus('registering iOS');
            pushNotification.register(tokenHandler, errorHandler, {"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"});	// required!
        }
    } catch(err) { 
        txt="There was an error on this page.\n\n"; 
        txt+="Error description: " + err.message + "\n\n"; 
        alert(txt); 
    } 
    // Prepare UI
    drawAllNotifications();
}
        
// handle APNS notifications for iOS
function onNotificationAPN(e) {
    if (e.alert) {
        drawStatus('push-notification: ' + e.alert );
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
    drawStatus('EVENT -> RECEIVED:' + e.event );
        
    switch( e.event ) {
    case 'registered':
        if ( e.regid.length > 0 ) {
            drawStatus('REGISTERED -> REGID:' + e.regid);
            // Your GCM push server needs to know the regID before it can push to this device
            // here is where you might want to send it the regID for later use.
            console.log("regID = " + e.regID);
            $.post ('https://appstage.eks.com/traffic/registration.php', { registration: e.regid });
        }
        break;
        
    case 'message':
        // if this flag is set, this notification happened while we were in the foreground.
        // you might want to play a sound to get the user's attention, throw up a dialog, etc.
        /*
          if (e.foreground) {
          drawStatus('--INLINE NOTIFICATION--' );
	
          // if the notification contains a soundname, play it.
          var my_media = new Media("/android_asset/www/sounds/"+e.soundname);
          my_media.play();
          } else {	// otherwise we were launched because the user touched a notification in the notification tray.
          if (e.coldstart) {
          drawStatus('--COLDSTART NOTIFICATION--' );
          } else {
          drawStatus('--BACKGROUND NOTIFICATION--' );
          }
          }
	
          drawStatus('MESSAGE -> MSG: ' + e.payload.message );
          drawStatus('MESSAGE -> MSGCNT: ' + e.payload.msgcnt );
        */
        addNotification (e.payload);
        break;
        
    case 'error':
        drawStatus('ERROR -> MSG:' + e.msg );
        break;
        
    default:
        drawStatus('EVENT -> Unknown, an event was received and we do not know what it is');
        break;
    }
}

function drawStatus (msg) {
    /*    $("#app-status-ul").append('<li>'+msg+'</li>');*/
    console.log (msg);
}

function drawNotification (pl) {
    txt = '<div>';
    txt += '<img src="img/'+pl.type+'.png" alt="" />';
    txt += pl.title + '<br/>'+pl.message+ ' ('+pl.timestamp+')<br/><a href="'+pl.url+'" alt="">'+pl.url+'</a></div>';
    $("#notifications-ul").append('<li>' + txt + '</li>');

    /*
    var my_media = new Media("/android_asset/www/sounds/"+pl.type+".wav");
    my_media.play();
    */
}

function addNotification (pl) {
    drawNotification (pl);
    var value = JSON.stringify (pl);
    var key = pl.timestamp;
    storage.setItem (key, value);

    // Verify
    drawStatus ('Stored:'+storage.getItem(key));
}

function drawAllNotifications () {
    $("#notifications-ul").empty();
    for (var i=0; i < storage.length; i++) {
        pl = JSON.parse (storage.getItem(storage.key(i)));
        drawNotification (pl);
    }
}

function clearAllNotifications () {
    $("#notifications-ul").empty();
    storage.clear();
    alert ('All notifications cleared');
}
        
function tokenHandler (result) {
    drawStatus('token: '+ result);
    // Your iOS push server needs to know the token before it can push to this device
    // here is where you might want to send it the token for later use.
}
	
function successHandler (result) {
    drawStatus('success:'+ result);
}
        
function errorHandler (error) {
    drawStatus('error:'+ error);
}
        
document.addEventListener('deviceready', onDeviceReady, true);

