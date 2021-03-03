/**
 * @fileoverview detects usage of localstaorage
 * @author Achref Kilani Jrad
 * @ESLint			Version 0.14.0 / February 2015
 */

// ------------------------------------------------------------------------------
// Invoking global form of strict mode syntax for whole script
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// Rule Disablement
// ------------------------------------------------------------------------------
/*eslint-disable strict*/
// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
module.exports = function(context) {
    "use strict";
    var FORBIDDEN_STORAGE_OBJECT = [];

    var MESSAGE_LOCAL_STORAGE = "Local storage must not be used in a Fiori application";
    var MEMBER = "MemberExpression", IDENTIFIER = "Identifier";

    // --------------------------------------------------------------------------
    // Helpers
    // --------------------------------------------------------------------------

    function isType(node, type) {
        return node && node.type === type;
    }
    function isIdentifier(node) {
        return isType(node, IDENTIFIER);
    }
    function isMember(node) {
        return isType(node, MEMBER);
    }

    function buildCalleePath(node) {
        if (isMember(node.object)) {
            return buildCalleePath(node.object) + "."
                    + node.object.property.name;
        } else if (isIdentifier(node.object)) {
            return node.object.name;
        }
        return "";
    }

    function contains(a, obj) {
        for (var i = 0; i < a.length; i++) {

            if (obj === a[i]) {
                return true;
            }
        }
        return false;
    }

    function isForbiddenObviousApi(calleePath) {
        var elementArray = calleePath.split(".");
        var lastElement = elementArray[elementArray.length - 1];

        return lastElement;
    }

    function processVariableDeclarator(node) {
        if (node.init) {
            if (node.init.type === "MemberExpression") {
                var firstElement = node.init.object.name, secondElement = node.init.property.name;
                if (firstElement + "." + secondElement === "window.localStorage") {
                    FORBIDDEN_STORAGE_OBJECT.push(node.id.name);
                }
            } else if ((node.init.type === "Identifier")
                    && (node.init.name === "localStorage")) {
                FORBIDDEN_STORAGE_OBJECT.push(node.id.name);
            }
        }
    }

    return {

        "VariableDeclarator": function(node) {
            processVariableDeclarator(node);
        },
        "MemberExpression": function(node) {
            var memberExpressionNode = node;
            var calleePath = buildCalleePath(memberExpressionNode);
            var speciousObject = isForbiddenObviousApi(calleePath);

            if (((calleePath === "localStorage") || (calleePath === "window.localStorage"))
                    && (speciousObject === "localStorage")) {
                context.report(node, MESSAGE_LOCAL_STORAGE);
            } else if (contains(FORBIDDEN_STORAGE_OBJECT, speciousObject)) {
                context.report(node, MESSAGE_LOCAL_STORAGE);
            }

        }

    };

};
