/**
 * A plugin to label all ARIA landmark roles
 */

let $ = require("jquery");
let Plugin = require("../base");
let annotate = require("../shared/annotate")("landmarks");

class LandmarksPlugin extends Plugin {
    getTitle() {
        return "Landmarks";
    }

    getDescription() {
        return "Labels all ARIA landmarks";
    }

    run() {
        // Theoretically this could be written in pure CSS, if we were able
        // to consistently place the label on top of the container with the
        // role set.
        //
        // For now, we'll place the label with JavaScript.

        let $regions = $("[role]");
        const regionRoles = ['main', 'banner', 'complementary', 'contentinfo', 'navigation', 'search', 'article', 'region'];
        $regions.each(function() {
            let role = $(this).attr("role");
            if (regionRoles.indexOf(role) !== -1) {
                annotate.label($(this), role);
            }
        });
        $regions = $("footer, main, header, article, nav");
        $regions.each(function() {
            let name = this.nodeName.toLowerCase();
            annotate.label($(this), "&lt;" + name + "&gt;");
        });
    }

    cleanup() {
        annotate.removeAll();
    }
}

module.exports = LandmarksPlugin;
