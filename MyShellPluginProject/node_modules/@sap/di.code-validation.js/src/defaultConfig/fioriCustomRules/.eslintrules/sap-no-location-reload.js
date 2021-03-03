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
    var MSG = "location.reload() is not permitted.";
    var WINDOW_OBJECTS = [];
    var LOCATION_OBJECTS = [];
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
        // true if node is the global variable 'window'
        return node && isIdentifier(node) && node.name === "window";
    }

    function isWindowObject(node) {
        // true if node is the global variable 'window' or a reference to it
        return isWindow(node) || node && isIdentifier(node)
                && contains(WINDOW_OBJECTS, node.name);
    }

    function isLocation(node) {
        if (node) {
            if (isIdentifier(node)) {
                // true if node id the global variable 'location'
                return node.name === "location";
            } else if (isMember(node)) {
                // true if node id the global variable 'window.location' or '<windowReference>.location'
                return isWindowObject(node.object) && isLocation(node.property);
            }
        }
        return false;
    }

    function isLocationObject(node) {
        // true if node is the global variable 'location'/'window.location' or a reference to it
        return isLocation(node) || node && isIdentifier(node)
                && contains(LOCATION_OBJECTS, node.name);
    }

    function isInteresting(node) {
        var obj = node.callee;
        if (isMember(obj)) {
            if (isLocationObject(obj.object)) {
                // is member expression on location, check property
                return isIdentifier(obj.property)
                        && obj.property.name === "reload";
            } else {
                // no call on location
                return false;
            }
        }
        return false;
    }

    function isValid() {
        //        var args = node.arguments;
        //        return args
        //                && (args.length === 1 || args.length > 1
        //                        && (args[1].value === 0 || args[1].value === "0"));
        return false;
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
        "AssignmentExpression": function(node) {
            return rememberWindow(node.left, node.right)
                    || rememberLocation(node.left, node.right);
        },
        "CallExpression": function(node) {
            if (isInteresting(node) && !isValid(node)) {
                context.report(node, MSG);
            }
        }
    };
};
