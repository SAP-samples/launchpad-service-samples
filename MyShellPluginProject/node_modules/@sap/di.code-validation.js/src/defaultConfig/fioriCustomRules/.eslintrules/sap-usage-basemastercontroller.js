/**
 * @fileoverview     Check "sap-usage-basemastercontroller" should detect the usage of "sap.ca.scfld.md.controller.BaseMasterController" & "sap/ca/scfld/md/controller/BaseMasterController"..
 * @author             Roman Horch (D030497), Christopher Fenner (C5224075) with advice from Armin Gienger (D028623)
 * @ESLint            Version 0.17.1 / June 2015
 */

// ------------------------------------------------------------------------------
// Invoking global form of strict mode syntax for whole script
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// Rule Disablement
// ------------------------------------------------------------------------------
/*eslint-disable strict, sap-usage-basemastercontroller*/
// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
module.exports = function(context) {
    "use strict";

    // --------------------------------------------------------------------------
    // Helpers
    // --------------------------------------------------------------------------
    var ERROR_MSG = "Usage of deprecated 'BaseMasterController' detected. Please use 'ScfldMasterController' instead.";

    function isString(string) {
        return typeof string === "string";
    }

    function contains(string, substring) {
        return string.indexOf(substring) !== -1;
    }

    // --------------------------------------------------------------------------
    // Public
    // --------------------------------------------------------------------------
    return {
        "MemberExpression": function(node) {
            var property = node.property;
            if (property.type === "Identifier"
                    && property.name === "BaseMasterController") {
                var value = context.getSource(node);
                if (isString(value)
                        && contains(value,
                                "sap.ca.scfld.md.controller.BaseMasterController")) {
                    context.report(node, ERROR_MSG);
                }
            }
        },
        "Literal": function(node) {
            // var val = node.value, result;
            if (isString(node.value)
                    && contains(node.value,
                            "sap/ca/scfld/md/controller/BaseMasterController")) {
                context.report(node, ERROR_MSG);
            }
        }
    };
};
