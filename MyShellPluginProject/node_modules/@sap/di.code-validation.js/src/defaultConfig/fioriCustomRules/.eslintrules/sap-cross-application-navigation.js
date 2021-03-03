/**
 * @fileoverview Rule
 * @author Christopher Fenner - C5224075
 * @ESLint Version 0.24.x / November 2015
 */

// ------------------------------------------------------------------------------
// Rule Disablement
// ------------------------------------------------------------------------------
/* eslint-disable strict */
// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
module.exports = function(context) {
    "use strict";
    var MESSAGE = "Do not use a static list of cross-application navigation targets.";
    var VARIABLES = {};

    function isType(node, type) {
        return node && node.type === type;
    }
    function isObject(node) {
        return isType(node, "ObjectExpression");
    }
    function isMember(node) {
        return isType(node, "MemberExpression");
    }
    function isIdentifier(node) {
        return isType(node, "Identifier");
    }
    function isCall(node) {
        return isType(node, "CallExpression");
    }
    function isLogical(node) {
        return isType(node, "LogicalExpression");
    }
    function isLiteral(node) {
        return isType(node, "Literal");
    }
    function isProperty(node) {
        return isType(node, "Property");
    }

    function endsWith(string, suffix) {
        return typeof string === "string" && typeof suffix === "string"
                && string.indexOf(suffix, string.length - suffix.length) !== -1;
    }

    function getIdentifierPath(node) {
        if (isIdentifier(node)) {
            return node.name;
        } else if (isLiteral(node)) {
            return node.value;
        } else if (isMember(node)) {
            return getIdentifierPath(node.object) + "."
                    + getIdentifierPath(node.property);
        } else {
            return "";
        }
    }

    function getName(node) {
        if (isIdentifier(node)) {
            return node.name;
        } else if (isLiteral(node)) {
            return node.value;
        }
        return "";
    }

    function getProperty(node, key) {
        // check if node is an object, only objects have properties
        if (isObject(node)) {
            // iterate properties
            for (var i = 0; i < node.properties.length; i++) {
                var property = node.properties[i];
                // return property value if property key matches given key
                if (isProperty(property) && getName(property.key) === key) {
                    return property.value;
                }
            }
        }
        return "";
    }

    /*
     * Method checks the given node, if it's a method call with 'CrossApplicationNavigation' as the only argument.
     *
     * @param node - a CallExpression node
     **/
    function isGetServiceCall(node) {
        if (isCall(node)) {
            if (node.arguments && node.arguments.length === 1
                    && isLiteral(node.arguments[0])
                    && node.arguments[0].value === "CrossApplicationNavigation") {
                return true;
            }
        }
        return false;
    }

    /*
     * Method checks if the assignment node contains any interesting nodes. Can handle nested conditions.
     **/
    function isInterestingAssignment(node) {
        return isGetServiceCall(node) // var x = fgetService('CrossApplicationNavigation');
                // var x = fgetService && fgetService('CrossApplicationNavigation');
                || (isLogical(node) && (isInterestingAssignment(node.left) || isInterestingAssignment(node.right)));
    }

    function isInterestingCall(node) {
        var path = getIdentifierPath(node.callee);
        if (isCall(node) && endsWith(path, "toExternal")) {
            var callee = node.callee;
            if (isMember(callee)) {
                var object = callee.object;
                if (isGetServiceCall(object) || isIdentifier(object)
                        && VARIABLES[object.name]) {
                    return true;
                }
            }
        }
    }

    function isValid(node) {
        if (node && node.arguments && node.arguments.length > 0) {
            // get property target from first argument, get property shellHash from property target
            var shellHash = getProperty(
                    getProperty(node.arguments[0], "target"), "shellHash");
            // check if property shellHash has value '#'
            if (shellHash && getName(shellHash) === "#") {
                return true;
            }
        }
        return false;
    }

    return {
        "VariableDeclarator": function(node) {
            if (isInterestingAssignment(node.init)) {
                VARIABLES[node.id.name] = true;
            }
        },
        "AssignmentExpression": function(node) {
            if (isInterestingAssignment(node.right)) {
                VARIABLES[node.left.name] = true;
            }
        },
        "CallExpression": function(node) {
            if (isInterestingCall(node) && !isValid(node)) {
                context.report(node, MESSAGE);
            }
        }
    };
};
