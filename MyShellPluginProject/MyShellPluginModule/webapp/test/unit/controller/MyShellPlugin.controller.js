/*global QUnit*/

sap.ui.define([
	"ns/MyShellPluginModule/controller/MyShellPlugin.controller"
], function (Controller) {
	"use strict";

	QUnit.module("MyShellPlugin Controller");

	QUnit.test("I should test the MyShellPlugin controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
