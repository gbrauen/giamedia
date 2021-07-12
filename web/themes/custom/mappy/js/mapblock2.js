(function ($, DS) {
    function isInteger(value) {
        return /^\d+$/.test(value);
    };

    let url = window.location.protocol + '//' + window.location.host + DS.path.baseUrl;
    let pathname = window.location.pathname;
    let uid = pathname.substring(pathname.lastIndexOf("/") + 1);

    if (isInteger(uid)) { 
        window.mapblock.initMap(url + 'user/my-visits-geojson-feed/' + uid, false);
    } else {
        $('#block-mapblock2').empty().removeClass();
    };
})(jQuery, window.drupalSettings);
