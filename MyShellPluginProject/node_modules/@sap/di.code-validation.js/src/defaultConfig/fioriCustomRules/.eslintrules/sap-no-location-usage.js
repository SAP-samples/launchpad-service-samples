/**
 * @fileoverview Detect some warning for usages of (window.)document APIs
 * @author Christopher Fenner (C5224075)
 * @ESLint Version 0.14.0 / February 2016
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
    var MESSAGE_LOCATION_OVERR = "Override of location";
    var MESSAGE_LOCATION_ASSIGN = "Usage of location.assign()";
    var WINDOW_OBJECTS = [];
    var LOCATION_OBJECTS = [];
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

    function isLocation(node) {
        if (isIdentifier(node)) {
            // true if node id the global variable 'location'
            return node.name === "location";
        } else if (isMember(node)) {
            // true if node id the global variable 'window.location' or '<windowReference>.location'
            return isWindowObject(node.object) && isLocation(node.property);
        }
        return false;
    }

    function isLocationObject(node) {
        // true if node is the global variable 'location'/'window.location' or a reference to it
        return isLocation(node) || isIdentifier(node)
                && contains(LOCATION_OBJECTS, node.name);
    }

    // --------------------------------------------------------------------------
    // Helpers
    // --------------------------------------------------------------------------

    function checkAssignmentAgainstOverride(node) {
        var identifier = node.left;
        if (isLocation(identifier) // location = * || window.location = *
                || isLocationObject(identifier.object)) { // location.* = || window.location.* = || var l = location; l.* =
            context.report(node, MESSAGE_LOCATION_OVERR);
        }
    }

    function processMemberExpression(node) {
        if (isLocationObject(node.object) && node.property.name === "assign") {
            context.report(node, MESSAGE_LOCATION_ASSIGN);
        }
    }

    function rememberWindow(left, right) {
        if (isWindow(right) && isIdentifier(left)) {
            WINDOW_OBJECTS.push(left.name);
        }
    }

    function rememberLocation(left, right) {
        if (isLocationObject(right) && isIdentifier(left)) {
            LOCATION_OBJECTS.push(left.name);
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
                    || rememberLocation(node.id, node.init);
        },
        "AssignmentExpression": checkAssignmentAgainstOverride,
        "MemberExpression": processMemberExpression
    };
};
