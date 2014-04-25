
    debug = function (msg) {
        if (msg && msg != 'undefined') {
            console.log (msg);
        }
    }

    pr_date = function (ts) {
        var d;
        if (ts == 0) {
            d = new Date();
        } else {
            d = new Date(parseInt(ts, 10));
        }

        var cult = Zepto.i18n.browserLang(); // grab current culture from browser information
//        debug (cult);
        Globalize.culture(cult);
        return Globalize.format(d, 'd') + ' ' + Globalize.format(d, 't');
    }


    openURL = function (url) {
        //    var ref = window.open (url, '_system');
        //    var ref = window.open (url, '_system', 'location=no');
        window.open (url, '_system');
    }

