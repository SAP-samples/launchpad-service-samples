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
    var MSG = "Direct history manipulation, does not work with deep links, use router and navigation events instead";
    var WINDOW_OBJECTS = [];
    var HISTORY_OBJECTS = [];
    //    var INTERESTING_HISTORY_METHODS = [
    //            "forward", "back", "go"
    //    ];

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
    function isCondition(node) {
        return isType(node, "IfStatement")
                || isType(node, "ConditionalExpression");
    }
    function isUnary(node) {
        return isType(node, "UnaryExpression");
    }
    function isLiteral(node) {
        return isType(node, "Literal");
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

    function isHistory(node) {
        if (node) {
            if (isIdentifier(node)) {
                // true if node id the global variable 'history'
                return node.name === "history";
            } else if (isMember(node)) {
                // true if node id the global variable 'window.history' or '<windowReference>.history'
                return isWindowObject(node.object) && isHistory(node.property);
            }
        }
        return false;
    }

    function isHistoryObject(node) {
        // true if node is the global variable 'document'/'window.history' or a reference to it
        return isHistory(node) || node && isIdentifier(node)
                && contains(HISTORY_OBJECTS, node.name);
    }

    function isInCondition(node, maxDepth) {
        // we check the depth here because the call might be nested in a block statement and in an expression statement (http://jointjs.com/demos/javascript-ast)
        // (true?history.back():''); || if(true) history.back(); || if(true){history.back();} || if(true){}else{history.back();}
        if (maxDepth > 0) {
            var parent = node.parent;
            return isCondition(parent) || isInCondition(parent, maxDepth - 1);
        }
        return false;
    }

    function isMinusOne(node) {
        return isUnary(node) && node.operator === "-"
                && isLiteral(node.argument) && node.argument.value === 1;
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

    function rememberHistory(left, right) {
        if (isHistoryObject(right) && isIdentifier(left)) {
            HISTORY_OBJECTS.push(left.name);
            return true;
        }
        return false;
    }

    function isInteresting(node) {
        // check if callee is ref to history.back / .go / .forward
        if (node && isMember(node.callee)
                && isHistoryObject(node.callee.object)
                && isIdentifier(node.callee.property)) {
            return true;
        }
        return false;
    }

    function isValid(node) {
        switch (node.callee.property.name) {
            case "forward":
                return false;
            case "back":
                return isInCondition(node, 3);
            case "go":
                var args = node.arguments;
                return args.length === 1 && isMinusOne(args[0])
                        && isInCondition(node, 3);
            default:
        }
        return true;
    }

    // --------------------------------------------------------------------------
    // Public
    // --------------------------------------------------------------------------
    return {
        "CallExpression": function(node) {
            if (isInteresting(node) && !isValid(node)) {
                context.report(node, MSG);
            }
        },
        "VariableDeclarator": function(node) {
            return rememberWindow(node.id, node.init)
                    || rememberHistory(node.id, node.init);
        },
        "AssignmentExpression": function(node) {
            return rememberWindow(node.left, node.right)
                    || rememberHistory(node.left, node.right);
        }
    };
};
