(function ($, DS) {
    url = window.location.protocol + '//' + window.location.host + DS.path.baseUrl;
    window.mapblock.initMap(url + 'visits_geojson_feed', true)
})(jQuery, window.drupalSettings);
