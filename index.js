let {join} = require('path')
let tar = require('tar-fs')
let read = require('fs').createReadStream

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
module.exports = function installGit(options={}, callback) {
  let {
    targetDirectory='/tmp/git',
    updateEnv=true
  } = options

  let promise
  if (!callback) {
    promise = new Promise((resolve, reject) => {
      callback = (err, result) => {
        err ? reject(err) : resolve(result)
      }
    })
  }

  let reader = read(join(__dirname, 'git-2.4.3.tar'))
  reader.pipe(tar.extract(targetDirectory, {finish: done}))
  reader.on('error', err => callback(err))

  let GIT_TEMPLATE_DIR = join(targetDirectory, 'usr/share/git-core/templates')
  let GIT_EXEC_PATH =    join(targetDirectory, 'usr/libexec/git-core')
  let LD_LIBRARY_PATH =  join(targetDirectory, 'usr/lib64')
  let binPath =          join(targetDirectory, 'usr/bin')

  function done() {
    if (updateEnv) {
      process.env.PATH = process.env.PATH + ":" + binPath
      process.env.GIT_TEMPLATE_DIR = GIT_TEMPLATE_DIR
      process.env.GIT_EXEC_PATH = GIT_EXEC_PATH
      process.env.LD_LIBRARY_PATH = process.env.LD_LIBRARY_PATH
        ? process.env.LD_LIBRARY_PATH + ":" + LD_LIBRARY_PATH
        : LD_LIBRARY_PATH
      callback()
    } else {
      callback(null, {
        binPath: binPath,
        env: {
          GIT_TEMPLATE_DIR: GIT_TEMPLATE_DIR,
          GIT_EXEC_PATH: GIT_EXEC_PATH,
          LD_LIBRARY_PATH: LD_LIBRARY_PATH
        }
      })
    }
  }

  return promise
}
