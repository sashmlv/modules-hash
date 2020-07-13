'use strict';

const test = require( 'ava' ),
   path = require( 'path' ),
   fs = require( 'fs' ),
   shell = require( 'shelljs' ),
   sinon = require( 'sinon' ),
   TMP = path.resolve( `${ __dirname }/tmp` ),
   crypto = require( 'crypto' ),
   { fileHash } = require( '../dist/node' );

/* same instance like in testing module, so we can spy it */
crypto.createHash = sinon.spy( crypto.createHash );
fs.createReadStream = sinon.spy( fs.createReadStream );

test.before( t => {

   shell.rm( '-rf', TMP );
   shell.mkdir( '-p', TMP );
});

test.beforeEach( t => {

   crypto.createHash.resetHistory();
   fs.createReadStream.resetHistory();
});

test.after( t => shell.rm( '-rf', TMP ));

test( `valid 'filePath' parameter`, async t => {

   let error = await t.throwsAsync( fileHash());

   t.deepEqual( error.code, 'NOT_VALID_FILE_PATH' );
   t.deepEqual( crypto.createHash.callCount, 0 );
   t.deepEqual( fs.createReadStream.callCount, 0 );

   error = await t.throwsAsync( fileHash( 1 ));

   t.deepEqual( error.code, 'NOT_VALID_FILE_PATH' );
   t.deepEqual( crypto.createHash.callCount, 0 );
   t.deepEqual( fs.createReadStream.callCount, 0 );
});

test( `not exists 'filePath'`, async t => {

   const filePath = `${ TMP }/not-exists`,
      error = await t.throwsAsync( fileHash( filePath ));

   t.deepEqual( error.code, 'ENOENT' );
   t.deepEqual( crypto.createHash.callCount, 1 );
   t.deepEqual( fs.createReadStream.callCount, 1 );
});

test( `hash file`, async t => {

   const filePath = `${ TMP }/file.txt`;

   shell.touch( filePath );
   shell.ShellString( 'file content' ).to( filePath );

   const hash = await fileHash( filePath );

   t.deepEqual( hash, '0QtMP/Ejsm3AaNQ6i+8tIw==' );
   t.deepEqual( crypto.createHash.callCount, 1 );
   t.deepEqual( fs.createReadStream.callCount, 1 );
});
