/**
 * An index of plugins.
 *
 * Exposes an array of plugin instances.
 */
let CustomPlugin = require("./custom");

module.exports = [
    new CustomPlugin()
];
