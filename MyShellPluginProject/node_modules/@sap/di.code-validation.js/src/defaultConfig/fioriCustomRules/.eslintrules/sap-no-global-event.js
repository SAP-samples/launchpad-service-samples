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
    var MSG = "Global event handling override is not permitted, please modify only single events";
    var WINDOW_OBJECTS = [];
    var EVENT_OBJECTS = [];
    var FORBIDDEN_GLOBAL_EVENT = [
            "onload", "onunload", "onabort", "onbeforeunload", "onerror",
            "onhashchange", "onpageshow", "onpagehide", "onscroll", "onblur",
            "onchange", "onfocus", "onfocusin", "onfocusout", "oninput",
            "oninvalid", "onreset", "onsearch", "onselect", "onsubmit",
            "onresize"
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

    function isEvent(node) {
        return node && isMember(node) && isWindowObject(node.object)
                && isIdentifier(node.property)
                && node.property.name === "event";
    }

    function isEventObject(node) {
        return isEvent(node) || node && isIdentifier(node)
                && contains(EVENT_OBJECTS, node.name);
    }

    // --------------------------------------------------------------------------
    // Helpers
    // --------------------------------------------------------------------------

    function isAssignTarget(node) {
        return node && node.parent.type === "AssignmentExpression"
                && (node.parent.left === node);
    }

    function processMemberExpression(node) {
        if (isAssignTarget(node) && isIdentifier(node.property)) {
            if (isWindowObject(node.object)
                    && contains(FORBIDDEN_GLOBAL_EVENT, node.property.name)) {
                context.report(node, MSG);
            } else if (isEventObject(node.object)
                    && (node.property.name === "returnValue" || node.property.name === "cancelBubble")) {
                context.report(node, MSG);
            }
        }
    }

    function rememberWindow(left, right) {
        if (isWindowObject(right) && isIdentifier(left)) {
            WINDOW_OBJECTS.push(left.name);
            return true;
        }
        return false;
    }

    function rememberEvent(left, right) {
        if (isEventObject(right) && isIdentifier(left)) {
            EVENT_OBJECTS.push(left.name);
            return true;
        }
        return false;
    }

    // --------------------------------------------------------------------------
    // Public
    // --------------------------------------------------------------------------
    return {
        "VariableDeclarator": function(node) {
            return rememberWindow(node.id, node.init)
                    || rememberEvent(node.id, node.init);
        },
        "AssignmentExpression": function(node) {
            return rememberWindow(node.left, node.right)
                    || rememberEvent(node.left, node.right);
        },
        "MemberExpression": processMemberExpression
    };
};
