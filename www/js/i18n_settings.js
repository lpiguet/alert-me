jQuery.i18n.properties({
  name: 'Messages', 
  path: 'i18n/',
  mode: 'vars',
  callback: function(){ 
            // Elements that need to be translated in the page
            $('#am_app_name').text(am.app_name);
            console.log( am.i18n_ready ); 
  }
});
