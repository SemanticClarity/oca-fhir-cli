const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const Package = require("./package.json");
const isProd = process.argv[process.argv.indexOf("--mode") + 1] === "production";
const NAME = "OCA FHIRpack Converter";

console.info(`Mode: ${((isProd) ? "Production" : "Development")}`);

module.exports = {
  entry: "./src/index.js",
  context: __dirname,
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "oca-fhir.js",
    publicPath: "/dist/",
    library: "oca-fhir",
    globalObject: "this",
    libraryTarget: "umd",
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /\.js|\.jsx$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  externals: [
    {
      "configstore": {
        commonjs: "configstore",
        commonjs2: "configstore",
        amd: "configstore",
        root: "configstore"
      },
      "fhir": {
        commonjs: "fhir",
        commonjs2: "fhir",
        amd: "fhir",
        root: "fhir"
      },
      "fhirpath": {
        commonjs: "fhirpath",
        commonjs2: "fhirpath",
        amd: "fhirpath",
        root: "fhirpath"
      },
      "fhirpath.js": {
        commonjs: "fhirpath.js",
        commonjs2: "fhirpath.js",
        amd: "fhirpath.js",
        root: "fhirpath.js"
      },
      "handlebars": {
        commonjs: "handlebars",
        commonjs2: "handlebars",
        amd: "handlebars",
        root: "handlebars"
      },
      "handlebars-helpers-fhir": {
        commonjs: "handlebars-helpers-fhir",
        commonjs2: "handlebars-helpers-fhir",
        amd: "handlebars-helpers-fhir",
        root: "handlebars-helpers-fhir"
      },
      "hashlink": {
        commonjs: "hashlink",
        commonjs2: "hashlink",
        amd: "hashlink",
        root: "hashlink"
      },
      "node-cache": {
        commonjs: "node-cache",
        commonjs2: "node-cache",
        amd: "node-cache",
        root: "node-cache"
      },
      "recursive-readdir": {
        commonjs: "recursive-readdir",
        commonjs2: "recursive-readdir",
        amd: "recursive-readdir",
        root: "recursive-readdir"
      },
      "yargs": {
        commonjs: "yargs",
        commonjs2: "yargs",
        amd: "yargs",
        root: "yargs"
      }
    }
  ],
  stats: "errors-only",
  devtool: (isProd) ? false: "source-map",
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(Package.version),
      APP_NAME: JSON.stringify(NAME),
      APP_TITLE: JSON.stringify(NAME),
      DESCRIPTION: JSON.stringify(Package.description),
      AUTHOR: JSON.stringify(Package.author),
      WEBSITE: JSON.stringify(Package.homepage),
      AUTO_INVOKE: true,
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "process.env.DEBUG": JSON.stringify(process.env.DEBUG)
    })
  ]
};
