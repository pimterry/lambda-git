let test = require('tape')
let exec = require('child_process').execSync
let fs = require('fs')
let exists = fs.existsSync
let lambdaGit = require('../')

let local = !process.env.CI

function mkTmp() {
  return fs.mkdtempSync('/tmp/lambda-git-')
}

function reset (callback) {
  if (local) exec('rm -rf /tmp/git')
  exec('rm -rf /tmp/lambda-git-*')
  let tmp = fs.readdirSync('/tmp')
  if (local) {
    let clean = tmp.every(f => f !== 'git')
    if (!clean) throw Error('/tmp/git is not clean')
  }
  let clean = tmp.every(f => !f.startsWith('lambda-git'))
  if (!clean) throw Error('/tmp/lambda-git-* is not clean')
  callback()
}

test('Env check', t => {
  t.plan(1)
  t.ok(lambdaGit, 'Module present')
})

test('Lib returns a Promise', t => {
  reset(async () => {
    t.plan(1)
    let isPromise = lambdaGit() instanceof Promise
    setTimeout(() => {
      // "await" while file ops finish before proceeding
      t.ok(isPromise, 'Promise returned')
    }, 500)
  })
})

// GitHub Actions can't work in `/tmp/git` so this will have to remain a local test only
if (local) {
  test('Install the git binary to /tmp/git by default (async)', t => {
    reset(async () => {
      t.plan(1)
      await lambdaGit()
      t.ok(exists('/tmp/git/usr/bin/git'), 'Git binary exists on the filesystem')
    })
  })

  test('Install the git binary to /tmp/git by default (continuation passing)', t => {
    reset(() => {
      t.plan(1)
      lambdaGit({}, () => {
        t.ok(exists('/tmp/git/usr/bin/git'), 'Git binary exists on the filesystem')
      })
    })
  })
}

test('Install the git binary to a given dir and set env vars (async)', t => {
  reset(async () => {
    t.plan(4)
    let targetDirectory = mkTmp()
    console.log(`Installing to target: ${targetDirectory}`)
    await lambdaGit({targetDirectory})

    t.ok(exists(`${targetDirectory}/usr/bin/git`), 'Git binary exists on the filesystem')

    let pathEnvAdded = process.env.PATH.includes(`${targetDirectory}/usr/bin`)
    t.ok(pathEnvAdded, `Env $PATH includes git path: ${process.env.PATH}`)

    // Ok instead of equal because it's getting a bit unreadable
    let templateEnvAdded = process.env.GIT_TEMPLATE_DIR === `${targetDirectory}/usr/share/git-core/templates`
    t.ok(templateEnvAdded, `Env includes git template dir: ${process.env.GIT_TEMPLATE_DIR}`)

    let execEnvAdded = process.env.GIT_EXEC_PATH === `${targetDirectory}/usr/libexec/git-core`
    t.ok(execEnvAdded, `Env includes git exec path: ${process.env.GIT_EXEC_PATH}`)
  })
})

test('Install the git binary to a given dir and set env vars (continuation passing)', t => {
  reset(() => {
    t.plan(4)
    let targetDirectory = mkTmp()
    console.log(`Installing to target: ${targetDirectory}`)
    lambdaGit({targetDirectory}, () => {
      t.ok(exists(`${targetDirectory}/usr/bin/git`), 'Git binary exists on the filesystem')

      let pathEnvAdded = process.env.PATH.includes(`${targetDirectory}/usr/bin`)
      t.ok(pathEnvAdded, `Env $PATH includes git path: ${process.env.PATH}`)

      // Ok instead of equal because it's getting a bit unreadable
      let templateEnvAdded = process.env.GIT_TEMPLATE_DIR === `${targetDirectory}/usr/share/git-core/templates`
      t.ok(templateEnvAdded, `Env includes git template dir: ${process.env.GIT_TEMPLATE_DIR}`)

      let execEnvAdded = process.env.GIT_EXEC_PATH === `${targetDirectory}/usr/libexec/git-core`
      t.ok(execEnvAdded, `Env includes git exec path: ${process.env.GIT_EXEC_PATH}`)
    })
  })
})

