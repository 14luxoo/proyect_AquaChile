// Configuración de Karma: corre las pruebas Jasmine en Chrome y genera cobertura.
const webpack = require('webpack');

module.exports = function (config) {
  config.set({
    frameworks: ['jasmine', 'webpack'],
    files: [{ pattern: 'src/**/*.spec.js', watched: false }],
    preprocessors: { 'src/**/*.spec.js': ['webpack'] },

    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      resolve: { extensions: ['.js', '.jsx'] },
      module: {
        rules: [
          // El proyecto es "type": "module"; permite importar sin escribir la extensión.
          { test: /\.m?jsx?$/, resolve: { fullySpecified: false } },
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env', ['@babel/preset-react', { runtime: 'automatic' }]],
                plugins: [['istanbul', { exclude: ['**/*.spec.js', 'src/tests/**'] }]],
              },
            },
          },
          { test: /\.css$/, type: 'asset/source' },
          { test: /\.(png|svg|jpg)$/, type: 'asset/resource' },
        ],
      },
      plugins: [
        // Vite usa import.meta.env; en las pruebas lo dejamos vacío.
        new webpack.DefinePlugin({
          'import.meta.env.VITE_SOLICITUDES_WEBHOOK_URL': JSON.stringify(''),
        }),
      ],
    },

    reporters: ['progress', 'coverage'],
    coverageReporter: {
      dir: 'coverage/',
      reporters: [{ type: 'html', subdir: 'html' }, { type: 'text-summary' }],
    },

    browsers: ['ChromeHeadless'],
    customLaunchers: {
      ChromeHeadlessCI: { base: 'ChromeHeadless', flags: ['--no-sandbox'] },
    },
    singleRun: true,
  });
};
