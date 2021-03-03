/**
 * @fileoverview detects override of storage prototype
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
    var FORBIDDEN_STR_OBJECT = [];
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

    function checkAssignmentAgainstOverride(node) {
        if ((node.left.type === "MemberExpression")
                && (node.right.type === "FunctionExpression")) {
            var memberExpression = node.left;

            var calleePath = buildCalleePath(memberExpression);

            if ((calleePath === "Storage.prototype")
                    || (contains(FORBIDDEN_STR_OBJECT, calleePath))) {

                context
                        .report(
                                node,
                                "Storage prototype should not be overridden as this can lead to unpredictable errors");
            }
        }

    }

    function processVariableDeclarator(node) {
        if (node.init) {
            if (node.init.type === "MemberExpression") {
                var firstElement = node.init.object.name, secondElement = node.init.property.name;

                if (firstElement + "." + secondElement === "Storage.prototype") {
                    FORBIDDEN_STR_OBJECT.push(node.id.name);
                }
            }
        }
    }

    return {
        "VariableDeclarator": function(node) {
            processVariableDeclarator(node);
        },
        "AssignmentExpression": function(node) {
            checkAssignmentAgainstOverride(node);
        }

    };

};
