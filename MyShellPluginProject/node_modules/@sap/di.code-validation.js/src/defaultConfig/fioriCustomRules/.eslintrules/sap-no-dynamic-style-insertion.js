/**
 * @fileoverview Detect usage of document.styleSheets
 * @author Christopher Fenner
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
    var MSG = "Dynamic style insertion, use library CSS or lessifier instead";
    var WINDOW_OBJECTS = [];
    var DOCUMENT_OBJECTS = [];

    // --------------------------------------------------------------------------
    // Basic Helpers
    // --------------------------------------------------------------------------
    function isType(node, type) {
        return node && node.type === type;
    }

    function isIdentifier(node, value) {
        return isType(node, "Identifier") && (!value || node.name === value);
    }

    function isLiteral(node, value) {
        return isType(node, "Literal") && (!value || node.value === value);
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

    function rememberDocument(left, right) {
        if (isDocumentObject(right) && isIdentifier(left)) {
            DOCUMENT_OBJECTS.push(left.name);
            return true;
        }
        return false;
    }

    function isInteresting(node) {
        if (isMember(node)
                && isMember(node.object)
                && isDocumentObject(node.object.object)
                && (isIdentifier(node.object.property, "styleSheets") || isLiteral(
                        node.object.property, "styleSheets"))) {
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
                    || rememberDocument(node.id, node.init);
        },
        "AssignmentExpression": function(node) {
            return rememberWindow(node.left, node.right)
                    || rememberDocument(node.left, node.right);
        },
        "MemberExpression": function(node) {
            if (isInteresting(node)) {
                context.report(node, MSG);
            }
        }
    };
};
