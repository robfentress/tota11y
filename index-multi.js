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

let FixturePlugin = require("./plugins/fixture");

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
        console.log("append fixture ");
        var conf = this.getConf();
        conf.include = fixture;
        var plugin = new FixturePlugin(conf);
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
            this.getInclude().forEach((fixture) => this.appendFixture(fixture, $pluginsContainer));
        }

    }
}

$(function() {
    var bar = new Toolbar();
    if ((getParameterByName('fixture') === "true") && getParameterByName('conf')) {
        $.getJSON( getParameterByName('conf'), (data) => {
            return data;
        }).fail((msg) => {
            console.log("Error loading configuration file: "+msg.responseText);
        }).then((conf) => {
            bar.setConf(conf);
            bar.appendTo($("body"));
        }, function(){
            console.log("Error with callback");
        });
    } else {
        bar.appendTo($("body"));
    }

});
