/**
 * @fileoverview Detect some warning for usages of (window.)document APIs
 * @author Achref Kilani Jrad
 * @ESLint          Version 0.14.0 / February 2015
 */

// ------------------------------------------------------------------------------
// Rule Disablement
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// Invoking global form of strict mode syntax for whole script
// ------------------------------------------------------------------------------
/*eslint-disable strict*/
// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
module.exports = function(context) {
    "use strict";
    var MSG = "Global selection modification, only modify local selections";
    var WINDOW_OBJECTS = [];
    var FORBIDDEN_METHODS = [
        "getSelection"
    ];

    // --------------------------------------------------------------------------
    // Basic Helpers
    // --------------------------------------------------------------------------
    function isType(node, type) {
        return node && node.type === type;
    }

    function isIdentifier(node) {
        return isType(node, "Identifier");
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
        // true if node is the global variable 'window'
        return node && isIdentifier(node) && node.name === "window";
    }

    function isWindowObject(node) {
        // true if node is the global variable 'window' or a reference to it
        return isWindow(node) || node && isIdentifier(node)
                && contains(WINDOW_OBJECTS, node.name);
    }

    // --------------------------------------------------------------------------
    // Helpers
    // --------------------------------------------------------------------------
    function rememberWindow(left, right) {
        if (isWindowObject(right) && isIdentifier(left)) {
            WINDOW_OBJECTS.push(left.name);
            return true;
        }
        return false;
    }

    // --------------------------------------------------------------------------
    // Public
    // --------------------------------------------------------------------------
    return {
        "VariableDeclarator": function(node) {
            return rememberWindow(node.id, node.init);
        },
        "AssignmentExpression": function(node) {
            return rememberWindow(node.left, node.right);
        },
        "MemberExpression": function(node) {
            if (node && isWindowObject(node.object)
                    && isIdentifier(node.property)
                    && contains(FORBIDDEN_METHODS, node.property.name)) {
                context.report(node, MSG);
            }
        }
    };
};
