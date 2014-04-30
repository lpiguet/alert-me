function Auth (name, addr, login_endpoint, logout_endpoint) {

    this.initialize = function () {
        this.name = name;
        this.addr = addr;
        this.login_endpoint = login_endpoint;
        this.logout_endpoint = logout_endpoint;
        this.localStoragePrefix = this.name+'-'+this.addr;
    }

    this.getTicket = function () {

        var ticket = localStorage.getItem (this.localStoragePrefix+'-ticket');
//        console.log ('Checked ticket:'+ticket);
        if (ticket) {
//            console.log ('Auth: success');
            return ticket;
        } else {
//            console.log ('Auth: no ticket');
            return false;
        }
    }

    this.logout = function () {
        localStorage.removeItem (this.localStoragePrefix+'-ticket');
        // Perform server-side logout as well
        $.ajax({url : this.addr+this.logout_endpoint, type: "GET", success:function(data, textStatus, jqXHR) { console.log ('Logged out');}});
        location.reload(); // reload the page
    }

    this.drawLogin = function () {

        var uuid;
        var name;
        var platform;
        var version;

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

        var txt = '<div class="row user form"><div id="login-error"></div><form accept-charset="utf-8" method="post" id="UserLoginForm" class="nice" action="';
        console.log ('Address:'+this.addr);
        txt += this.addr+this.login_endpoint+'"><div style="display:none;">';
        txt += '<input type="hidden" value="POST" name="_method">';
        txt += '<input type="hidden" value="'+uuid+'" name="data[Device][uuid]" />';
        txt += '<input type="hidden" value="'+name+'" name="data[Device][name]" />';
        txt += '<input type="hidden" value="'+platform+'" name="data[Device][platform]" />';
        txt += '<input type="hidden" value="'+version+'" name="data[Device][version]" /></div>';
        txt += '<div id="login-form"><fieldset><legend>Please enter your username and password</legend>';
        txt += '<div class="form-field required"><label for="UserUsername">Username</label><input type="text" required="required" id="UserUsername" maxlength="100" class="input-text medium input-text" name="data[User][username]"></div><div class="form-field required"><label for="UserPassword">Password</label><input type="password" required="required" id="UserPassword" class="input-text medium input-text" name="data[User][password]"></div>';
        txt += '<div class="go"><button class="small button">Submit</button></div></fieldset></form></div></div>';

        this.el = $('<div id="login-div"/>');
        var c = { notificationBackend: app.backend.getAddr(), app_name: am.app_name, clear_all:am.clear_all };
        this.el.html(Auth.template(c));
        this.el.append (txt);        
        return this;
    }

    this.postRender = function () {

        var self = this;

        $('#UserUsername').focus();

        //callback handler for form submit
        $("#UserLoginForm").submit(function(e) {

            var postData = $(this).serializeArray();
            var formURL = $(this).attr("action");
            $.ajax({
                url : formURL,
                type: "POST",
                crossDomain: true,
                data : postData,
                success:function(data, textStatus, jqXHR) {
                    //data: return data from server
                    console.log ('URL:'+formURL);
                    console.log ('Success: received: ' + data);
                    var result = JSON.parse (data);
                    $('#login-error').prepend ('<div class="alert-box alert">' + data + '</div>');
                    if (result && result.status == 'OK') {
                        if (result.ticket) {
                            localStorage.setItem (self.localStoragePrefix+'-ticket', result.ticket);
                            console.log ('Success: stored: ' + localStorage.getItem (self.localStoragePrefix+'-ticket') + ' - ' + self.localStoragePrefix+'-ticket');
                        }
                        if (result.projects) {
                            localStorage.setItem (self.localStoragePrefix+'-projects', JSON.stringify (result.projects));
                        }
                        $("#login-div").empty();
                        location.reload(); // reload the page
                    } else {
//                        $('#login-error').html ('<div class="alert-box alert">' + result.message + '</div>');
                        $('#UserPassword').val('');
                        console.log ('Login Error: ' + result.message);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    //if fails     
                    console.log ('Failure: ' + textStatus);
                }
            });
            e.preventDefault(); //STOP default action
        });
    }

    this.initialize();

//    console.log ('new '+ this.constructor.name + ': '+ JSON.stringify(this));

}

Auth.template = Handlebars.compile($("#auth-tpl").html());