test('Disable env mutation (async)', t => {
  reset(async () => {
    t.plan(3)
    let targetDirectory = mkTmp()
    console.log(`Installing to target: ${targetDirectory}`)
    await lambdaGit({targetDirectory, updateEnv: false})

    let pathEnvAdded = process.env.PATH.includes(`${targetDirectory}/usr/bin`)
    t.notOk(pathEnvAdded, `Env $PATH does not include git path: ${process.env.PATH}`)

    let templateEnvAdded = process.env.GIT_TEMPLATE_DIR === `${targetDirectory}/usr/share/git-core/templates`
    t.notOk(templateEnvAdded, `Env does not include git template dir: ${process.env.GIT_TEMPLATE_DIR}`)

    let execEnvAdded = process.env.GIT_EXEC_PATH === `${targetDirectory}/usr/libexec/git-core`
    t.notOk(execEnvAdded, `Env does not include git exec path: ${process.env.GIT_EXEC_PATH}`)
  })
})

test('Disable env mutation (continuation passing)', t => {
  reset(() => {
    t.plan(3)
    let targetDirectory = mkTmp()
    console.log(`Installing to target: ${targetDirectory}`)
    lambdaGit({targetDirectory, updateEnv: false}, () => {
      let pathEnvAdded = process.env.PATH.includes(`${targetDirectory}/usr/bin`)
      t.notOk(pathEnvAdded, `Env $PATH does not include git path: ${process.env.PATH}`)

      let templateEnvAdded = process.env.GIT_TEMPLATE_DIR === `${targetDirectory}/usr/share/git-core/templates`
      t.notOk(templateEnvAdded, `Env does not include git template dir: ${process.env.GIT_TEMPLATE_DIR}`)

      let execEnvAdded = process.env.GIT_EXEC_PATH === `${targetDirectory}/usr/libexec/git-core`
      t.notOk(execEnvAdded, `Env does not include git exec path: ${process.env.GIT_EXEC_PATH}`)
    })
  })
})

test('Promise returns env vars when env mutation is disabled (async)', t => {
  reset(async () => {
    t.plan(4)
    let targetDirectory = mkTmp()
    console.log(`Installing to target: ${targetDirectory}`)
    let git = await lambdaGit({targetDirectory, updateEnv: false})

    t.equal(git.binPath, `${targetDirectory}/usr/bin`, `Returned binPath: ${git.binPath}`)
    t.equal(git.env.GIT_TEMPLATE_DIR, `${targetDirectory}/usr/share/git-core/templates`, `Returned env.GIT_TEMPLATE_DIR: ${git.env.GIT_TEMPLATE_DIR}`)
    t.equal(git.env.GIT_EXEC_PATH, `${targetDirectory}/usr/libexec/git-core`, `Returned env.GIT_EXEC_PATH: ${git.env.GIT_EXEC_PATH}`)
    t.equal(git.env.LD_LIBRARY_PATH, `${targetDirectory}/usr/lib64`, `Returned env.LD_LIBRARY_PATH: ${git.env.LD_LIBRARY_PATH}`)
  })
})

test('Promise returns env vars when env mutation is disabled (continuation passing)', t => {
  reset(() => {
    t.plan(4)
    let targetDirectory = mkTmp()
    console.log(`Installing to target: ${targetDirectory}`)
    lambdaGit({targetDirectory, updateEnv: false}, (err, result) => {
      if (err) t.fail(err)
      t.equal(result.binPath, `${targetDirectory}/usr/bin`, `Returned binPath: ${result.binPath}`)
      t.equal(result.env.GIT_TEMPLATE_DIR, `${targetDirectory}/usr/share/git-core/templates`, `Returned env.GIT_TEMPLATE_DIR: ${result.env.GIT_TEMPLATE_DIR}`)
      t.equal(result.env.GIT_EXEC_PATH, `${targetDirectory}/usr/libexec/git-core`, `Returned env.GIT_EXEC_PATH: ${result.env.GIT_EXEC_PATH}`)
      t.equal(result.env.LD_LIBRARY_PATH, `${targetDirectory}/usr/lib64`, `Returned env.LD_LIBRARY_PATH: ${result.env.LD_LIBRARY_PATH}`)
    })
  })
})

test('Error handling (async)', t => {
  reset(async () => {
    t.plan(1)
    let cwd = process.cwd()
    exec('mv git-2.4.3.tar tmp.tar', {cwd})
    try {
      await lambdaGit()
    }
    catch(err) {
      t.pass(`Got an error back ${err}`)
    }
  })
})

test('Error handling (continuation passing)', t => {
  reset(() => {
    t.plan(1)
    let cwd = process.cwd()
    lambdaGit({}, err => {
      t.ok(err, `Got an error back ${err}`)
    })
    exec('mv tmp.tar git-2.4.3.tar', {cwd})
  })
})

test('Clean up', t => {
  setTimeout(() => {
    // "await" while file ops finish before wrapping up
    reset(t.end)
  }, 500)
})
