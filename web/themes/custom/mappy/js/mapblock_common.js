(function ($) {

    // Add basemap tiles and attribution. See leaflet-providers on github
    // for more base map options
    // var bUri = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
    let bUri1 = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';
    let base1 = L.tileLayer(bUri1, {
        attribution: 'Basemap - data: <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors; design: <a href="https://carto.com/attributions">&copy;CARTO</a>'
    });

    let bUri2 = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let base2 = L.tileLayer(bUri2, {
        attribution: 'Imagery <a href="http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer">&copy;Esri</a>'
        // &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    
    let map = null;
    let visitsLayer = null;
        
    let strokeOpacity = 0.75;
    let strokeColours = {
        'Housing': '#8b0028',
        'Road Design or Use': '#024e60',
        'Land Use': '#3c8900',
        'Other': '#c56200'
    };
    let hoveredColour = '#b10033';
    
    let visitsStyles = {
        opacity: strokeOpacity,
        weight: 3,
        color: '#8b0028', //'yellow',
        fillOpacity: 1.0,
        fillColor: '#ec5c85',
        radius: 6
    };
    let mapDivId = 'map';

    function createMap() {
        // Create map and set zoom (center below)
        map = L.map(mapDivId, {
            scrollWheelZoom: true,
            zoom: 12
        });

        map.spin(true, {
            color: "#016b83",
            lines: 20,
            length: 38,
            width: 12,
            animation: 'spinner-line-fade-more',
            speed: 0.75
        });

        map.on('load', function(e) {
            map.spin(false);
        });
        
        let bounds = L.latLngBounds(L.latLng(-89.9, -185), L.latLng(89.9, 185))
        map.setMaxBounds(bounds);
        map.on('drag', function() {
            map.panInsideBounds(bounds, { animate: false });
        });

        map.setMinZoom(1);

        // Add basemap to map - only one to avoid attribution concatenation.
        // map.addLayer(base1);
        map.attributionControl.setPrefix("");
        map.addLayer(base2);

        mGroup = L.markerClusterGroup({
            chunkedLoading: true,
            removeOutsideVisibleBounds: false
        });
        map.addLayer(mGroup);
    };

    function extendLeafletClasses() {
        /*
         * Extend leaflet polygon and polyline classes so they can
         * participate in clustering.
         * 
         * For each geometry type, 
         * 
         * 1) compute a polygon "center", use your favourite algorithm
         *    (centroid, etc.)
         * 2) provide getLatLng and setLatLng methods
         */
        L.Polygon.addInitHook(function() {
            this._latlng = this._bounds.getCenter();
        });
        
        L.Polygon.include({
            getLatLng: function() {
                return this._bounds.getCenter(); // this._latlng;
            },
            setLatLng: function() {} // Dummy method.
        });
        
        L.Polyline.addInitHook(function () {
            // @ts-ignore
            this._latlng = this._bounds.getCenter();
        });
        
        L.Polyline.include({
            getLatLng: function () {
                return this._bounds.getCenter();
            },
            setLatLng: function () {} // Dummy method.
        });
    };

    /*
     * custom popup and tooltip bindings
     */
    function customTip(feature, layer, e) {
        let pOpen = false
        if (typeof layer.eachLayer == 'function') {
            layer.eachLayer(function (l) {
                l.closeTooltip();
                if (l.isPopupOpen()) {
                    pOpen = true;
                };
            });
            if (!pOpen && null != e.layer) {
                e.layer.openTooltip();
            };
        } else {
            layer.closeTooltip();
            if (!layer.isPopupOpen()) {
                layer.openTooltip();
            };
        };
    };

    function customPop() {
        // this.unbindTooltip();
        if (typeof this.eachLayer == 'function') {
            this.eachLayer(function (l) {
                l.closeTooltip();
            });
        } else {
            this.closeTooltip();
        };
    };

    window.mapblock = {};
    window.mapblock.initMap = function(url, displayEmptyMap) {
        /*
         * Markercluster and geoJSON_BBOX do not work together:
         * - Leaflet markercluster implementation picks up POINT markers
         *   only from "child" layers, not groups.
         * - It creates an array of managed markers and clusters those.
         * - Groups are skipped to be handled without clustering.
         * - For a bounding box to be effective, it needs to be handled
         *   as a grouped layer to refetch geojson as the bounding box
         *   updates and would therefore also need to know which markers
         *   have moved into the clustering array.
         * 
         * Leaflet marker cluster also has other limitations:
         * - ignores non-point geometries (I think it could consider
         *   geometries by scale, but doesn't). These are also left
         *   out of clustering to be rendered alone.
         *
         * Leaflet markercluster has volume management built in to
         * chunk the rendering of large point collections without 
         * stopping the rendering browser from doing other things.
         * I don't think it does anything to assist with the data
         * transfer for the vector layer to be rendered. Essentially
         * you have to wait for an ajax call to complete and hand
         * over all the data to the markercluster implementation.
         */
        /* as above disable BBOX to use markercluster. */
        // visitsLayer = L.geoJSON_BBOX({
        //     endpoint: url + 'visits_geojson_feed',
        //     usebbox: true,
        //     enctype: 'plain',
        //     replace: true,
        //     debug: false,
        //     maxRequests: 3,
        //     after: function (data) {
        //         if (visitsLayer.options.debug) {
        //             console.debug('feature count: ' + data.features.length +
        //                           ' total: ' + visitsLayer.getLayers().length);
        //         };
        //     }
        // }, {
        /* explicity fetch the visits layer - create the layer */
        createMap();
        extendLeafletClasses();

	$.getJSON(url, function(data) {
            if (!displayEmptyMap && data.features.length == 0) {
                $('#' + mapDivId).empty().removeClass().text("No contributions yet.");
                return;
            };

            visitsLayer = L.geoJson(data, {
                style: function(feature) {
                    let s = $.extend({}, visitsStyles);
                    // for (const [key, value] of Object.entries(strokeColours)) {
                    //     if (feature.properties.field_evidence_types.indexOf(key) != -1) {
                    //         s.color = value;
                    s.fallbackColour = s.fillColor;
                    if (feature.geometry.type == 'LineString' ||
                        feature.geometry.type == 'MultiLineString') {
                        s.weight *= 3;
                    } else if (feature.geometry.type == 'Polygon' ||
                               feature.geometry.type == 'MultiPolygon') {
                        s.weight *= 3;
                    };
                    //     break;
                    // };
                    // };
                    return s;
                },
                pointToLayer: function (feature, latlng) {
                    marker = L.circleMarker(latlng, visitsStyles);
                    return marker;
                },
                onEachFeature: function(feature, layer) {
                    let popupText = '<div>' +
                        feature.properties.name + '<br/>' +
                        feature.properties.field_photos + '<br/>' +
                        feature.properties.field_audio + '</div>';
                    /* 
                     * multipoint, multipolygon and multilinestring have a layer 
                     * for each non-multi component. Attach the popup for each
                     * of those.
                     */
                    if (typeof layer.eachLayer == 'function') {
                        layer.eachLayer(function (l) {
                            l.bindPopup(popupText, {
                                minWidth: 225,
                                maxHeight: 200
                            });
                            l.bindTooltip(feature.properties.name, {
                                direction: "center",
                                sticky: true,
                                offset: L.point(0, 25),
                                opacity: 0.80
                            });
                        });
                    } else {
                        layer.bindPopup(popupText, {
                            minWidth: 225,
                            maxHeight: 200
                        });
                        layer.bindTooltip(feature.properties.name, {
                            direction: "center",
                            sticky: true,
                            offset: L.point(0, 25),
                            opacity: 0.80
                        });
                    };
                    // mouseover/mouseout fill highlighting for hover
                    layer.on('mouseover', function(e) {
                        this.setStyle({
                            fillColor: hoveredColour,
                            opacity: 1.0
                        });
                        customTip(feature, layer, e);
                    });
                    layer.on('mouseout', function(e) {
                        let t = e.target;
                        this.setStyle({
                            fillColor: t.options['fallbackColour'],
                            opacity: strokeOpacity
                        });
                    });
                    layer.on('click', customPop, layer);
                }
            });

            /* 
             * We have the data - now push it into the markercluster
             * group
             */
            mGroup.addLayer(visitsLayer);

            L.control.layers({
                'Carto Voyageur': base1,
                'ESRI Imagery': base2
            }, {
                'Visits': mGroup,
            }).addTo(map);
            L.control.scale({
                imperial: false,
                maxWidth: 115
            }).addTo(map);


            /* 
             * Now use markercluster and have the data by this point.
             * Zoom to bounding box extent of the visits group, adjusted to not
             * hide markers behind map controls
             */
            let layerBounds = visitsLayer.getBounds();
            if (layerBounds.isValid()) {
                map.fitBounds(layerBounds, { padding: L.point(40, 30) });
            } else {
                // center on Toronto - not ideal for students working in other areas
                // but probably reduces unnecessary scrolling overall.
                map.setView([46.5, -84.346944], 11);
            };
        }).fail(function(jqXHR, textStatus, errorThrown) {
	    if (jqXHR.status == 403) {
               $('#' + mapDivId).empty().removeClass().text("No access to another user's work.");
	       return;
	    };
            $('#' + mapDivId).empty().removeClass().text("Unknown error: " + status);
            return;
	});
    }
})(jQuery);
