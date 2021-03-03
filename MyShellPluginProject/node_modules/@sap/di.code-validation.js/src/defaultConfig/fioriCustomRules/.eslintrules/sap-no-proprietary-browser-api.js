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
    var MSG = "Proprietary Browser API access, use jQuery selector instead";
    var WINDOW_OBJECTS = [];
    var DOCUMENT_OBJECTS = [];
    var BODY_OBJECTS = [];
    var SCREEN_OBJECTS = [];
    var FORBIDDEN_WINDOW_PROPERTIES = [
            "innerWidth", "innerHeight"
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
        return node && isIdentifier(node) && node.name === "window";
    }

    function isWindowObject(node) {
        // true if node is the global variable 'window' or a reference to it
        return isWindow(node) || node && isIdentifier(node)
                && contains(WINDOW_OBJECTS, node.name);
    }

    function isScreen(node) {
        //        console.log("isScreen");
        if (node) {
            if (isIdentifier(node)) {
                // true if node id the global variable 'screen' console.log("identifier");
                return node.name === "screen";
            } else if (isMember(node)) {
                // true if node id the global variable 'window.document' or '<windowReference>.document' console.log("member");
                return isWindowObject(node.object) && isScreen(node.property);
            }
        }
        return false;
    }

    function isScreenObject(node) {
        // true if node is the global variable 'screen'/'window.screen' or a reference to it
        return isScreen(node) || node && isIdentifier(node)
                && contains(SCREEN_OBJECTS, node.name);
    }

    function isDocument(node) {
        if (node) {
            if (isIdentifier(node)) {
                // true if node id the global variable 'document'
                return node.name === "document";
            } else if (isMember(node)) {
                // true if node id the global variable 'window.document' or '<windowReference>.document'
                return isWindowObject(node.object) && isDocument(node.property);
            }
        }
        return false;
    }

    function isDocumentObject(node) {
        // true if node is the global variable 'document'/'window.document' or a reference to it
        return isDocument(node) || node && isIdentifier(node)
                && contains(DOCUMENT_OBJECTS, node.name);
    }

    function isBody(node) {
        if (node && isMember(node)) {
            return isDocumentObject(node.object) && isIdentifier(node.property)
                    && node.property.name === "body";
        }
        return false;
    }

    function isBodyObject(node) {
        return isBody(node) || node && isIdentifier(node)
                && contains(BODY_OBJECTS, node.name);
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

    function rememberScreen(left, right) {
        if (isScreenObject(right) && isIdentifier(left)) {
            SCREEN_OBJECTS.push(left.name);
            return true;
        }
        return false;
    }

    function rememberDocument(left, right) {
        if (isDocumentObject(right) && isIdentifier(left)) {
            DOCUMENT_OBJECTS.push(left.name);
            return true;
        }
        return false;
    }

    function rememberBody(left, right, parent) {
        if (isBodyObject(right) && isIdentifier(left)) {
            BODY_OBJECTS.push(left.name);
            // raise an issue if the the body property is assigned to a variable
            context.report(parent, MSG);
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
                    || rememberScreen(node.id, node.init)
                    || rememberDocument(node.id, node.init)
                    || rememberBody(node.id, node.init, node);
        },
        "AssignmentExpression": function(node) {
            return rememberWindow(node.left, node.right)
                    || rememberScreen(node.left, node.right)
                    || rememberDocument(node.left, node.right)
                    || rememberBody(node.left, node.right, node);
        },
        "MemberExpression": function(node) {
            if (isBodyObject(node.object)) {
                // report if there is any call of a document.body child (e.g. document.body.appendChild())
                context.report(node, MSG);
            } else if (isScreenObject(node.object)) {
                // report if there is any call of a window.screen child (e.g. window.screen.appendChild())
                context.report(node, MSG);
            } else if (isWindowObject(node.object)) {
                if (isIdentifier(node.property)
                        && contains(FORBIDDEN_WINDOW_PROPERTIES,
                                node.property.name)) {
                    context.report(node, MSG);
                }
            }
        }
    };
};
