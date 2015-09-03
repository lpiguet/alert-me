function Backend (name, addr, endpoint, login_endpoint, logout_endpoint) {

    this.getAddr = function () {
        return this.addr;
    }

    this.getTicket = function () {
        return this.auth.getTicket();
    }

    if (window.location.hostname == 'local-'+addr) {
        this.addr = 'http://local-'+addr+'/'+endpoint; // local version
    } else if (window.location.hostname == 'local.'+addr) {
        this.addr = 'http://local.'+addr+'/'+endpoint; // local version
    } else {
        this.addr = 'https://'+addr+'/'+endpoint; // deployed version
    }
/*
    debug ('Backend: before new notificationManager');
    this.notificationManager = new NotificationManager(name, this.addr);
    debug ('Backend: before new Auth');
    this.auth = new Auth (name, this.addr, login_endpoint, logout_endpoint);
*/
//    console.log ('new '+ this.constructor.name + ': '+ JSON.stringify(this));

}