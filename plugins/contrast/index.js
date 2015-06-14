/**
 * A plugin to label different levels of contrast on the page, and highlight
 * those with poor contrast while suggesting alternatives.
 */

let $ = require("jquery");
let Plugin = require("../base");
let annotate = require("../shared/annotate")("labels");

let titleTemplate = require("./error-title.handlebars");
let descriptionTemplate = require("./error-description.handlebars");

require("./style.less");

class ContrastPlugin extends Plugin {
    getTitle() {
        return "Contrast";
    }

    getDescription() {
        return "Labels elements with insufficient contrast";
    }

    addError({fgColor, bgColor, contrastRatio, requiredRatio, impact}, el) {
        let templateData = {
            fgColorHex: fgColor,
            bgColorHex: bgColor,
            contrastRatio: contrastRatio,
            requiredRatio: requiredRatio,
            impact: impact
        };

        return this.error(
            titleTemplate(templateData),
            descriptionTemplate(templateData),
            $(el));
    }

    calculateRequiredRatio(data) {
        let fontSize = parseFloat(data.fontSize, 10);
        let fontWeight = data.fontWeight.toLowerCase();

        if (fontWeight === 'bold' || fontWeight === 'bolder') {
            if (fontSize > 14) {
                return 3.0;
            } else {
                return 4.5;
            }
        } else if (fontSize > 18) {
            return 3.0;
        } else {
            return 4.5;
        }
    }

    run() {
        // A map of fg/bg color pairs that we have already seen to the error
        // entry currently present in the info panel
        let combinations = {};
        let that = this;

        axe.a11yCheck({
            include: [['body']],
            exclude: [['.tota11y-toolbar']]
        }, {
            runOnly: {
                type: "rule",
                values: ["color-contrast"]
            }
        }, function (results) {
            if (results.violations.length) {
                let impact = results.violations[0].impact;
                $(results.violations[0].nodes).each((i, node) => {
                    let el = $(node.target[0]);
                    let contrastRatio = node.any[0].data.contrastRatio;
                    let requiredRatio =  that.calculateRequiredRatio(node.any[0].data)
                    let fgColor = node.any[0].data.fgColor;
                    let bgColor = node.any[0].data.bgColor;

                    let key = fgColor + "/" +
                                bgColor + "/" +
                                requiredRatio;
                    if (!combinations[key]) {
                        // We do not show duplicates in the errors panel, however,
                        // to keep the output from being overwhelming
                        let error = that.addError(
                            {fgColor, bgColor, contrastRatio, requiredRatio, impact},
                            el);
                        combinations[key] = error;
                    }
                    annotate.errorLabel(
                        $(el),
                        contrastRatio,
                        "This contrast is insufficient at this size.",
                        combinations[key]);
                });
                that.panel.render();
            }
        });
    }

    cleanup() {
        annotate.removeAll();
    }
}

module.exports = ContrastPlugin;
