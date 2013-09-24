function update_div (in_id, in_url) {
    //    alert ('Getting url:'+in_url);
    $('#'+in_id).html('<img src="img/loading.gif" alt="" />');
    $('#'+in_id).show();

    $.ajax({
            type: "GET",
                url: in_url,
                success: function (html) {$('#'+in_id).html(html);},
                error: function (jqXHR, textStatus, errorThrown) {alert (textStatus)},
           });

}
