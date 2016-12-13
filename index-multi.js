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
let CustomPlugin = require("./plugins/custom");

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
        this.pluginsContainer = pluginsContainer;
    }

    getPluginsContainer() {
        return this.pluginsContainer;
    }

    appendFixture(fixture) {
        var plugin = new MultiPlugin(fixture);
        this.appendPlugin(plugin);
        //plugin.appendTo(pluginsContainer);
    }

    appendTo($el) {
        var $toolbar = $(toolbarTemplate());
        $el.append($toolbar);

        $toolbar.find(".tota11y-toolbar-toggle").click((e) => {
            e.preventDefault();
            e.stopPropagation();
            $toolbar.toggleClass("tota11y-expanded")
        });

        // Attach each plugin
        var $pluginsContainer = $toolbar.find(".tota11y-plugins");
        this.setPluginsContainer($pluginsContainer);

    }

    appendPlugin(plugin) {
        console.log(this.getPluginsContainer());
        plugin.appendTo(this.getPluginsContainer());
    }
}

$(function() {
    var bar = new Toolbar();

    var options = (typeof aXeA11y === 'undefined') ? { multi: false } : aXeA11y;
    var aXeA11yMulti = getParameterByName('aXeA11yMulti');

    options.multi = ((aXeA11yMulti === "true") || (options.multi === true));

    var multiIsSet = !(((typeof aXeA11y === 'undefined') || ((aXeA11y.multi !== true) && (aXeA11y.multi !== false))) && ((aXeA11yMulti !== "true") || (aXeA11yMulti !== "false")));

    if (options.multi) {
        console.log('multi true');
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
            console.log("monkey");
            bar.setConf(options.conf);
            bar.appendTo($("body"));
            bar.getConf().forEach((fixture) => bar.appendFixture(fixture));
        } else {
            console.log("Must must provide configuration, either as file name or internal JSON object");
        }
    } else {
        console.log('multi false');
        bar.appendTo($("body"));
        if ((aXeA11yMulti === "false") && (typeof aXeA11y === 'undefined')) {
            var custom = new CustomPlugin();
            bar.appendPlugin(custom);
        }
        /*if (multiIsSet) {
            console.log('multi is set');
            var custom = new CustomPlugin();
            bar.appendPlugin(custom);
        }*/
    }
    plugins.forEach((plugin) => {
        // Mount the plugin to the list
        bar.appendPlugin(plugin);
    });

});
