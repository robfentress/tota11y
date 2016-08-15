/**
 * A plugin to run all the axe rules and create generic feedback
 */

let $ = require("jquery");
let Plugin = require("../base");
let annotate = require("../shared/annotate")("everything");
let audit = require("../shared/audit");
let summary = require("../shared/summary");

let errorTemplate = require("./error.handlebars");

class LinkTextPlugin extends Plugin {
    getTitle() {
        return "aXe";
    }

    getDescription() {
        return 'Runs all Deque aXe\'s rules';
    }

    run() {
        let that = this;
        let test = audit(undefined, function (results) {

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

module.exports = LinkTextPlugin;
