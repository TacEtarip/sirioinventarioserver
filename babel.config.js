module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "18",
        },
        modules: "commonjs",
        useBuiltIns: "usage",
        corejs: 3,
      },
    ],
  ],
  plugins: [
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-transform-runtime",
  ],
};
