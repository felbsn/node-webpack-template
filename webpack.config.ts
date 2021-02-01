import * as path from 'path';
import * as webpack from 'webpack';
import chokidar from 'chokidar'

import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
 
var src_dir = path.resolve(__dirname, 'src');
var dist_dir = path.resolve(__dirname, 'dist');

//specifty entry points
let entries = ['index']

// map html-entry pairs
let output_entries:any = {}
let multipleHtmlPlugins = entries.map(name => {
  output_entries[name] = path.resolve(src_dir, replaceExt(name, ".ts"));
  return new HtmlWebpackPlugin({
    template: path.resolve(src_dir, replaceExt(name, '.html')), // relative path to the HTML files
    filename: `${name}.html`, // output HTML files
    chunks: [`${name}`], // respective JS files
  })
});

export default (env:any, argv:any) =>
{
  var isDev = argv.mode === 'development';
  var config:webpack.Configuration = {
    entry: output_entries,
    output:{
      path:dist_dir
    },
    resolve: {
      extensions: ['.ts', '.js', '.json']
    },
    module:
    {
      rules:[
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            isDev ? MiniCssExtractPlugin.loader : "style-loader",
            "css-loader",
            "sass-loader",
          ],
        }
      ]
    },
    devServer:
    {
      contentBase:[src_dir],
      hot:true,
      port:9000,
      before:function(app, server ,compiler)
      {
        chokidar.watch([path.resolve(src_dir , "*.html")]).on('all', function(ev){
          server.sockWrite(server.sockets ,'content-changed' );
        })
      }
    },
    plugins:[
      ...multipleHtmlPlugins,
      new MiniCssExtractPlugin({
        filename: 'css/[name].css', //true ? 'css/[name].css' : 'css/[name].[contenthash].css',
        chunkFilename: 'css/[id].css'
      }),
    ]
  };
  return config
}

function replaceExt(str:string, ext:string) {
  return str.replace(/(\.[^.]+$)|$/, ext);
}


