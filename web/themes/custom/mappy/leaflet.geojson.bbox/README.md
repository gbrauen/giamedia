Leaflet GeoJSON BBOX 
=============================

## What is it?
A [Leaflet](http://leafletjs.com/) plugin to create a GeoJSON overlay that is loaded using a BBOX filter as a URL parameter. This was heavily rewritten from Adam VADANT's Leaflet-uGeoJSON layer plugin. See LICENSE for information about that project.

## How to use it?
The plugin creates a GeoJSON layer, adding bbox parameters to the GET request URL and updating this every time the map is moved or zoomed.

https://<url>?bbox=<left,<bottom>,<right>,<top>

This is the bbox format used by OpenLayers and, now, by the Views GeoJSON module of Drupal.

Here are the additional options you can specify as an argument of L.GeoJSON_BBOX:
* **endpoint**: Mandatory : the url of the server the plugin is going to reach for new data,
* **debug**: display debug log in the console or not. Default : false,
* **replace**: remove or not data after updating. Default : true,
* **minZoom**: if the layer zoom level is smaller than minZoom, the layer is cleared thus hiding any content.
* **after** : a function that is run after the data is rendered, taking the GeoJSON data object as parameter. Default : none,
* **afterFetch** : a function that called after the data is fetched, but not rendered yet. Used for accurate destroy previous rendered layers. Default : none,
* **transfomData**: a function to manipulate the response from server before rendering it.  
* **enctype** : urlencode or not the bbox parameters: plain || urlencoded. Default is plain.

Events:
* **refresh** : refresh layers event, can be fired ```javascript m.fireEvent("refresh");``` there m - leaflet map.

## How to use "afterFetch" option?
If you render a some custom layers via 'onEachFeature' or 'filter' GeoJSON options, you can mark layers with some option, im called its 'type'
and when reload data from server, it's need to destroy previously created layers.
For example, i add polylines with 'type':'traffic' option (via filter), and remove it by check this option is exists.

```javascript
var afterFetch= function() {
  map.eachLayer(function(lay){
    if(lay.hasOwnProperty("options") && lay.options.hasOwnProperty("type")){
      if(lay.options.type==="traffic"){
        lay.remove();
      }
    }
  });
};
```

## How to use "transformData" option?
This function receives the data from server and transform it before it is inserted in the threejs layer.

For example, if your server return something like this:

```json
[{"points":[{"x":41,"y":0},{"x":41,"y":-1},{"x":42,"y":-1},{"x":41,"y":0}]}]
```
You can convert it to `lineString` like that:

```javascript
transformData: function(data) {
  return data.map(function(lineString) {
    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: lineString.points.map(
          function(points) {
            return [points.y, points.x];
          }
        )
      },
      properties: {}
    };
  });
}
```

## How to fire refresh event
Refresh event can be fired for immediate reload geo data.
```javascript 
map.fireEvent("refresh");
```

## Dependencies
- Leaflet (developed against version 1.6.0)

## Remark
I'm not using the "movend" event as it triggers strange behavior : it can start an autocall loop! So I prefer to use dragend and zoomend.

## Thanks
I would like to thank Adam VADANT from whose work this started.
