alert ('Before PushNotification.init');
var push = PushNotification.init({ "android": {"senderID": "690639424128"},
                                   "ios": {}, "windows": {} } );

alert ('After PushNotification.init');
push.on('registration', function(data) {
        // data.registrationId
    alert ('Registration: ' + data.registrationId);
});

push.on('notification', function(data) {

    alert ('notification: ' + data.title + ': ' + data.message);
        // data.message,
        // data.title,
        // data.count,
        // data.sound,
        // data.image, 
        // data.additionalData
});

push.on('error', function(e) {
    alert ('error: '+e.message);
        // e.message
});