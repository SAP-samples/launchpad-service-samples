/**
 * @fileoverview        Check "sap-no-encode-file-service" should detect the usage of "/sap/bc/ui2/encode_file".
 * @author              Christopher Fenner (C5224075) with advice from Armin Gienger (D028623)
 * @ESLint              Version 0.22.1.0 / June 2015
 */

// ------------------------------------------------------------------------------
// Rule Disablement
// ------------------------------------------------------------------------------
/*eslint-disable strict, sap-no-encode-file-service*/

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
module.exports = function(context) {
    "use strict";

    // --------------------------------------------------------------------------
    // Helpers
    // --------------------------------------------------------------------------
    var ERROR_MSG = "Usage of phrase '/sap/bc/ui2/encode_file' detected";

    function isString(string) {
        return typeof string === "string";
    }

    function startsWith(base, sub) {
        return base.indexOf(sub) === 0;
    }

    // --------------------------------------------------------------------------
    // Public
    // --------------------------------------------------------------------------
    return {
        "Literal": function(node) {
            var value = node.value;
            if (isString(value) && startsWith(value, "/sap/bc/ui2/encode_file")) {
                context.report(node, ERROR_MSG);
            }
        }
    };
};
