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
        this.plugin = this.conf.plugin || {};
        this.context = this.conf.context || {};
        this.options = this.conf.options || {};
        this._myDesc = [];

        let includedTags = []; // tags used to select rules to be included in scan
        let excludedTags = []; // tags used to remove rules to be included in scan
        let includedRules = []; // rules to be included in scan, except ones selected because in excludedTags
        let excludedRules = []; // rules to be included in scan, except ones to be removed because in excludedTags

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

        this.title = this.plugin.title || "context: " + title;
        this.description = this.plugin.description || this._myDesc.join(' ');

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

    set plugin(value) {
        this._plugin = value;
    }

    get plugin() {
        return this._plugin;
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

    getTitle() {
        return this.title;
    }

    getDescription() {
        return this.description;
    }

    run() {

        this.panel.errors = [];
        axe.a11yCheck(this.context, this.options, results => {
            if (results.violations.length) {
                $(results.violations).each((j, rule) => {
                    let impact = rule.impact;
                    let help = rule.help;
                    let bestpractice = (rule.tags.indexOf('best-practice') !== -1);
                    $(rule.nodes).each((i, node) => {
                        let $el = $(node.target[0]);

                        let entry = this.error(
                            help, summary(node) + errorTemplate({impact:impact, bestpractice:bestpractice}), $el);

                        annotate.errorLabel(
                            $el, "", help, entry);
                    });
                });
            }

            this.panel.setTitle(this.title);
            this.summary(summaryTemplate({rules: this.filteredRules, violations: results.violations, passes: results.passes}));
            this.panel.render();

        });
    }

    cleanup() {
        annotate.removeAll();
    }
}

module.exports = MultiPlugin;
