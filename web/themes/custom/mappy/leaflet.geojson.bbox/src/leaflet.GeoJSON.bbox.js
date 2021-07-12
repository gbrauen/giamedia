L.GeoJSON_BBOX = L.GeoJSON.extend({
    /**
     * Extended leaflet GeoJSON layer, based on Leaflet.uGeoJSONLayer plugin
     * by Adam VADANT (2016) - see LICENSE file. This is significantly
     * modified and may not be appropriate as a pull request for that extension.
     * - no longer uses POST to fetch data (GET with parms on URL). This may
     *   prevent use of authenticated only GeoJSON layers. I doubt that is a
     *   big shortcoming.
     * - zoom not added as parm request. Why would a server of a GeoJSON layer
     *   need that?
     * - other parameters handling removed to prevent Drupal filter from having
     *   to select out just the bounding box keyword and arguments.
     * - encoding options simplified - just need parms on URL
     * - polling support removed - event based layer updates are all that is
     *   needed.
     * - remove maxRequests and associated request queue handling and replaced it
     *   with current delayed request queue handling to protect server from
     *   multiple, quick update requests. Try to process just the last
     *   outstanding request.
     */
    options: {
        debug: false,
        replace: false,
        endpoint: -1,
        minzoom: 0,
        enctype: 'plain', // urlencoded || plain
        transformData: function (data) { return data; },
        afterFetch: function () { },
        after: function (data) { }
    },

    _requestQueue: null,

    callback: function (data) {
        if (this.options.replace) {
            this.clearLayers();//if needed, we clean the layers
        }

        //Then we add the new data
        this.addData(data);
        this.options.after(data);
    },

    initialize: function (extOptions, options) {
        L.GeoJSON.prototype.initialize.call(this, undefined, options);
        L.Util.setOptions(this, extOptions);

        this._requestQueue = [];
        this._disabled = false;
    },

    onMoveEnd: function () {
        var _that = this;

        if (this._disabled) {
            return;
        };

        // check zoom but don't include it with the get request - for vector data,
        // service doesn't need to know.
        var zoom = this._map.getZoom();
        if (zoom < this.options.minzoom) {
            if (this.options.debug) {
                console.debug('ignoring zoomlevel ' + zoom +
                              ' (< ' + this.options.minzoom + ')');
            }
            this.clearLayers();
            return;
        };

        /**
         * Moveend events tend to come in batches. Protect the server by
         * waiting for user movements to settle before issuing a data fetch
         * based on the bounding box.
         **/
        var new_request = {
            bbox: this._map.getBounds().toBBoxString(),
            sent: false
        };
        this._requestQueue.push(new_request);

        var doSend = function(newreq) {
            window.setTimeout(function() {
                if (!_isLastRequest(_that._requestQueue, newreq.bbox)) {
                    return
                };

                if (_that.options.debug) {
                    console.debug('load Data -- bbox parm: ' + newreq.bbox +
                                  ' queue length: ' + _that._requestQueue.length);
                };

                var getParms = {};
                getParms.bbox = newreq.bbox;
                var parmsString = _pack_parms(getParms, _that.options.enctype);

                newreq.request = new XMLHttpRequest();
                newreq.request.open('GET',
                                    _that.options.endpoint + parmsString,
                                    true);

                newreq.request.onload = function () {
                    _removeCompletedRequest(_that._requestQueue, newreq.request);

                    if (this.status >= 200 && this.status < 400) {
                        var data = JSON.parse(this.responseText);

                        if (_that.options.transformData) {
                            data = _that.options.transformData(data);
                        };

                        _that.options.afterFetch();
                        _that.callback(data);
                    };
                };

                newreq.request.send();
                newreq.sent = true;
            }, 400);
        };
        doSend(new_request);

        function _pack_parms(getParms, enctype) {
            var urlencoded = '';
            for (var p in getParms) {
                if (getParms.hasOwnProperty(p)) {
                    if (urlencoded.length > 0) {
                        urlencoded += '&';
                    }
                    else {
                        urlencoded = '?';
                    };

                    if (enctype == 'urlencoded') {
                        urlencoded += encodeURIComponent(p) + '=' +
                            encodeURIComponent(getParms[p]);
                    }
                    else {
                        urlencoded += p + "=" + getParms[p]
                    };
                };
            };
            return (urlencoded);
        };

        function _isLastRequest(q, bbox) {
            if (q.length <= 0) {
                // no queued requests - exit
                return false;
            };
            if (q[q.length - 1].bbox == bbox) {
                // last entry is one being checked.
                // send it and remove earlier unsent
                var i = q.length - 1; // last is current to be sent
                while (i--) {
                    if (!q[i].sent) {
                        q.splice(i, 1);
                    };
                };
                return true;
            }
            return false;
        };

        function _removeCompletedRequest(q, req) {
            for (var i in q) {
                if (q[i].request === req) {
                    q.splice(i, 1);
                    break;
                };
            };
        };
    },

    onAdd: function (map) {
        this._map = map;

        if (typeof this.options.endpoint !== 'undefined' &&
            this.options.endpoint !== -1) {
            this.onMoveEnd();

            map.on('dragend', this.onMoveEnd, this);
            map.on('zoomend', this.onMoveEnd, this);
            map.on('refresh', this.onMoveEnd, this);
        };

        if (this.options.debug) {
            console.debug('add layer');
        };

        this._disabled = false;
    },

    onRemove: function (map) {
        if (this.options.debug) {
            console.debug('remove layer');
        };
        L.LayerGroup.prototype.onRemove.call(this, map);

        while (this._requestQueue.length > 0) {
            if (this._requestQueue[0].sent) {
                this._requestQueue[0].request.abort();
            };
            this._requestQueue.shift();
        };

        map.off({
            'dragend': this.onMoveEnd
        }, this);
        map.off({
            'zoomend': this.onMoveEnd
        }, this);
        map.off({
            'refresh': this.onMoveEnd
        }, this);

        this._map = null;
        this._disabled = false;
    }
});

L.geoJSON_BBOX = function (uOptions, options) {
    return new L.GeoJSON_BBOX(uOptions, options);
};
