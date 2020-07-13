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

const names = Object.keys( config );

names.forEach( key => {

   const add = config[ key ].compile && ( config[ key ].node || ! config[ key ].web );

   if( add ){

      entry[ key ] = `./src/${ key }.js`;
   };
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

      rules: [{

         test: /src\/index\.js$/,
         loader: 'imports-loader',
         options: {

            imports: Object.keys( config )
               .filter( key => config[ key ].compile )
               .map( name => `named ./${ name } ${ name }` ),
         },
      },{

         test: /src\/index\.js$/,
         loader: 'exports-loader',
         options: {

            exports: Object.keys( config )
               .filter( key => config[ key ].compile ),
         },
      },{

         /* remove imports and exports, will added with 'imports-loader' and 'exports-loader' */
         test: /\/src\/index\.js$/,
         loader: 'string-replace-loader',
         options: {

            search: /(import\s.+|export\s.+)/g,
            replace: ''
         },
      },],
   },
   plugins: [

      new CleanWebpackPlugin(),
      new Webpack.ProgressPlugin(),
   ],
};
