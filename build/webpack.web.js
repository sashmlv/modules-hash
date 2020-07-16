'use strict';

const Webpack = require( 'webpack' ),
   { CleanWebpackPlugin } = require( 'clean-webpack-plugin' ),
   EsmWebpackPlugin = require( '@purtuga/esm-webpack-plugin' ),
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

      /* 1 variant with global vars */
      // libraryTarget: 'window',
      // globalObject: 'this',

      /* 2 variant with esm */
      library: 'does_not_matter',
      // libraryTarget: 'var',
   },
   plugins: [

      new CleanWebpackPlugin(),
      new EsmWebpackPlugin(),
      new Webpack.DefinePlugin({

         window: 'window',
         process: 'process',
         crypto: 'crypto',
      }),
      new Webpack.IgnorePlugin({

         resourceRegExp: /^crypto$/,
      }),
   ]
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

      /* 1 variant with global vars */
      // library:  'hash',
      // libraryTarget: 'umd',
      // globalObject: 'this',

      /* 2 variant with esm */
      library: 'does_not_matter',
      // libraryTarget: 'var',
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
   plugins: [

      new EsmWebpackPlugin(),
      new Webpack.DefinePlugin({

         window: 'window',
         process: 'process',
         crypto: 'crypto',
      }),
      new Webpack.IgnorePlugin({

         resourceRegExp: /^crypto$/,
      }),
   ]
};

module.exports = [

   haveModules ? modulesConfig : undefined,
   indexConfig,
].filter( _=>_ );