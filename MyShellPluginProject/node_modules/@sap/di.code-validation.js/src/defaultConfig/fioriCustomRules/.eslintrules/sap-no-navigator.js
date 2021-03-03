/**
 * @fileoverview Detect usage of navigator object
 * @author Christopher Fenner (C5224075)
 * @ESLint Version 0.24.0
 */

// ------------------------------------------------------------------------------
// Rule Disablement
// ------------------------------------------------------------------------------
/*eslint-disable complexity, max-depth */
/*eslint-disable global-strict*/
/*eslint-disable strict*/
// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
module.exports = function(context) {
    "use strict";
    var FORBIDDEN_NAVIGATOR_WINDOW = [
        "javaEnabled"
    ], FORBIDDEN_GLOB_EVENT = [
            "onload", "onunload", "onabort", "onbeforeunload", "onerror",
            "onhashchange", "onpageshow", "onpagehide", "onscroll", "onblur",
            "onchange", "onfocus", "onfocusin", "onfocusout", "oninput",
            "oninvalid", "onreset", "onsearch", "onselect", "onsubmit",
            "onresize"
    ];

    var FULL_BLACKLIST = FORBIDDEN_NAVIGATOR_WINDOW
            .concat(FORBIDDEN_GLOB_EVENT);
    FULL_BLACKLIST.push("back");

    var WINDOW_OBJECTS = [];
    var NAVIGATOR_OBJECTS = [];

    var MSG = "navigator usage is forbidden, use sap.ui.Device API instead"; // 28

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
    function isCall(node) {
        return isType(node, "CallExpression");
    }
    function contains(a, obj) {
        for (var i = 0; i < a.length; i++) {
            if (obj === a[i]) {
                return true;
            }
        }
        return false;
    }

    function getRightestMethodName(node) {
        var callee = node.callee;
        return isMember(callee) ? callee.property.name : callee.name;
    }

    function isWindow(node) {
        // true if node is the global variable 'window'
        return isIdentifier(node) && node.name === "window";
    }

    function isWindowObject(node) {
        // true if node is the global variable 'window' or a reference to it
        return isWindow(node) || isIdentifier(node)
                && contains(WINDOW_OBJECTS, node.name);
    }

    function isNavigator(node) {
        // true if node id the global variable 'navigator', 'window.navigator' or '<windowReference>.navigator'
        return isIdentifier(node) && node.name === "navigator"
                || isMember(node) && isWindowObject(node.object)
                && isNavigator(node.property);
    }

    function isNavigatorObject(node) {
        // true if node is the global variable 'navigator'/'window.navigator' or a reference to it
        return isNavigator(node) || isIdentifier(node)
                && contains(NAVIGATOR_OBJECTS, node.name);
    }

    function rememberWindow(left, right) {
        if (isWindowObject(right) && isIdentifier(left)) {
            WINDOW_OBJECTS.push(left.name);
            return true;
        }
        return false;
    }

    function rememberNavigator(left, right) {
        if (isNavigatorObject(right) && isIdentifier(left)) {
            NAVIGATOR_OBJECTS.push(left.name);
            return true;
        }
        return false;
    }

    // --------------------------------------------------------------------------
    // Public
    // --------------------------------------------------------------------------

    return {

        "VariableDeclarator": function(node) {
            return rememberWindow(node.id, node.init, node)
                    || rememberNavigator(node.id, node.init, node);
        },
        "AssignmentExpression": function(node) {
            return rememberWindow(node.left, node.right, node)
                    || rememberNavigator(node.left, node.right, node);
        },
        "MemberExpression": function(node) {
            if (isNavigatorObject(node.object)) {
                if (isCall(node.parent)) {
                    var methodName = getRightestMethodName(node.parent);
                    if (typeof methodName === "string"
                            && contains(FULL_BLACKLIST, methodName)) {
                        context.report(node, MSG);
                    }
                } else {
                    context.report(node, MSG);
                }
            }
        }
    };
};
