'use strict';

const Webpack = require( 'webpack' ),
   { CleanWebpackPlugin } = require( 'clean-webpack-plugin' ),
   path = require( 'path' ),
   DIST = path.resolve( `${ __dirname }/../dist/web` ),
   NODE_ENV = process.env.NODE_ENV || 'production',
   config = require( './config' );

/*
 * config for all modules
 */
const modulesConfig = {

   mode: NODE_ENV,
   target: 'web',
   optimization: {

      nodeEnv: false,
   },
   entry: {},
   output: {

      path: DIST,
      filename: '[name].js',
      libraryTarget: 'window',
      globalObject: 'this',
   },
};

const names = Object.keys( config )
   .filter( name => config[ name ].compile && (
      config[ name ].web || ! config[ name ].node
   ));

names.forEach( name => {

   modulesConfig.entry[ name ] = `./src/${ name }.js`;
});

const haveModules = Object.keys( modulesConfig.entry ).length;

/*
 * config only for main index file
 */
const indexConfig = {

   mode: NODE_ENV,
   target: 'web',
   optimization: {

      nodeEnv: false,
   },
   entry: {

      index: './src/index.js',
   },
   output: {

      path: DIST,
      filename: '[name].js',
      library:  'hash',
      libraryTarget: 'umd',
      globalObject: 'this',
   },
   module: {

      rules: [

         haveModules ? {

            test: /src\/index\.js$/,
            loader: 'imports-loader',
            options: {

               imports: names.map( name => `named ./${ name } ${ name }` ),
            },
         } : undefined,

         haveModules ? {

            test: /src\/index\.js$/,
            loader: 'exports-loader',
            options: {

               exports: names,
            },
         } : undefined,
         {

            /* remove imports and exports, will added with 'imports-loader' and 'exports-loader' */
            test: /\/src\/index\.js$/,
            loader: 'string-replace-loader',
            options: {

               search: /(import\s.+|export\s.+)/g,
               replace: ''
            },
         },
      ].filter( _=>_ ),
   },
};

module.exports = [

   haveModules ? modulesConfig : undefined,
   indexConfig,
].filter( _=>_ );