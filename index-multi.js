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

    appendFixture(fixture, pluginsContainer) {
        var plugin = new MultiPlugin(fixture);
        plugin.appendTo(pluginsContainer);
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
        plugins.forEach((plugin) => {
            // Mount the plugin to the list
            plugin.appendTo($pluginsContainer);
        });

        if (this.getConf()) {
            this.getConf().forEach((fixture) => this.appendFixture(fixture, $pluginsContainer));
        }

    }
}

$(function() {
    var bar = new Toolbar();
    if (getParameterByName('aXeA11yMulti') === "true") {
        if (typeof aXeA11yConf !== "undefined") {
            bar.setConf(aXeA11yConf);
            bar.appendTo($("body"));
        } else {
            if (getParameterByName('aXeA11yConf')) {
                $.getJSON(getParameterByName('aXeA11yConf'), (data) => {
                    return data;
                }).fail((msg) => {
                    console.log("Error loading configuration file: " + msg.responseText);
                }).then((conf) => {
                    bar.setConf(conf);
                    bar.appendTo($("body"));
                }, function () {
                    console.log("Error with callback");
                });
            } else {
                console.log("Must must provide aXeA11yConf configuration, either as file name or internal JSON object");
            }
        }
    } else {
        bar.appendTo($("body"));
    }

});
