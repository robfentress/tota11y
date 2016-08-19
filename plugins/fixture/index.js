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

class FixturePlugin extends Plugin {

    constructor(conf) {

        super();

        this.conf = conf;

        var context = this.getContext();

        var inclusions = []; // all rules to be included
        var exclusions = []; // all rules to be excluded
        var includedTags = []; // tags used to select rules to be included in scan
        var excludedTags = []; // tags used to remove rules to be included in scan
        var includedRules = []; // rules to be included in scan, except ones selected because in excludedTags
        var excludedRules = []; // rules to be included in scan, except ones to be removed because in excludedTags
        var desc = []; // used to build description string from options in conf

        var branding = this.ret("this.conf.branding");

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
        inclusions = this.unique(inclusions);
        exclusions = this.unique(exclusions);
        inclusions = this.filterRules(inclusions, exclusions);
        this.inclusions = inclusions;

        if (branding) {
            this.title = branding.brand || "Fixture: " + context.include[0].join(', ');
        } else {
            this.title = "Fixture: " + context.include[0].join(', ');
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
    }
    hasRules(obj) {
        return obj.rules;
    }
    getValues(obj) {
        return obj.values;
    }
    getValue(obj) {
        return obj.value;
    }
    hasTag(obj) {
        return (obj.type) || (obj.type === "tag");
        //return (this.isType("tag") && this.ret("this.runOnly.values"));
    }
    hasRule(obj) {
        return (obj.type) || (obj.type === "tag");
        //return (this.isType("rule") && this.ret("this.runOnly.values"));
    }
    hasTags(obj) {
        return (obj.type) || (obj.type === "tags");
        //return (this.isType("tag") && this.ret("this.runOnly.values"));
    }


    ret(str) {
        try { return eval(str); } catch(err) { return false; }
    }
    unique(ary) {
        return new Set(ary);
    }
    filterRules(inc, ex) {
        var inc = Array.from(inc);
        return Array.from(new Set(inc.filter(r => ex.has(r))))
    }
    rules(tags) {
        return Array.from(axe.getRules(tags), r => r.ruleId)
    }
    comb(ary, sel) {
        return ary.concat((this.ret(sel)) ? this.rules(sel) : [])
    }
    isType(type, sel) {
        return this.ret("this.runOnly.type") === type;
    }

    setTitle(title) {
        this.title = title;
        this.panel.setTitle(this.title);
    }

    getConf() {
        return this.conf;
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
                    Array.from(axe.getRules(), r => r.ruleId);
                    var ruleSet = axe.getRules().filter(r => that.inclusions.find(rule => r.ruleId === rule));
                    that.panel.setTitle(that.getTitle());
                    that.about(summaryTemplate({violations: results.violations.length, rules: ruleSet}));
                    that.panel.render();
                });
            }

        });
    }

    cleanup() {
        annotate.removeAll();
    }
}

module.exports = FixturePlugin;
