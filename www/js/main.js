var App = function () {


    this.registerEvents = function() {
        var self = this;
        $(window).on('hashchange', $.proxy(this.route, this));
    },

    this.route = function (target) {
        var self = this;
//        console.log ('new '+ this.constructor.name + ': '+ JSON.stringify(this));
        debug ('Entering app.route()');

        if (!this.backend.auth.getTicket()) {
            this.slidePage(this.backend.auth.drawLogin());
            return;
        }
        var hash;
        if (target && typeof target == 'string') {
            console.log ('Target:'+target);
            hash = target;
        } else {
            hash = window.location.hash;
        }

        debug ('Hash: '+hash);
        if (hash == 'undefined' || !hash || hash == 'home') {
            if (!this.homePage) {
                this.homePage = new HomeView(this).render();
            }

            this.slidePage(this.homePage);
            return;
        }

        var match = hash.match(app.actionsURL);
        if (match) {
            var action = match[1];
            var param = match[2];
            debug ('app.route: action: '+action);
            debug ('app.route: param: '+param);

            this.slidePage(new BackendView(this).render());

        }
    }

    this.slidePage = function (page) {
        
        var currentPageDest,
        self = this;
        
        // If there is no current page (app just started) -> No transition: Position new page in the view port
        if (!this.currentPage) {
            $(page.el).attr('class', 'page stage-center');
            $('body').append(page.el);
            this.currentPage = page;
            if (page.postRender) {
                page.postRender();
            }
            return;
        }
       
        if (page === app.homePage) {
            // Always apply a Back transition (slide from left) when we go back to the search page
            $(page.el).attr('class', 'page stage-left');
            currentPageDest = "stage-right";

        } else {
            // Forward transition (slide from right)
            $(page.el).attr('class', 'page stage-right');
            currentPageDest = "stage-left";
        }
        
        $('body').append(page.el);
        page.postRender();
        
        // Wait until the new page has been added to the DOM...
        setTimeout(function() {
            // Slide out the current page: If new page slides from the right -> slide current page to the left, and vice versa
            $(self.currentPage.el).attr('class', 'page transition ' + currentPageDest);
            // Slide in the new page
            $(page.el).attr('class', 'page stage-center transition');
            self.currentPage = page;

            // Cleaning up: remove old pages that were moved out of the viewport
            $('.stage-right, .stage-left').not('#homePage').remove();
        });
    }


    this.onDeviceReady = function() {

        debug('deviceready event received');
        this.route();
    }
    

    this.initialize = function () {
        var self = this;

        debug('in app.initialize()');

        this.registerEvents();

        this.actionsURL = /^#(.*?)\/(.*?)$/;

        this.backend = new Backend ('alert-me', 'app.innovalue.ch', 'alertme', '/users/login', '/users/logout');

        if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
            debug('registering deviceready event listener');
            document.addEventListener('deviceready', $.proxy(this.onDeviceReady, this), false);
        } else {
            this.onDeviceReady();
        }
    }
}

var app = new App();
app.initialize();