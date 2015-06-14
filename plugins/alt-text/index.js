/**
 * A plugin to check for valid alternative representations for images
 */

let $ = require("jquery");
let Plugin = require("../base");
let annotate = require("../shared/annotate")("alt-text");
let audit = require("../shared/audit");
let summary = require("../shared/summary");

let errorTemplate = require("./error.handlebars");

class AltTextPlugin extends Plugin {
    getTitle() {
        return "alt-texts";
    }

    getDescription() {
        return "Annotates elements without alt text";
    }

    run() {
        let that = this;

        audit(
            ["area-alt", "image-alt", "input-img-alt", "object-alt"],
            function (results) {
                console.log(results)
                if (results.violations.length) {
                    $(results.violations).each((j, rule) => {
                        let impact = rule.impact;
                        $(rule.nodes).each((i, node) => {
                            let el = $(node.target[0]);
                            annotate.label(el, "&#x2717;")
                                .addClass("tota11y-label-error");

                            that.error("Element is missing alt text. ", summary(node) + errorTemplate({impact:impact}), el);
                        });
                    });
                }
                if (results.passes.length) {
                    $(results.passes).each((j, rule) => {
                        $(rule.nodes).each((i, node) => {
                            let el = $(node.target[0]);
                            annotate.label(el, "&#x2713;")
                                .addClass("tota11y-label-success");
                        });
                    });
                }
                that.panel.render();
            });
    }

    cleanup() {
        annotate.removeAll();
    }
}

module.exports = AltTextPlugin;
