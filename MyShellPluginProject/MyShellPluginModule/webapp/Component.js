sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/m/Dialog",
	"sap/m/Text",
	"sap/m/Button"
], function (UIComponent,Dialog,Text,Button) {
	"use strict";

	return UIComponent.extend("ns.MyShellPluginModule.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
            var rendererPromise = this._getRenderer();
            rendererPromise.then(function(oRenderer) {
            	oRenderer.addHeaderItem({
            		icon: "sap-icon://add",
            		tooltip: "Add bookmark",
            		press: function() {
            			var oDialog = new Dialog({
            				contentWidth: "25rem",
            				title: "Whats new",
            				type: "Message",
            				content: new Text({
            					text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            				}),
            				beginButton: new Button({
            					type: "Emphasized",
            					text: "Ok",
            					press: function() {
            						oDialog.close();
            					}
            				}),
            				afterClose: function() {
            					oDialog.destroy();
            				}
            			});
            			oDialog.open();
            		}
            	})
            })
		},

		_getRenderer: function () {
			var that = this,
				oDeferred = new jQuery.Deferred(),
				oRenderer;


			that._oShellContainer = jQuery.sap.getObject("sap.ushell.Container");
			if (!that._oShellContainer) {
				oDeferred.reject(
					"Illegal state: shell container not available; this component must be executed in a unified shell runtime context.");
			} else {
				oRenderer = that._oShellContainer.getRenderer();
				if (oRenderer) {
					oDeferred.resolve(oRenderer);
				} else {
					// renderer not initialized yet, listen to rendererCreated event
					that._onRendererCreated = function (oEvent) {
						oRenderer = oEvent.getParameter("renderer");
						if (oRenderer) {
							oDeferred.resolve(oRenderer);
						} else {
							oDeferred.reject("Illegal state: shell renderer not available after recieving 'rendererLoaded' event.");
						}
					};
					that._oShellContainer.attachRendererCreatedEvent(that._onRendererCreated);
				}
			}
			return oDeferred.promise();
		}


	});
});