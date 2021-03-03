/**
 * @fileoverview Detect the definition of global properties in the window object
 * @author Christopher Fenner (C5224075) - 02/2016
 * @ESLint Version 0.24.0
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
    var MSG = "Usage of a forbidden window property.";
    var WINDOW_OBJECTS = [];
    var FORBIDDEN_PROPERTIES = [
            "top", "addEventListener"
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

    function isLiteral(node) {
        return isType(node, "Literal");
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
        // true if node is the global variable 'window'
        return isIdentifier(node) && node.name === "window";
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

    function isInteresting(node) {
        return isMember(node) && isWindowObject(node.object);
    }

    function isValid(node) {
        var method = "";
        if (isIdentifier(node.property)) {
            method = node.property.name;
        }
        if (isLiteral(node.property)) {
            method = node.property.value;
        }
        return !contains(FORBIDDEN_PROPERTIES, method);
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
            if (isInteresting(node) && !isValid(node)) {
                context.report(node, MSG);
            }
        }
    };
};
