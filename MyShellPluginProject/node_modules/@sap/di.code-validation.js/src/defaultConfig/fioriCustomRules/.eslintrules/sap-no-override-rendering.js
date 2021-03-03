/**
 * @fileoverview Rule to flag override of getters, setters, onBeforeRendering
 *               and onAfterRendering for SAPUI5 object from a list of
 *               namespaces
 * @author Achref Kilani Jrad
 * @ESLint			Version 0.14.0 / February 2015
 */

// ------------------------------------------------------------------------------
// Rule Disablement
// ------------------------------------------------------------------------------
/*eslint-disable strict*/
// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
module.exports = function(context) {
    "use strict";

    function uniquifyArray(array) {
        var a = array.concat();
        for (var i = 0; i < a.length; ++i) {
            for (var j = i + 1; j < a.length; ++j) {
                if (a[i] === a[j]) {
                    a.splice(j--, 1);
                }
            }
        }
        return a;
    }
    var customNS = context.options[0] && context.options[0].ns
            ? context.options[0].ns
            : [];
    var configuration = {
        "ns": uniquifyArray([
                "sap.ui.core", "sap.apf", "sap.ca.scfld.md", "sap.ca.ui",
                "sap.chart", "sap.collaboration", "sap.fiori", "sap.landvisz",
                "sap.m", "sap.makit", "sap.me", "sap.ndc", "sap.ovp",
                "sap.portal.ui5", "sap.suite.ui.commons",
                "sap.suite.ui.generic.template", "sap.suite.ui.microchart",
                "sap.tnt", "sap.ui.commons", "sap.ui.comp", "sap.ui.dt",
                "sap.ui.fl", "sap.ui.generic.app", "sap.ui.generic.template",
                "sap.ui.layout", "sap.ui.richtexteditor", "sap.ui.rta",
                "sap.ui.server.abap", "sap.ui.server.java", "sap.ui.suite",
                "sap.ui.table", "sap.ui.unified", "sap.ui.ux3", "sap.ui.vbm",
                "sap.ui.vk", "sap.uiext.inbox", "sap.ushell", "sap.uxap",
                "sap.viz"
        ].concat(customNS))
    };
    var ui5ObjectsToCheck = [];
    var CHECKED_METHODS = [
            "onBeforeRendering", "onAfterRendering"
    ];

    // --------------------------------------------------------------------------
    // Helpers
    // --------------------------------------------------------------------------

    function contains(a, obj) {
        for (var i = 0; i < a.length; i++) {

            if (obj === a[i]) {
                return true;
            }
        }
        return false;
    }

    function checkIfNotAllowedMethod(property) {
        if ((typeof property !== "undefined")
                && ((contains(CHECKED_METHODS, property))
                        || (property.indexOf("get") === 0) || (property
                        .indexOf("set") === 0))) {
            return true;
        }
        return false;

    }

    function calculateObjectName(memberExpressionObject) {
        var objectName = "";
        if (memberExpressionObject.type === "MemberExpression") {
            objectName = memberExpressionObject.property.name;
        } else if (memberExpressionObject.type === "Identifier") {
            objectName = memberExpressionObject.name;
        }
        return objectName;
    }

    function checkIfAncestorsContainsNewExpression(ancestors) {
        var ancestorsLength = ancestors.length;
        for (var i = 0; i < ancestorsLength; i++) {
            if (ancestors[i].type === "NewExpression") {
                return i;
            }
        }
        return -1;
    }

    function checkIfReportedNamespace(namespace) {

        for (var i = 0; i < configuration.ns.length; i++) {
            if (namespace.indexOf(configuration.ns[i] + ".") === 0) {
                return true;
            }
        }
        return false;
    }

    function processMemberExpression(node) {
        if (node.object.type === "Identifier") {
            var namespace = node.object.name + "." + node.property.name, ancestors = context
                    .getAncestors();

            ancestors.reverse();
            var newExpressionPosition = checkIfAncestorsContainsNewExpression(ancestors);
            if (newExpressionPosition !== -1) {
                for (var i = 0; i < newExpressionPosition; i++) {
                    if (ancestors[i].property) {
                        var propertyName = ancestors[i].property.name;
                        namespace += "." + propertyName;
                    }
                }

                if ((checkIfReportedNamespace(namespace))
                        && (ancestors[newExpressionPosition].parent.id)) {
                    ui5ObjectsToCheck
                            .push(ancestors[newExpressionPosition].parent.id.name);
                }

            }

        }
    }

    function checkAssignmentAgainstOverride(node) {
        if ((node.left.type === "MemberExpression")
                && (node.right.type === "FunctionExpression")) {
            var memberExpression = node.left, objectProperty = memberExpression.property.name;
            var objectNameToCheck, memberExpressionObject = memberExpression.object;

            if (checkIfNotAllowedMethod(objectProperty)) {

                objectNameToCheck = calculateObjectName(memberExpressionObject);
                if (contains(ui5ObjectsToCheck, objectNameToCheck)) {
                    context
                            .report(node,
                                    "Override of rendering or getter or setter is not permitted");
                }
            }

        }
    }

    // --------------------------------------------------------------------------
    // Public
    // --------------------------------------------------------------------------

    return {

        "MemberExpression": function(node) {
            processMemberExpression(node);
        },
        "AssignmentExpression": function(node) {
            checkAssignmentAgainstOverride(node);
        }
    };

};
