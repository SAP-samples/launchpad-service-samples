/**
 * @fileoverview     Check "sap-no-localhost" should detect the usage of "localhost".
 * @author             Roman Horch (D030497), Christopher Fenner (C5224075) with advice from Armin Gienger (D028623)
 * @ESLint            Version 0.14.0 / March 2015
 */

// ------------------------------------------------------------------------------
// Invoking global form of strict mode syntax for whole script
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// Rule Disablement
// ------------------------------------------------------------------------------
/*eslint-disable strict, sap-no-localhost*/

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
module.exports = function(context) {
    "use strict";

    // --------------------------------------------------------------------------
    // Helpers
    // --------------------------------------------------------------------------
    var ERROR_MSG = "Usage of 'localhost' detected";

    function isString(string) {
        return typeof string === "string";
    }

    function contains(string, substring) {
        return string.indexOf(substring) !== -1;
    }

    function containsNot(string, substring) {
        return !contains(string, substring);
    }
    // --------------------------------------------------------------------------
    // Public
    // --------------------------------------------------------------------------
    return {
        "Literal": function(node) {
            // var val = node.value, result;
            if (isString(node.value) && contains(node.value, "localhost")
                    && containsNot(node.value, "://localhost/offline/")) {
                context.report(node, ERROR_MSG);
            }
        }
    };
};
