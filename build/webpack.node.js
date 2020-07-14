'use strict';

const Webpack = require( 'webpack' ),
   { CleanWebpackPlugin } = require( 'clean-webpack-plugin' ),
   nodeExternals = require( 'webpack-node-externals' ),
   path = require( 'path' ),
   DIST = path.resolve( `${ __dirname }/../dist/node` ),
   NODE_ENV = process.env.NODE_ENV || 'production',
   config = require( './config' );

const entry = {

   index: './src/index.js',
};

const names = Object.keys( config )
   .filter( name => config[ name ].compile && (
      config[ name ].node || ! config[ name ].web
   ));

names.forEach( name => {

   entry[ name ] = `./src/${ name }.js`;
});

module.exports = {

   mode: NODE_ENV,
   target: 'node',
   optimization: {

      nodeEnv: false,
   },
   entry,
   externals: [

      nodeExternals()
   ],
   output: {

      path: DIST,
      filename: '[name].js',
      library: 'hash',
      libraryTarget: 'umd',
      globalObject: 'this',
   },
   module: {

      rules: [
         {

            test: /src\/index\.js$/,
            loader: 'imports-loader',
            options: {

               imports: names.map( name => `named ./${ name } ${ name }` ),
            },
         },
         {

            test: /src\/index\.js$/,
            loader: 'exports-loader',
            options: {

               exports: names,
            },
         },
         {

            /* remove imports and exports, will added with 'imports-loader' and 'exports-loader' */
            test: /\/src\/index\.js$/,
            loader: 'string-replace-loader',
            options: {

               search: /(import\s.+|export\s.+)/g,
               replace: ''
            },
         },
      ],
   },
   plugins: [ new CleanWebpackPlugin(),],
};
