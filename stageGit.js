/* eslint-env node */
'use strict';

const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const tar = require('tar-fs');
const stagingWorkflow = require('bin-minify').stagingWorkflow;

const {
    GIT_BIN_PATH,
    MIN_PACK_PATH,
    MIN_PACK_FILENAME,
} = require('./config');

const GIT_FILENAME = 'git-2.13.5.tar';

fse.ensureDirSync(GIT_BIN_PATH);

fs.createReadStream(path.join(__dirname, GIT_FILENAME))
    .pipe(tar.extract(GIT_BIN_PATH))
    .on('finish', () => {
        const options = {
            sendToTrash: false,
            dryRun: false,
            strict: false,
        };
        stagingWorkflow(GIT_BIN_PATH, options).then(minPack => {
            fse.ensureDirSync(MIN_PACK_PATH);
            fs.writeFile(
                path.join(MIN_PACK_PATH, MIN_PACK_FILENAME),
                JSON.stringify(minPack, null, ' '
                ), function(err) {
                    if(err) {
                        throw (err);
                    }
                    //console.log("The file content was saved: " + content);
                    return 0;
                });
        }, err => {
            console.error(`Could not create minPack: ${err}`); // eslint-disable-line no-console
            throw (err);
        });
    });
