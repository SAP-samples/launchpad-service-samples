/**
 * @fileoverview Check "sap-ui5-no-private-prop" should detect the usage of private properties and functions of UI5 elements
 * @author Christopher Fenner - C5224075
 * @ESLint Version 0.17.1 / April 2015
 */

// ------------------------------------------------------------------------------
// Rule Disablement
// ------------------------------------------------------------------------------
/*eslint-disable strict*/
// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
module.exports = function(context) {
    "use strict";
    var MSG = "Usage of a private property or function from UI5 element.";
    function uniquifyArray(array) {
        var a = array.concat();
        for (var i = 0; i < a.length; ++i) {
            for (var j = i + 1; j < a.length; ++j) {
                if (a[i] === a[j]) {
                    a.splice(j--, 1);
                }
            }
        }
        return a;
    }
    var customNS = context.options[0] && context.options[0].ns
            ? context.options[0].ns
            : [];
    var configuration = {
        "ns": uniquifyArray([
                "sap.ui.core", "sap.apf", "sap.ca.scfld.md", "sap.ca.ui",
                "sap.chart", "sap.collaboration", "sap.fiori", "sap.landvisz",
                "sap.m", "sap.makit", "sap.me", "sap.ndc", "sap.ovp",
                "sap.portal.ui5", "sap.suite.ui.commons",
                "sap.suite.ui.generic.template", "sap.suite.ui.microchart",
                "sap.tnt", "sap.ui.commons", "sap.ui.comp", "sap.ui.dt",
                "sap.ui.fl", "sap.ui.generic.app", "sap.ui.generic.template",
                "sap.ui.layout", "sap.ui.richtexteditor", "sap.ui.rta",
                "sap.ui.server.abap", "sap.ui.server.java", "sap.ui.suite",
                "sap.ui.table", "sap.ui.unified", "sap.ui.ux3", "sap.ui.vbm",
                "sap.ui.vk", "sap.uiext.inbox", "sap.ushell", "sap.uxap",
                "sap.viz"
        ].concat(customNS))
    };

    var X_CALL = "CallExpression";
    var X_MEMBER = "MemberExpression";
    var X_NEW = "NewExpression";
    var X_IDENTIFIER = "Identifier";
    var X_LITERAL = "Literal";
    var VARIABLES = {};

    function isType(node, type) {
        return node && node.type === type;
    }
    function isIdentifier(node) {
        return isType(node, "Identifier");
    }
    function isCall(node) {
        return isType(node, "CallExpression");
    }

    function startsWith(s, sub) {
        return typeof s === "string" && typeof sub === "string"
                && s.substring(0, sub.length) === sub;
    }

    function getLiteralOrIdentifiertName(node) {
        var result = "";
        switch (node.type) {
            case X_IDENTIFIER:
                result = node.name;
                break;
            case X_LITERAL:
                result = node.value;
                break;
            default:
        }
        return result;
    }

    function getIdentifierPath(node) {
        var result = "";
        if (node) {
            switch (node.type) {
                case X_IDENTIFIER:
                    result = node.name;
                    break;
                case X_MEMBER:
                    result = getIdentifierPath(node.object) + "."
                            + getLiteralOrIdentifiertName(node.property);
                    break;
                case X_NEW:
                    result = getIdentifierPath(node.callee);
                    break;
                case X_CALL:
                    result = getIdentifierPath(node.callee) + "().";
                    break;
                default:
            }
        }
        return result;
    }

    // Method resolved IdentifierNames with known variables
    function resolveIdentifierPath(path) {
        var parts = path.split(".");
        var substitute = false;
        // check if current identifier is remembered as an intresting variable
        for ( var name in VARIABLES) {
            if (name === parts[0]) {
                // get last stored variable value
                substitute = VARIABLES[name].slice(-1).pop();
            }
        }
        // if so, replace current identifier with its value
        if (substitute) {
            parts[0] = substitute;
            path = parts.join(".");
        }
        return path;
    }
    function isIntrestingPath(path) {
        var i, options = configuration.ns;
        for (i = 0; i < options.length; i++) {
            if (startsWith(path, options[i])
                    && (path.length === options[i].length || path[options[i].length] === ".")) {
                return true;
            }
        }
        return false;
    }

    function rememberIntrestingVariable(node, name) {
        if (typeof VARIABLES[node.id.name] === "undefined") {
            VARIABLES[node.id.name] = [];
        }
        VARIABLES[node.id.name].push(name);
    }

    function processVariableDeclarator(node) {
        var path = getIdentifierPath(node.init);
        path = resolveIdentifierPath(path);
        // if declaration is intresting, remember identifier and resolved value
        if (isIntrestingPath(path)) {
            rememberIntrestingVariable(node, path);
        }
    }

    function hasUnderscore(identifier) {
        return identifier !== "_" && (identifier[0] === "_");
    }

    function isSpecialCaseIdentifierForMemberExpression(identifier) {
        return identifier === "__proto__";
    }

    return {
        "VariableDeclarator": processVariableDeclarator,
        // "AssignmentExpression": function(node) {},
        "MemberExpression": function(node) {
            var identifier = node.property.name;

            if (typeof identifier !== "undefined"
            // && hasUnderscore(identifier)
            && !isSpecialCaseIdentifierForMemberExpression(identifier)) {
                var parent = context.getAncestors().pop();
                switch (parent.type) {
                    case "ExpressionStatement":
                    case "AssignmentExpression":
                    case "CallExpression":
                        var path = getIdentifierPath(node);
                        path = resolveIdentifierPath(path);
                        if (isIntrestingPath(path)
                                && isIdentifier(node.property)
                                && (!isCall(node.parent) || hasUnderscore(node.property.name))) {
                            context
                                    .report(node, MSG);
                        }
                        break;
                    default:
                }
            }
        }
    };
};
