var BackendView = function(app) {
    var mytimeout = null;
    this.initialize = function() {
        // Define a div wrapper for the view. The div wrapper is used to attach events.
        this.el = $('<div />');

    };
 
    this.render = function() {
        var c = { href: app.backend.getAddr(), app_name: am.app_name };
        this.el.html(BackendView.template(c));
        return this;
    };

    this.postRender = function () {

    }

    this.initialize();

}
 
BackendView.template = Handlebars.compile($("#backend-tpl").html());
