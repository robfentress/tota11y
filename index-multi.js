/**
 * The entry point for tota11y.
 *
 * Builds and mounts the toolbar.
 */

// Require the base tota11y styles right away so they can be overwritten
require("./less/tota11y.less");

var $ = require("jquery");

var plugins = require("./plugins");
var toolbarTemplate = require("./templates/toolbar.handlebars");

// Chrome Accessibility Developer Tools - required once as a global
require("script!./node_modules/axe-core/axe.js");

let MultiPlugin = require("./plugins/multi");
//let CustomPlugin = require("./plugins/custom");

// From: Gras Double (http://stackoverflow.com/users/289317/gras-double)
// Reference: http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

class Toolbar {

    constructor() {
        this.$toolbar = $(toolbarTemplate());
        this.setPluginsContainer(this.$toolbar.find(".tota11y-plugins"));
        //this.$pluginsContainer = this.$toolbar.find(".tota11y-plugins");
    }

    setConf(conf) {
        this.conf = conf;
    }

    getConf() {
        return this.conf;
    }

    getContext() {
        return this.getConf().context;
    }

    getInclude() {
        return this.getContext().include;
    }

    setPluginsContainer(pluginsContainer) {
        this.$pluginsContainer = pluginsContainer;
    }

    getPluginsContainer() {
        return this.$pluginsContainer;
    }

    appendFixture(fixture) {
        let plugin = new MultiPlugin(fixture);
        this.appendPlugin(plugin);
    }

    appendTo($el) {
        $el.append(this.$toolbar);

        this.$toolbar.find(".tota11y-toolbar-toggle").click((e) => {
            e.preventDefault();
            e.stopPropagation();
            this.$toolbar.toggleClass("tota11y-expanded")
        });

    }

    appendPlugin(plugin) {
        plugin.appendTo(this.getPluginsContainer());
    }

    appendPlugins() {
        plugins.forEach((plugin) => {
            // Mount the plugin to the list
            this.appendPlugin(plugin);
        });
    }
}

$(function() {
    let bar = new Toolbar();

    let options = (typeof aXeA11y === 'undefined') ? { multi: false } : aXeA11y;
    let aXeA11yMulti = getParameterByName('aXeA11yMulti');

    /* unless multi is specifically set in url or embedded object, it is false
     * and if url parameter overrides embedded object */
    options.multi = ((aXeA11yMulti === "true") || (options.multi === true));

    if (getParameterByName('aXeA11yConf')) { //conf file path provided
        $.getJSON(getParameterByName('aXeA11yConf'), (data) => {
            return data;
        }).fail((msg) => {
            console.log("Error loading configuration file: " + msg.responseText);
        }).then((conf) => {
            bar.setConf(conf);
            bar.appendTo($("body"));
            bar.getConf().forEach((fixture) => bar.appendFixture(fixture));
        }, function () {
            console.log("Error with callback");
        });
    } else if (typeof options.conf !== "undefined") { //in page object provided
        bar.setConf(options.conf);
        bar.appendTo($("body"));
        bar.getConf().forEach((fixture) => bar.appendFixture(fixture));
    } else {
        //console.log("Must must provide configuration, either as file name or internal JSON object");
        bar.appendTo($("body"));
        return bar.appendPlugins();
    }

    if (options.multi) {
        bar.appendPlugins();
    }

});
