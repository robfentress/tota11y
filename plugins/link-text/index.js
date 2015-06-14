/**
 * A plugin to identify empty link text such as when used with background images
 */

let $ = require("jquery");
let Plugin = require("../base");
let annotate = require("../shared/annotate")("link-text");
let audit = require("../shared/audit");

class LinkTextPlugin extends Plugin {
    getTitle() {
        return "Link text";
    }

    getDescription() {
        return `
            Identifies links that may be confusing when read by a screen
            reader
        `;
    }

    run() {
        let that = this;
        let test = audit(['link-name'], function (results) {
            if (results.violations.length) {
                $(results.violations).each((j, rule) => {
                    let impact = rule.impact;
                    $(rule.nodes).each((i, node) => {
                        let $el = $(node.target[0]);
                        let description = `
                            The text <i>"${$el.text()}"</i> is unclear without context
                            and may be confusing to screen readers. Consider
                            rearranging the <code>&lt;a&gt;&lt;/a&gt;</code> tags or
                            including special screen reader text.
                        `;
                        // TODO: A "show me how" link may be even more helpful

                        let entry = that.error(
                            "Link text is unclear", description, $el);

                        annotate.errorLabel(
                            $el, "", `Link text "${$el.text()}" is unclear`, entry);
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
