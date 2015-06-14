/**
 * A plugin to identify unlabeled inputs
 */

let $ = require("jquery");
let Plugin = require("../base");
let annotate = require("../shared/annotate")("labels");
let audit = require("../shared/audit");
let summary = require("../shared/summary");

let errorTemplate = require("./error-template.handlebars");

class LabelsPlugin extends Plugin {
    getTitle() {
        return "Labels";
    }

    getDescription() {
        return "Identifies inputs with missing labels";
    }

    errorMessage($el) {
        return errorTemplate({
            placeholder: $el.attr("placeholder"),
            id: $el.attr("id"),
            tagName: $el.prop("tagName").toLowerCase(),
            title: $el.attr("title")
        });
    }

    run() {
        let that = this;
        audit(['label', 'label-title-only'], function (results) {
            if (results.violations.length) {
                $(results.violations).each((j, rule) => {
                    let impact = rule.impact;
                    $(rule.nodes).each((i, node) => {
                        let el = $(node.target[0]);
                        let title = "Input is missing a label";

                        // Place an error label on the element and register it as an
                        // error in the info panel
                        let entry = that.error(title, summary(node) + that.errorMessage(el), el);
                        annotate.errorLabel(el, "", title, entry);
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

module.exports = LabelsPlugin;
