//// Old - Prod
//var notificationBackend = 'https://app.innovalue.ch/traffic';
//var registrationBackend = notificationBackend+'/registration.php'

// New - Local
var notificationBackend = 'http://192.168.99.10/alertme';
var registrationBackend = notificationBackend+'/devices/register'

// New - Prod
//var notificationBackend = 'https://app.innovalue.ch/alertme';
//var registrationBackend = notificationBackend+'/devices/register'


var pushNotification;
var storage = window.localStorage;

        
function onDeviceReady() {

    debug('deviceready event received');
    /*
    document.addEventListener("backbutton", function(e) {        
            debug ("Back button pressed");
        }, false);
    */

    document.addEventListener("backbutton", function(e) {
            debug('backbutton event received');
  	
            if( $("#home").length > 0) {
                // call this to get a new token each time. don't call it to reuse existing token.
                //pushNotification.unregister(successHandler, errorHandler);
                e.preventDefault();
                debug('exiting app');
                navigator.app.exitApp();
            } else {
                debug('going back');
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
            $.post (registrationBackend, { 
                        registration: e.regid,
                        uuid: device.uuid
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

function pr_date (ts) {
    var d;
    if (ts == 0) {
        d = new Date();
    } else {
        d = new Date(parseInt(ts, 10));
    }

    var cult = Zepto.i18n.browserLang(); // grab current culture from browser information
    debug (cult);
    Globalize.culture(cult);
    return Globalize.format(d, 'd') + ' ' + Globalize.format(d, 't');
}


function openURL (url) {
    //    var ref = window.open (url, '_system');
    var ref = window.open (url, '_blank', 'location=no');
}

function checkLoggedInState () {
    uuid = getUUID();
    debug ("Checking logged in state: "+uuid);
    var val = storage.getItem('login.'+uuid);
    debug ("Value:"+val);
    if (val != undefined) {
        debug ("Logged in with uuid: "+uuid);
        return true;
    } else {
        debug ("Did not find token: "+uuid);
        return false;
    }
}

function storeLoggedInState () {
    uuid = getUUID();
    storage.setItem('login.'+uuid, uuid);
    debug ('Stored login:'+storage.getItem('login.'+uuid));    // Verify
}

function clearLoggedInState () {
    uuid = getUUID();
    storage.removeItem('login.'+uuid);
}

function addNotification (pl) {
    clearWelcome();
    var value = JSON.stringify (pl);
    var key = 'event.'+pl.timestamp;
    storage.setItem (key, value);

    if ($('#welcome')) {
        $('#welcome').remove();
    }

    debug ('Key: '+key);
    debug ('Stored:'+storage.getItem(key));    // Verify
    debug ("Total items: "+storage.length);

    drawAllNotifications ();
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

    // Remove from storage
    storage.removeItem ('event.'+uid);

    if (storage.length == 0) {
        drawWelcome();
    }
    drawAllNotifications ();
}

function getUUID () {
    if (typeof device === 'undefined') {
        uuid = 'unknown-x234sajkha-2342';
    } else {
        uuid = device.uuid;
    }
    debug ("UUID:"+uuid);
    return uuid;
}

function checkLogin () {
    if (! checkLoggedInState()) {
        drawLogin();
        return false;
    }
    return true;
}

function drawLogin() {

    var uuid;
    var name;
    var platform;
    var version;
    if (typeof device === 'undefined') {
        uuid = getUUID();
        name = navigator.appCodeName;
        platform = navigator.platform;
        version = navigator.appVersion;
    } else {
        uuid = getUUID();
        name = device.name;
        platform = device.platform;
        version = device.version;
    }

    var txt = '<div class="row user form"><form accept-charset="utf-8" method="post" id="UserLoginForm" class="nice" action="';
    txt += notificationBackend+'/users/login"><div style="display:none;">';
    txt += '<input type="hidden" value="POST" name="_method">';
    txt += '<input type="hidden" value="'+uuid+'" name="data[Device][uuid]" />';
    txt += '<input type="hidden" value="'+name+'" name="data[Device][name]" />';
    txt += '<input type="hidden" value="'+platform+'" name="data[Device][platform]" />';
    txt += '<input type="hidden" value="'+version+'" name="data[Device][version]" /></div>';
    txt += '<fieldset><legend>Please enter your username and password</legend>';
    txt += '<div class="form-field required"><label for="UserUsername">Username</label><input type="text" required="required" id="UserUsername" maxlength="100" class="input-text medium input-text" name="data[User][username]"></div><div class="form-field required"><label for="UserPassword">Password</label><input type="password" required="required" id="UserPassword" class="input-text medium input-text" name="data[User][password]"></div>';
    //    txt += '<div class="submit"><button>Submit</button></div></form></div>';
    txt += '<div class="go"><button class="small button">Submit</button></div></fieldset></form></div>';
    
    $("#login-div").append (txt);

//callback handler for form submit
$("#UserLoginForm").submit(function(e) {

    var postData = $(this).serializeArray();
    var formURL = $(this).attr("action");
    $.ajax({
            url : formURL,
            type: "POST",
            data : postData,
            success:function(data, textStatus, jqXHR) {
                //data: return data from server
                debug ('Success: received: ' + data);
                storeLoggedInState();
                $("#login-div").empty();
                drawAllNotifications();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                //if fails     
                debug ('Failure: ' + textStatus);
            }
    });
    e.preventDefault(); //STOP default action
});

}
function drawHeader() {
    txt = '<div class="left"><img src="icon.png" alt=""/></div>';
    txt += '<div class="title left am_app_name"><a class="clickable" onclick="openURL(\''+notificationBackend+'\');">'+am.app_name+'</a></div>';

    $("#title_area").html (txt);

    txt = '<a class="clickable" onclick="clearAllNotifications();"><i class="fi-x-circle action-icon"></i>&nbsp;'+am.clear_all+'</a>';
    $("#actions_area").html (txt);
}

function drawFooter () {
    txt = '<div class="row footer_banner">';
    txt += '<div class="large-12 columns">';
    txt += '<p class="left"><a class="clickable" onclick="openURL(\''+notificationBackend+'\');"><i class="fi-home action-icon"></i>&nbsp;'+am.app_name+'</a></p>';
    txt += '<p class="right"><a class="clickable" onclick="clearAllNotifications();"><i class="fi-x-circle action-icon"></i>&nbsp;'+am.clear_all+'</a></p>';

    txt += '</div>';
    txt += '</div>';

    $("#footer-div").append (txt);
}

function drawWelcome() {
    $("#messages-div").html('<div class="row service-event"><p id="welcome">'+am.no_notifications_msg+'</p></div>');
}
function clearWelcome() {
    $("#messages-div").empty();
}

function drawAllNotifications () {

    if (!checkLogin()) { return; }

    $("#notifications-div").empty();

    debug ("items: "+storage.length);

    // Sort the items by their key (timestamp)
    var arr = new Array();
    for (var key in storage) {
        if (key.match(/event.*/)) {
            arr.push(key);
        }
    }

    arr.sort(function(a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });

    for (var i=0; i<arr.length; i++) {
        pl = JSON.parse (storage.getItem(arr[i]));
        drawNotification (pl);
    }

    if (storage.length == 0) {
        drawWelcome();
    } else {
        clearWelcome();
    }
}

function clearAllNotifications () {
    if (confirm (am.confirm_clear_all)) {
        $("#notifications-div").empty();
        drawWelcome();

        clearStorage (/event.*/);
        debug ('All notifications cleared');
    }
}

function clearStorage (pat) {
    //    storage.clear();
    for (var key in storage) {
        debug ("testing: "+key+" against "+pat);
        if (key.match (pat)) {
            debug ("clearStorage: erasing: "+key);
            storage.removeItem(key);
        }
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

function drawNotification (pl) {

    if (typeof pl.timestamp === 'undefined' || pl.timestamp == 0) {
        var date = new Date();
        pl.timestamp = date.valueOf();
    }

    var uid = pl.timestamp;
    //    console.log ('uid:'+uid);
    if (typeof uid === 'undefined') { return; }

    var txt = '<div class="row service-event" id="'+uid+'">';

    txt += '<div class="small-2 columns" style="text-align:center"><img class="service-type" src="img/'+pl.type+'.png" alt="" /></div>';

    var curMsg = pl.message;
    curMsg = curMsg.replace (/'/g, "\\'");

//    console.log ('share msg:'+curMsg);
    var shareonclickstr = 'window.plugins.socialsharing.share(\''+curMsg+ ' ('+pl.url+')\', \''+pl.title+'\');';

    txt += '<div class="small-9 columns"><p class="title">'+pl.title+'</p><p class="message">'+pl.message+'</p><p class="timestamp">' +pr_date(pl.timestamp)+' - '+pl.type;
    txt += '<a class="clickable" onclick="'+shareonclickstr+'"><i class="fi-share action-icon-sm"></i></a>';
    txt += '</p>';

    txt += '</div>';
    txt += '<div class="small-1 column"><a class="clickable right" onclick="deleteNotification(\''+uid+'\')"><i class="fi-x-circle action-icon"></i></a></div>';
    txt += '</div>';


    $("#notifications-div").prepend(txt);
}

        
document.addEventListener('deviceready', onDeviceReady, true);

