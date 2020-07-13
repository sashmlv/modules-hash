import { ModuleError } from 'module-error';
import fs from 'fs';
import crypto from 'crypto';

/**
 * Get file hash
 * @param {string} filePath
 * @param {string} algorithm
 * @param {string} encoding
 * @return {string} Return hash
 **/
export async function fileHash( filePath, algorithm = 'md5', encoding = 'base64' ) {

   if( ! filePath || typeof filePath !== 'string' ){

      throw new ModuleError({

         message: `Parameter 'filePath' must to be string, provided: ${ typeof filePath }`,
         code: 'NOT_VALID_FILE_PATH',
      });
   }

   const hash = crypto.createHash( algorithm );

   return new Promise(( res, rej ) => fs.createReadStream( filePath )
      .on( 'data', data => hash.update( data ))
      .on( 'end', _=> res( hash.digest( encoding )))
      .on( 'error', e => rej( e )));
};
