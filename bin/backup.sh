#!/bin/bash

# run this from project root. It looks for backups folder and writes output there.

STAMP=`date +"%Y%m%d%H%M%S"`
CURR=`pwd`
DEST_FILE_PATH="${CURR}/backups"

quit=false
if [ ! -d "${DEST_FILE_PATH}" ]; then
    echo "${DEST_FILE_PATH} does not exist"
    quit=true
fi

WEB_ROOT="./web"
if [ ! -d "${WEB_ROOT}" ]; then
    echo "${WEB_ROOT} does not exist"
    quit=true
fi

PRIV_FOLDER="./private"
if [ ! -d "${PRIV_FOLDER}" ]; then
    echo "${PRIV_FOLDER} does not exist"
    quit=true
fi

if [ $quit == true ]; then
    echo "Exiting ... no backups done. Fix problem reported above."
    echo "This should be run from the project root."
    exit 1
fi

PROJ_ROOT=$CURR

# site webroot files
ARCHIVE="${DEST_FILE_PATH}/${STAMP}_drupal_web_backup.tar.gz"
echo Creating file archive of ${WEB_ROOT} in ${ARCHIVE}
tar -zcf ${ARCHIVE} ${WEB_ROOT}

# site private files
ARCHIVE="${DEST_FILE_PATH}/${STAMP}_drupal_private_backup.tar.gz"
echo Creating file archive of ${PRIV_FOLDER} in ${ARCHIVE}
tar -zcf ${ARCHIVE} ${PRIV_FOLDER}

# dump the site database - note this needs absolute path to result file
ARCHIVE="${DEST_FILE_PATH}/${STAMP}_drupal_db_dump_sql"
echo Creating database dump in ${ARCHIVE}
drush sql:dump --gzip --result-file=${ARCHIVE}
