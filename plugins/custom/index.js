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
        this.setTitle("Custom aXe Test");
        this.setDescription('Runs specified Deque aXe\'s rules on specific selectors');
        this.setConf(() => {
            console.log(this.getConf().branding);
            if (typeof this.getConf().branding !== "undefined") {
                this.setTitle(this.getConf().branding.brand || this.getTitle());
            }
        });
    }

    // From: Gras Double (http://stackoverflow.com/users/289317/gras-double)
    // Reference: http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
    getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    setTitle(title) {
        this.title = title;
        this.panel.setTitle(this.title);
    }

    setDescription(description) {
        this.description = description;
    }

    getConf() {
        return (typeof this.conf === "undefined") ? this.setConf(this.getConf) : this.conf;
    }

    setConf(cb, err) {
        var that = this;
        var aXeA11yConf = this.getParameterByName('aXeA11yConf');
        var options = (typeof aXeA11y === 'undefined') ? { multi: false } : aXeA11y;
        if (typeof options.conf === "undefined") {
            if (aXeA11yConf) {
                $.getJSON(aXeA11yConf, function (data) {
                    that.conf = data[0];
                }).fail(function (msg) {
                    console.log("Error loading configuration file: " + msg.responseText);
                }).then(function () {
                    typeof cb === 'function' && cb();
                }, function () {
                    typeof err === 'function' && err();
                });
            } else {
                console.log("Must must provide configuration, either as file name or internal JSON object");
            }
        } else {
            that.conf = options.conf[0];
            console.log(that.conf);
            typeof cb === 'function' && cb();
        }
    }

    getContext() {
        return this.getConf().context;
    }

    getOptions() {
        return this.getConf().options;
    }

    getTitle() {
        return this.title;
    }

    getDescription() {
        return this.description;
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
