var HomeView = function(app) {
    var mytimeout = null;
    this.initialize = function() {
        // Define a div wrapper for the view. The div wrapper is used to attach events.
        this.el = $('<div id="homePage"/>');

        this.el.on('click', '#logout', function (event) {
            $.proxy(app.backend.auth.logout(), this);
        });
    };
 
    this.render = function() {
        var c = { notificationBackend: app.backend.getAddr(), app_name: am.app_name, clear_all:am.clear_all };
        this.el.html(HomeView.template(c));
        return this;
    };

    this.postRender = function () {
        app.backend.notificationManager.render();
    }

    this.backendView = function () {
        this.el.html('<iframe src="{{href}}" style="width:100%; height:100%;">');
    }

    this.initialize();

}
 
HomeView.template = Handlebars.compile($("#home-tpl").html());
