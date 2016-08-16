/**
 * A plugin to run all the axe rules and create generic feedback
 */

let $ = require("jquery");
let Plugin = require("../base");
let annotate = require("../shared/annotate")("everything");
let summary = require("../shared/summary");

let errorTemplate = require("./error.handlebars");

class ContextPlugin extends Plugin {

    constructor() {
        super();
        this.conf;
        this.setConf();
    }

    getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    getConf() {
        return (typeof this.conf === "undefined") ? this.setConf(this.getConf) : this.conf;
    }

    setConf(cb, err) {
        var that = this;
        $.getJSON( this.getParameterByName('conf'), function( data ) {
            that.conf = data;
        }).fail(function(msg){
            console.log("Error loading configuration file: "+msg.responseText);
        }).then(function(){
            typeof cb === 'function' && cb();
        }, function(){
            typeof err === 'function' && err();
        });
    }

    getContext() {
        return this.getConf().context;
    }

    getOptions() {
        return this.getConf().options;
    }

    getTitle() {
        return "Custom aXe Test";
    }

    getDescription() {
        return 'Runs specified Deque aXe\'s rules on specific selectors';
    }

    run() {

        let that = this;

        axe.a11yCheck(this.getContext(), this.getOptions(), function (results) {
            if (results.violations.length) {
                $(results.violations).each((j, rule) => {
                    let impact = rule.impact;
                    let help = rule.help;
                    let bestpractice = (rule.tags.indexOf('best-practice') !== -1);
                    $(rule.nodes).each((i, node) => {
                        let $el = $(node.target[0]);

                        let entry = that.error(
                            help, summary(node) + errorTemplate({impact:impact, bestpractice:bestpractice}), $el);

                        annotate.errorLabel(
                            $el, "", help, entry);
                    });
                    that.panel.render();
                });
            }

        });
    }

    cleanup() {
        annotate.removeAll();
    }
}

module.exports = ContextPlugin;
