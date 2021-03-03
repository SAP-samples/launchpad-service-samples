/**
 * @fileoverview Rule to detect absolute path to component
 * @author Christopher Fenner - C5224075
 * @ESLint Version 0.17.1 / April 2015
 */

// ------------------------------------------------------------------------------
// Rule Disablement
// ------------------------------------------------------------------------------
/* eslint-disable strict, max-depth */
// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
module.exports = function(context) {
    "use strict";

    var T_MEMBER = "MemberExpression";
    var T_ARRAY = "ArrayExpression";
    var T_IDENTIFIER = "Identifier";
    var T_OBJECT = "ObjectExpression";
    var T_PROPERTY = "Property";
    var P_METADATA = "metadata";
    var P_INCLUDES = "includes";
    //    var CALLEE_NAME = "sap.ui.core.UIComponent.extend";
    var ERR_MSG = "Value for metadata/includes must not be absolute (leading '/').";

    function getLiteralOrIdentifiertName(node) {
        var result = "";
        if (node.type === T_IDENTIFIER) {
            result = node.name;
        } else {
            result = node.value;
        }
        return result;
    }

    function getIdentifierPath(node) {
        var result = "";
        //        if (node) {
        switch (node.type) {
            case T_IDENTIFIER:
                result = node.name;
                break;
            case T_MEMBER:
                result = getIdentifierPath(node.object) + "."
                        + getLiteralOrIdentifiertName(node.property);
                break;
            default:
        }
        //        }
        return result;
    }

    // Search ObjectExpression to find certain property
    function getPropertyFromObjectExpression(node, propertyName) {
        // Check if node is of type object expression
        if (node && node.type === T_OBJECT) {
            // Get property list from object expression
            var propertyList = node.properties;
            // Go through the properties
            var property;
            for ( var key in propertyList) {
                // Check if element is of type we are looking for
                // all in one if-statement to reach code coverage
                if (propertyList.hasOwnProperty(key)
                        && (property = propertyList[key])
                        && property.type === T_PROPERTY
                        && getLiteralOrIdentifiertName(property.key) === propertyName) {
                    return property.value;
                    //                    }
                }
            }
        }
    }

    // Search options parameter
    function validateFunctionOptions(node) {
        if (node.arguments.length > 1) {
            // get options parameter (2nd)
            var options = node.arguments[1];
            // Get metadata data
            var metadata = getPropertyFromObjectExpression(options, P_METADATA);
            // Get includes data
            var includes = getPropertyFromObjectExpression(metadata, P_INCLUDES);
            // Check if includes type is array expression
            if (includes && includes.type === T_ARRAY) {
                // Get array elements
                var includesElements = includes.elements;
                var element;
                for ( var key in includesElements) {
                    // all in one if-statement to reach code coverage
                    if (includesElements.hasOwnProperty(key)
                            && (element = includesElements[key])
                            && getLiteralOrIdentifiertName(element)
                                    .indexOf("/") === 0) {
                        context.report(node, ERR_MSG);
                        //                        }
                    }
                }
            }
        }
    }

    function endsWith(string, suffix) {
        return string.indexOf(suffix, string.length - suffix.length) !== -1;
    }

    function processCallExpression(node) {
        var path = getIdentifierPath(node.callee);
        if (endsWith(path, "." + "extend")) {
            validateFunctionOptions(node);
        }
    }

    return {
        "CallExpression": processCallExpression
    };
};
