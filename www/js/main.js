function update_div (in_id, in_url) {

    $.ajax({
            type: "GET",
                url: in_url,
                success: function (html) {$('#'+in_id).html(html);},
           });

}
