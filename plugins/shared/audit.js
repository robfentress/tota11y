/**
 * Abstractions for how we use axe-core
 */

// Audits for a list of rules, or using all the rules within the scope of the document, excluding our UI

function audit(rules, cb) {
    var scope = {
            include: [['html']],
            exclude: [['.tota11y-toolbar']]
        };
    if (typeof rules !== 'undefined') {
        axe.a11yCheck(scope, {
                runOnly: {
                    type: "rule",
                    values: rules
                }
            }, cb);
    } else {
        axe.a11yCheck(scope, {
                runOnly: {
                    type: "tag",
                    values: ['wcag2a', 'wcag2aa', 'best-practice']
                }
            }, cb);
    }
}

module.exports = audit;
