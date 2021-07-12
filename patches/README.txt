This folder may contain patches that need to be applied to make things work properly. I normally would not want this but sometimes it takes a while to get a required fix into a committed version of contrib modules or other elements. If these are essential for a feature of the site, I add a patch here and update this file to show which module and version of the component the patch applies to. See below.

The intention here is that a production site run released modules, using composer to 'install' those, and that these patches when required are applied to the component after composer install. On a production site, this allows a drupal/module to be run with composer install and a simple patch application.


views_geojson       8.x-1.x          bounding_box_for_polygons_and_polylines-3158153-4.patch
video               8.x-1.5-alpha1+  html5_wrong_url-3103319-4.patch
js_confirm_pop_up   8.x-1.x          image_field_confirmation-3056275-2.patch
js_confirm_pop_up   8.x-1.x          js_confirm_pop_up_1_3_automated_D9_fix_3140864.patch


Note that the patch file name should contain the Drupal issue number. You can check that if needed to see whether or not this patch file still needs to be applied to the component version you are running.
