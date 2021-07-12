Mappy theme

Bundles js and css for Leaflet mapping, including:

- the Leaflet.Spin plugin (Makina Corpus 2012),
- the javascript Spin implementation (Felix Gnass 2018),
- leaflet markercluster extension (David Leaver, 2018),
- a bounding box handling overlay implementation derived from Leaflet.uGeoJson plugin
  (Benjamin VADANT, 2016) -- disabled currently as this and markercluster are incompatible
- along with main library dependencies.

All of these are bundled using rollup according to the rollup.config file and included
in mapping pages as described by mappy.libraries.yml.

Bundling How-to:
- install nodejs and npm
- locally install rollup using the package.json file
- rollup --config rollup.config
- see mappy.libraries.yml to see how all that gets included in web pages (note spin_glue.js).
