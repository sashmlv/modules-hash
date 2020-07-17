'use strict';

const test = require( 'ava' ),
   puppeteer = require( 'puppeteer' ),
   sinon = require( 'sinon' ),
   crypto = require( 'crypto' ),
   Server = require( 'server' ),
   stringHash = require( '../dist/node/stringHash' ),
   server = new Server({
      main: {

         content: 'this text will be replaced by html content',
      },
      root: 'dist/web',
      frontendHost: 'localhost',
      frontendPort: 3000,
      log: false,
   });

let browser, page;

crypto.createHash = sinon.spy( crypto.createHash );

test.before( async t => {

   browser = await puppeteer.launch(),
   page = await browser.newPage();
   page.on( 'console', msg => console.log( msg.text()));
   page.on( 'pageerror', err => console.log( err ));
   server.listen();
});

test.after( async t => {

   await browser.close();
   server.close();
});

test.beforeEach( t => {

   crypto.createHash.resetHistory();
});

const str = 'test string';

let webHash, nodeHash;

test( `node: valid 'str' parameter`, async t => {

   let error = await t.throwsAsync( stringHash());

   t.deepEqual( error.code, 'NOT_VALID_STR' );
   t.deepEqual( crypto.createHash.callCount, 0 );

   error = await t.throwsAsync( stringHash( 1 ));

   t.deepEqual( error.code, 'NOT_VALID_STR' );
   t.deepEqual( crypto.createHash.callCount, 0 );
});

test( `node: hash string`, async t => {

   webHash = await stringHash( str );

   t.truthy( webHash );
   t.deepEqual( crypto.createHash.callCount, 1 );
});

test( `web: valid 'str' parameter`, async t => {

   const content = `
<!DOCTYPE html>
<html>
   <head>
   </head>
   <body>
      <script type = 'module'>
         import stringHash from './stringHash.js';
         (async _=> {

            window.errors = {};

            try {

               await stringHash();
            }
            catch( err ) {

               window.errors.error1 = err;
            };

            try {

               await stringHash( 1 );
            }
            catch( err ) {

               window.errors.error2 = err;
            };
         })();
      </script>
   </body>
</html>`;

   await page.goto( 'http://localhost:3000' );
   await page.setContent( content );

   const errors = await page.evaluate( _=> window.errors );

   t.deepEqual( errors.error1.code, 'NOT_VALID_STR' );
   t.deepEqual( errors.error2.code, 'NOT_VALID_STR' );
});

test( `web: hash string`, async t => {

   const content = `
<!DOCTYPE html>
<html>
   <head>
   </head>
   <body>
      <script type = 'module'>
         import stringHash from './stringHash.js';
         (async _=> window.test = await stringHash('${ str }'))();
      </script>
   </body>
</html>`;

   await page.goto( 'http://localhost:3000' );
   await page.setContent( content );

   nodeHash = await page.evaluate( _=> window.test );

   t.truthy( nodeHash );
   t.deepEqual( webHash, nodeHash );
});
