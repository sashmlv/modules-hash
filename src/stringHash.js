import { ModuleError } from 'module-error';

const node = typeof window === 'undefined' && typeof process !== 'undefined',
   web = typeof window !== 'undefined' && typeof process === 'undefined';

/**
 * Get string hash
 * TODO: algorithm in node and browser are different
 * @param {string} str
 * @param {string} algorithm
 * @param {string} encoding
 * @return {string} Return hash
 **/
async function stringHash( str, algorithm, encoding ) {

   if( ! str || typeof str !== 'string' ){

      throw new ModuleError({

         message: `Parameter 'str' must to be string, provided: ${ typeof str }`,
         code: 'NOT_VALID_STR',
      });
   }

   let hash;

   if( node ){

      hash = await stringHashNode( str, algorithm, encoding );
   }
   else if( web ){

      hash = await stringHashWeb( str, algorithm, encoding );
   }
   else {

      throw new ModuleError({

         message: `Can't work on this platform, please run in Browser or NodeJs`,
         code: 'NOT_SUPPORTED_PLATFORM',
      });
   };

   return hash;
};

export {

   stringHash as default,
   stringHash,
};

/**
 * Hash string in node
 * @param {string} str
 * @param {string} algorithm
 * @param {string} encoding
 * @return {string} Return hash
 **/
async function stringHashNode( str, algorithm = 'sha1', encoding = 'base64' ) {

   const crypto = await import( 'crypto' ),
      hash = crypto.createHash( algorithm );

   hash.update( str );

   return hash.digest( encoding );
};

/**
 * Hash string in browser
 * https://stackoverflow.com/a/38858004
 * @param {string} str
 * @param {string} algorithm
 * @param {string} encoding
 * @return {string} Return hash
 **/
async function stringHashWeb( str, algorithm = 'SHA-1', encoding = 'base64' ) {

   const uint8array = new TextEncoder().encode( str ),
      buffer = await crypto.subtle.digest( algorithm, uint8array );

   return arrayBufferToBase64( buffer );
};

/**
 * ArrayBuffer to Base64 string
 * https://stackoverflow.com/a/38858004
 * @param {object} buffer
 * @return {string} Return string
 **/
function arrayBufferToBase64( buffer ){

   const bytes = new Uint8Array( buffer ),
      len = bytes.byteLength;

   let binary = '';

   for( let i = 0; i < len; i++ ){

      binary += String.fromCharCode( bytes[ i ]);
   };

   return window.btoa( binary );
};

/**
 * Base64 string to ArrayBuffer
 * https://stackoverflow.com/a/38858004
 * @param {string} base64
 * @return {object} Return ArrayBuffer
 **/
function base64ToArrayBuffer( base64 ){

   const binaryString = window.atob( base64 ),
      len = binaryString.length,
      bytes = new Uint8Array( len );

   for( let i = 0; i < len; i++ ){

      bytes[ i ] = binaryString.charCodeAt( i );
   };

   return bytes.buffer;
};
