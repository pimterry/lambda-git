/* eslint-env node */
'use strict';

const path = require('path');
const RuntimeBin = require('lambda-bin');
const {
    GIT_BIN_PATH,
    MIN_PACK_PATH,
    MIN_PACK_FILENAME,
} = require('./config');
const MIN_PACK = require(path.resolve(MIN_PACK_PATH, MIN_PACK_FILENAME));

/**
 * Add symlinks to git binaries and updates this process's PATH to include
 * them, so you can child_process.exec('git') successfully.
 *
 * Git bundle (./bin/git) is linked from the target directory. This defaults to
 * /tmp/git, but can be set with the `targetDirectory` option.
 *
 * The current process's path is prefixed with the binary folder, and other
 * required env vars for Git are set. If you set `updateEnv` to false in
 * your options then no changes will be made and an object will be returned
 * instead including `binPath` (the path to the binaries folder) and `env`,
 * a set of required environmental variables.
 */
module.exports = function installGit(options) {
    return new Promise((resolve, reject) => {
        options = options || {};

        var targetDirectory = options.targetDirectory || '/tmp/git';
        var updateEnv = (options.updateEnv !== undefined) ? options.updateEnv : true;

        var GIT_TEMPLATE_DIR = path.join(targetDirectory, 'usr/share/git-core/templates');
        var GIT_EXEC_PATH = path.join(targetDirectory, 'usr/libexec/git-core');
        var LD_LIBRARY_PATH = path.join(targetDirectory, 'usr/lib64');
        var binPath = path.join(targetDirectory, 'usr/bin');

        var lambdaBinRuntime = new RuntimeBin({
            useSymlinks: true,
            targetPath: GIT_BIN_PATH,
            minPack: MIN_PACK,
        });
        lambdaBinRuntime.applyMinPack(targetDirectory).then(() => {
            if (updateEnv) {
                process.env.PATH = process.env.PATH + ':' + binPath;
                process.env.GIT_TEMPLATE_DIR = GIT_TEMPLATE_DIR;
                process.env.GIT_EXEC_PATH = GIT_EXEC_PATH;
                process.env.LD_LIBRARY_PATH = process.env.LD_LIBRARY_PATH
                    ? process.env.LD_LIBRARY_PATH + ':' + LD_LIBRARY_PATH
                    : LD_LIBRARY_PATH;
                resolve();
            } else {
                resolve({
                    binPath: binPath,
                    env: {
                        GIT_TEMPLATE_DIR: GIT_TEMPLATE_DIR,
                        GIT_EXEC_PATH: GIT_EXEC_PATH,
                        LD_LIBRARY_PATH: LD_LIBRARY_PATH
                    }
                });
            }
        }, error => {
            reject(new Error(`lambda-git failed to load: ${error}`));
        });

    });
};
