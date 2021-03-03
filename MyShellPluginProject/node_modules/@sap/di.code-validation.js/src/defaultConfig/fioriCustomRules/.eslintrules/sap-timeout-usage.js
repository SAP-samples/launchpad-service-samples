/**
 * @fileoverview Detect some warning for usages of (window.)document APIs
 * @author Achref Kilani Jrad
 * @ESLint          Version 0.14.0 / February 2015
 */

// ------------------------------------------------------------------------------
// Rule Disablement
// ------------------------------------------------------------------------------
/*eslint-disable complexity, max-depth */
/*eslint-disable global-strict*/
/*eslint-disable strict*/
// ------------------------------------------------------------------------------
// Invoking global form of strict mode syntax for whole script
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
module.exports = function(context) {

    "use strict";
    var MESSAGE_TIMEOUT = "Timeout with value > 0"; // 33
    var WINDOW_OBJECTS = [];
    // --------------------------------------------------------------------------
    // Helpers
    // --------------------------------------------------------------------------
    function isType(node, type) {
        return node && node.type === type;
    }
    function isIdentifier(node) {
        return isType(node, "Identifier");
    }
    function isMember(node) {
        return isType(node, "MemberExpression");
    }

    function contains(a, obj) {
        for (var i = 0; i < a.length; i++) {
            if (obj === a[i]) {
                return true;
            }
        }
        return false;
    }

    function isWindow(node) {
        return isIdentifier(node) && node.name === "window";
    }

    function isTimeout(node) {
        return isIdentifier(node) && node.name === "setTimeout";
    }

    function isInteresting(node) {
        var obj = node.callee;
        if (isMember(obj)) {
            if (isWindow(obj.object) || isIdentifier(obj.object)
                    && contains(WINDOW_OBJECTS, obj.object.name)) {
                // is member expression on window, check property
                obj = obj.property;
            } else {
                // no call on window
                return false;
            }
        }
        // here obj may not be node.callee any more but node.callee.property
        return isTimeout(obj);
    }

    function isValid(node) {
        var args = node.arguments;
        return args
                && (args.length === 1 || args.length > 1
                        && (args[1].value === 0 || args[1].value === "0"));
    }

    function rememberWindow(left, right) {
        if (right && isWindow(right) && left && isIdentifier(left)) {
            WINDOW_OBJECTS.push(left.name);
        }
    }

    // --------------------------------------------------------------------------
    // Public
    // --------------------------------------------------------------------------
    return {
        "VariableDeclarator": function(node) {
            rememberWindow(node.id, node.init);
        },
        "AssignmentExpression": function(node) {
            rememberWindow(node.left, node.right);
        },
        "CallExpression": function(node) {
            if (isInteresting(node) && !isValid(node)) {
                context.report(node, MESSAGE_TIMEOUT);
            }
        }
    };
};
