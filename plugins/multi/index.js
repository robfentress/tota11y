/**
 * A plugin to run all the axe rules and create generic feedback
 */

let $ = require("jquery");
let Plugin = require("../base");
let annotate = require("../shared/annotate")("everything");
let summary = require("../shared/summary");

let errorTemplate = require("./error.handlebars");
let summaryTemplate = require("./summary.handlebars");
require("./style.less");

class MultiPlugin extends Plugin {

    constructor(conf) {

        super();

        this.conf = conf;
        this.context;
        this.setContext(this.getConf().context);

        var context = this.getContext();

        var inclusions = []; // all rules to be included
        var exclusions = []; // all rules to be excluded
        var includedTags = []; // tags used to select rules to be included in scan
        var excludedTags = []; // tags used to remove rules to be included in scan
        var includedRules = []; // rules to be included in scan, except ones selected because in excludedTags
        var excludedRules = []; // rules to be included in scan, except ones to be removed because in excludedTags
        var desc = []; // used to build description string from options in conf

        var branding = this.conf.branding;

        this.options = this.conf.options;

        if (this.options) {

            if (this.options.rules) setRules(this.options.rules);

            this.runOnly = this.options.runOnly;

            if (this.runOnly) {
                if (this.runOnly.type === "tag") includedTags = this.runOnly.values;
                if (this.runOnly.type === "rule") includedRules = this.runOnly.values;
                if ((this.runOnly.type === "tags") && (this.runOnly.value)) {
                    includedTags = this.runOnly.value.include;
                    excludedTags = this.runOnly.value.exclude;
                }
            }
        }

        if (includedTags.length>0) {
            inclusions = this.rules(includedTags);
            desc.push("+ tags [" + includedTags +"]");
        }
        if (excludedTags.length>0) {
            exclusions = this.rules(excludedTags);
            desc.push("- tags [" + excludedTags +"]");
        }
        if (includedRules.length>0) {
            inclusions = inclusions.concat(includedRules);
            desc.push("+ rules [" + includedRules +"]");
        }
        if (excludedRules.length>0) {
            exclusions = exclusions.concat(excludedRules);
            desc.push("- rules [" + excludedRules +"]");
        }
        inclusions = dedup(inclusions);
        exclusions = dedup(exclusions);
        inclusions = this.filterRules(inclusions, exclusions);
        this.inclusions = inclusions;

        if (branding) {
            this.title = branding.brand || "Fixture: " + context.include;
            if (branding.application) this.description = branding.application;
        } else {
            this.title = "Fixture: " + context.include;
            this.description = desc.join(' ');
        }

        function setRules(rules) {
            if (rules) {
                Object.keys(rules).forEach((rule) => {
                    if (rules[rule].enabled === "true") {
                        includedRules.push(rule);
                    } else {
                        excludedRules.push(rule);
                    }
                });
            }
        }

        function dedup(ary) {
            return new Set(ary);
        }
    }

    filterRules(inc, ex) {
        var inc = Array.from(inc);
        var difference = Array.from(new Set(inc.filter(r => !ex.has(r))));
        return difference;
    }
    rules(tags) {
        return Array.from(axe.getRules(tags), r => r.ruleId)
    }
    getInclusions() {
        return new Set(this.inclusions);
    }

    setTitle(title) {
        this.title = title;
        this.panel.setTitle(this.title);
    }


    getConf() {
        return this.conf;
    }

    setContext(context) {
        this.context = context;
    }
    getContext() {
        return this.context;
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
        this.panel.errors = [];
        //console.log(that.getContext());
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
                });
            }


            var ruleSet = Array.from(new Set(axe.getRules().filter(r => that.getInclusions().has(r.ruleId))));
            console.log(ruleSet)
            that.panel.setTitle(that.getTitle());
            that.summary(summaryTemplate({violations: results.violations.length, rules: ruleSet}));
            that.panel.render();

        });
    }

    cleanup() {
        annotate.removeAll();
    }
}

module.exports = MultiPlugin;
