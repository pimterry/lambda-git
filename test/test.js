/* eslint-env mocha */
'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
chai.config.includeStack = true;

const fs = require('fs');
const path = require('path');
const tmp = require('tmp');
const LambdaGit = require('../index');

const BIN_PATH = 'git';
const EMPTY = '';

describe('lambda-git', () => {
    var targetDirectory;

    beforeEach((done) => {
        tmp.dir({ unsafeCleanup: true }, (err, tmpBasePath) => {
            if (err) console.error(`Could not create temp dir: ${err}`); // eslint-disable-line no-console
            else targetDirectory = path.join(tmpBasePath, BIN_PATH);
            done();
        });
    });

    it('Should install the Git binary to /tmp/git by default', () => {
        return LambdaGit().then(() => {
            return expect (fs.existsSync('/tmp/git/usr/bin/git')).to.be.true;
        });
    });

    it('Should install the Git binary to a given directory', () => {
        return LambdaGit({ targetDirectory }).then(() => {
            return expect (fs.existsSync(`${targetDirectory}/usr/bin/git`)).to.be.true;
        });
    });

    it('Should set the process env by default', () => {
        process.env.GIT_TEMPLATE_DIR = EMPTY;
        process.env.GIT_EXEC_PATH = EMPTY;
        return LambdaGit({ targetDirectory }).then(() => {
            return expect (process.env.PATH.indexOf(`${targetDirectory}/usr/bin`)).to.not.equal(-1) &&
            expect (process.env.GIT_TEMPLATE_DIR).to.equal(`${targetDirectory}/usr/share/git-core/templates`) &&
            expect (process.env.GIT_EXEC_PATH).to.equal(`${targetDirectory}/usr/libexec/git-core`);
        });
    });

    it('Should return a promise', () => {
        return expect(LambdaGit({ targetDirectory })).to.be.instanceof(Promise);
    });

    it('Should not change the env, if explicitly asked', () => {
        process.env.GIT_TEMPLATE_DIR = EMPTY;
        process.env.GIT_EXEC_PATH = EMPTY;
        return LambdaGit({ targetDirectory, updateEnv: false }).then(() => {
            return expect (process.env.GIT_TEMPLATE_DIR).to.equal(EMPTY) &&
            expect (process.env.GIT_EXEC_PATH).to.equal(EMPTY);
        });
    });

    it('Should return a promise, if not updating the env', () => {
        return expect(LambdaGit({ targetDirectory, updateEnv: false })).to.be.instanceof(Promise);
    });

    it('rejects promise if fs.existsSync() throws', () => {
        return expect(LambdaGit({ targetDirectory, updateEnv: false })).to.eventually.eql({
            binPath: `${targetDirectory}/usr/bin`,
            env: {
                GIT_EXEC_PATH: `${targetDirectory}/usr/libexec/git-core`,
                GIT_TEMPLATE_DIR: `${targetDirectory}/usr/share/git-core/templates`,
                LD_LIBRARY_PATH: `${targetDirectory}/usr/lib64`,
            },
        });
    });
});
