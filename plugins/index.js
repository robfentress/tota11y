/**
 * An index of plugins.
 *
 * Exposes an array of plugin instances.
 */

let AltTextPlugin = require("./alt-text");
let ContrastPlugin = require("./contrast");
let HeadingsPlugin = require("./headings");
let LabelsPlugin = require("./labels");
let LandmarksPlugin = require("./landmarks");
let LinkTextPlugin = require("./link-text");
let EverythingPlugin = require("./everything");

module.exports = [
    new HeadingsPlugin(),
    new ContrastPlugin(),
    new LinkTextPlugin(),
    new LabelsPlugin(),
    new AltTextPlugin(),
    new LandmarksPlugin(),
    new EverythingPlugin()
];
