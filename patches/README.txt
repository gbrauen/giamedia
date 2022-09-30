This folder may contain patches that need to be applied to make things work properly. I normally would not want this but sometimes it takes a while to get a required fix into a committed version of contrib modules or other elements. If these are essential for a feature of the site, I add a patch here and update this file to show which module and version of the component the patch applies to. See below.

The intention here is that a production site run released modules, using composer to 'install' those, and that these patches when required are applied to the component after "composer install --no-dev". On a production site, this allows a drupal/module to be run with composer install and a simple patch application.

views_geojson       8.x-1.x          bounding_box_for_polygons_and_polylines-3158153-4.patch
video               8.x-1.5-alpha1+  html5_wrong_url-3103319-4.patch


Note that the patch file name should contain the Drupal issue number. You can check that if needed to see whether or not this patch file still needs to be applied to the component version you are running. As of the "last checked" date below, the listed patch files may still be needed for the modules identified (first name on the line and the version of the module that seems to still be current).

Patch explanation:

- If using videos as one type of uploaded media, as the GIAMedia demo site does, then patch the video module. Otherwise it will install and seem to work, allowing video file uploads, but uploaded videos will not display properly.
- If using locations for the system map that contain polylines or polygons, then you may need to apply the patch for views_geojson as well. This allows the views software that generates the GeoJSON for the geometry layer to properly filter layer features using a bounding box that matches the map viewport. Without this fix, some features that should be on the map may be erroneously excluded from the map.

Last checked: Sept 2022
