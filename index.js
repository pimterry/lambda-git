var path = require('path');
var tar = require('tar-fs')
var fs = require('fs')

/**
 * Installs git binaries and updates this process's PATH to include
 * them, so you can child_process.exec('git') successfully.
 *
 * Git bundle is extracted to the the target directory. This defaults to
 * /tmp/git, but can be set with the `targetDirectory` option.
 *
 * The current process's path is prefixed with the binary folder, and other
 * required env vars for Git are set. If you set `updateEnv` to false in
 * your options then no changes will be made an object will be returned
 * instead including `binPath` (the path to the binaries folder) and `env`,
 * a set of required environmental variables.
 */
module.exports = function installGit(options) {
    return new Promise((resolve) => {
        options = options || {};

        var targetDirectory = options.targetDirectory || "/tmp/git";
        var updateEnv = (options.updateEnv !== undefined) ? options.updateEnv : true;

        var reader = fs.createReadStream(path.join(__dirname, "git-2.4.3.tar"));
        reader.pipe(tar.extract(targetDirectory));
        reader.on('end', done);

        var GIT_TEMPLATE_DIR = path.join(targetDirectory, 'usr/share/git-core/templates');
        var GIT_EXEC_PATH = path.join(targetDirectory, 'usr/libexec/git-core');
        var binPath = path.join(targetDirectory, 'usr/bin');

        function done() {
            if (updateEnv) {
                process.env.PATH = process.env.PATH + ":" + binPath;
                process.env.GIT_TEMPLATE_DIR = GIT_TEMPLATE_DIR;
                process.env.GIT_EXEC_PATH = GIT_EXEC_PATH;
                resolve();
            } else {
                resolve({
                    binPath: binPath,
                    env: {
                        GIT_TEMPLATE_DIR: GIT_TEMPLATE_DIR,
                        GIT_EXEC_PATH: GIT_EXEC_PATH
                    }
                });
            }
        }
    });
}