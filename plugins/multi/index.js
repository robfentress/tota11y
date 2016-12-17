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
        this.branding = this.conf.branding || {};
        this.context = this.conf.context || {};
        this.options = this.conf.options || {};
        this._myDesc = [];

        var includedTags = []; // tags used to select rules to be included in scan
        var excludedTags = []; // tags used to remove rules to be included in scan
        var includedRules = []; // rules to be included in scan, except ones selected because in excludedTags
        var excludedRules = []; // rules to be included in scan, except ones to be removed because in excludedTags

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
            this.addToDesc("+", "tags", includedTags);
        }
        if (excludedTags.length>0) {
            this.addToDesc("-", "tags", excludedTags);
        }
        if (includedRules.length>0) {
            this.addToDesc("+", "rules", includedRules);
        }
        if (excludedRules.length>0) {
            this.addToDesc("-", "rules", excludedRules);
        }

        let inc = this.context.include || ['document'];
        let title = "+"+JSON.stringify(inc);
        title += (this.context.exclude.length > 0) ? ", -"+JSON.stringify(this.context.exclude) : "";

        this.title = this.branding.brand || "context: " + title;
        this.description = this.branding.application || this._myDesc.join(' ');

        /**
         * For each listed rule, add to includedRules or excludedRules arrays, based on whether enabled property is true
         * @param {Object} rules - Rules to include or exclude from a scan
         */
        function setRules(rules) {
            if (rules) {
                Object.keys(rules).forEach((rule) => {
                    if (rules[rule].enabled === true) {
                        includedRules.push(rule);
                    } else {
                        excludedRules.push(rule);
                    }
                });
            }
        }
    }

    set conf(value) {
        this._conf = value;
    }

    get conf() {
        return this._conf;
    }

    set branding(value) {
        this._branding = value;
    }

    get branding() {
        return this._branding;
    }

    set title(value) {
        this._title = value;
    }

    get title() {
        return this._title;
    }

    set description(value) {
        this._description = value;
    }

    get description() {
        return this._description;
    }

    set context(value) {
        this._context = value;
    }

    get context() {
        return this._context;
    }

    set options(value) {
        this._options = value;
    }

    get options() {
        return this._options;
    }
    get filteredRules() {
        return axe._audit.rules.filter(rule => {
            return axe.utils.ruleShouldRun(rule, {page:true}, this.options)
        });
    }

    addToDesc(addOrSubtract, type, values) {
        this._myDesc.push(addOrSubtract + " " + type + JSON.stringify(values));
    }

    setTitle(title) {
        this.title = title;
        this.panel.setTitle(this.title);
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
        axe.a11yCheck(this.context, this.options, function (results) {
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

            that.panel.setTitle(that.title);
            that.summary(summaryTemplate({rules: that.filteredRules, violations: results.violations, passes: results.passes}));
            that.panel.render();

        });
    }

    cleanup() {
        annotate.removeAll();
    }
}

module.exports = MultiPlugin;
