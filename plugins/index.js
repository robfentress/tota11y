/**
 * An index of plugins.
 *
 * Exposes an array of plugin instances.
 */
let LinkTextPlugin = require("./link-text");
let CustomPlugin = require("./custom");

module.exports = [
    new CustomPlugin()
];
