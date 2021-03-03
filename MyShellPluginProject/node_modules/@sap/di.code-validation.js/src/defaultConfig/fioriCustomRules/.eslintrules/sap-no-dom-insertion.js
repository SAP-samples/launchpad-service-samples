/**
 * @fileoverview Detect direct DOM insertion
 * @author Christopher Fenner, C5224075
 * @ESLint Version 0.22.1 / June 2015
 */

// ------------------------------------------------------------------------------
// Rule Disablement
// ------------------------------------------------------------------------------
/*eslint-disable strict*/
// ------------------------------------------------------------------------------
// Invoking global form of strict mode syntax for whole script
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
module.exports = function(context) {
    "use strict";

    var MESSAGE_DOM_INSERTION = "Direct DOM insertion is forbidden!";
    var FORBIDDEN_DOM_INSERTION = [
            "insertBefore", "appendChild", "replaceChild"
    ], FORBIDDEN_DOM_JQUERY_INSERTION = [
            "after", "before", "insertAfter", "insertBefore", "append",
            "prepend", "appendTo", "prependTo"
    ];
    var FULL_BLACKLIST = [].concat(FORBIDDEN_DOM_INSERTION,
            FORBIDDEN_DOM_JQUERY_INSERTION);

    //    var FORBIDDEN_DOCUMENT_OBJECT = [], FORBIDDEN_JQUERY_OBJECT = [];

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
    //    function isCall(node) {
    //        return isType(node, "CallExpression");
    //    }
    //    function isCondition(node) {
    //        return isType(node, "IfStatement") || isType(node, "ConditionalExpression");
    //    }
    //    function isUnary(node) {
    //        return isType(node, "UnaryExpression");
    //    }
    //    function isLiteral(node) {
    //        return isType(node, "Literal");
    //    }

    //    function contains(a, obj) {
    //        for (var i = 0; i < a.length; i++) {
    //            if (obj === a[i]) {
    //                return true;
    //            }
    //        }
    //        return false;
    //    }

    //    function isDomAccess(methodName) {
    //        return contains(FORBIDDEN_DOM_ACCESS, methodName);
    //    }

    //    function isDocument(node, justDocument) {
    //        if (isIdentifier(node)) {
    //            return node.name === "document"
    //                    || (!justDocument && contains(FORBIDDEN_DOCUMENT_OBJECT,
    //                            node.name));
    //        } else if (isMember(node)) {
    //            return isWindow(node.object) && isIdentifier(node.property)
    //                    && isDocument(node.property, true);
    //        }
    //        return false;
    //    }

    /*
        function processVariableDeclarator(node) {
            if (node.init) {
                if (isMember(node.init)) {
                    var firstElement = node.init.object.name, secondElement = node.init.property.name;

                    if (firstElement + "." + secondElement === "window.document") {
                        FORBIDDEN_DOCUMENT_OBJECT.push(node.id.name);
                    } else if (firstElement + "." + secondElement === "window.history") {
                        FORBIDDEN_HISTORY_OBJECT.push(node.id.name);
                    } else if (firstElement + "." + secondElement === "window.location") {
                        FORBIDDEN_LOCATION_OBJECT.push(node.id.name);
                    } else if (firstElement + "." + secondElement === "window.screen") {
                        FORBIDDEN_SCREEN_OBJECT.push(node.id.name);
                    } else if ((secondElement === "body")
                            && (node.init.object.property)) {
                        firstElement = node.init.object.property.name;
                        if (firstElement + "." + secondElement === "document.body") {
                            context.report(node, MESSAGE_WINDOW_USAGES);
                            FORBIDDEN_BODY_OBJECT.push(node.id.name);
                        }
                    }
                } else if (isIdentifier(node.init)
                        && (node.init.name === "document")) {
                    FORBIDDEN_DOCUMENT_OBJECT.push(node.id.name);
                } else if (isIdentifier(node.init) && (node.init.name === "screen")) {
                    FORBIDDEN_SCREEN_OBJECT.push(node.id.name);
                } else if (isIdentifier(node.init)
                        && (node.init.name === "location")) {
                    FORBIDDEN_LOCATION_OBJECT.push(node.id.name);
                } else if (isIdentifier(node.init)
                        && (node.init.name === "history")) {
                    FORBIDDEN_HISTORY_OBJECT.push(node.id.name);
                }
            }
        }
    function isForbiddenObviousApi(calleePath) {
        var elementArray = calleePath.split(".");
        var lastElement = elementArray[elementArray.length - 1];
        return lastElement;
    }
        function checkAssignmentAgainstOverride(node) {
            var identifier = node.left;
            if (isLocation(identifier)) { // location
                context.report(node, MESSAGE_LOCATION_OVERR);
            } else if (isMember(identifier)) {
                if (isIdentifier(identifier.property)
                        && identifier.property.name === "href") {
                    if (isLocation(identifier.object)) { // location.href
                        context.report(node, MESSAGE_LOCATION_OVERR);
                    } else if (isMember(identifier.object)
                            && isWindow(identifier.object.object)
                            && isLocation(identifier.object.property, true)) { // window.location.href
                        context.report(node, MESSAGE_LOCATION_OVERR);
                    }
                } else if (isWindow(identifier.object)
                        && isLocation(identifier.property, true)) { // window.location
                    context.report(node, MESSAGE_LOCATION_OVERR);
                }
            }
        }
    */

    function processDomInsertion(node) {
        var callee = node.callee;
        if (isMember(callee)) {
            // process window.history.back() | history.forward() | var h = history; h.go()
            if (/*isHistory(callee.object) && */isIdentifier(callee.property)) {
                if (FULL_BLACKLIST.indexOf(callee.property.name) > -1) {
                    context.report(node, MESSAGE_DOM_INSERTION);
                    //                    console.log("found one.. " + context.getSource(node));
                }
            }
            // ELSE:
            // TODO: check if node.callee is identifier and identifier is a reference to history.back / .go / .forward
            // processing var go = history.go; go();
        }
    }

    // --------------------------------------------------------------------------
    // Public
    // --------------------------------------------------------------------------

    return {
        "CallExpression": function(node) {
            processDomInsertion(node);
        }
    };
};
