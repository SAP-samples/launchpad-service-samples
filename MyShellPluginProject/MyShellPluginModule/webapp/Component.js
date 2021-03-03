//Boostrap Google Analytics
(function(i, s, o, g, r, a, m) {
	i['GoogleAnalyticsObject'] = r;
	i[r] = i[r] || function() {
		(i[r].q = i[r].q || []).push(arguments)
	}, i[r].l = 1 * new Date();
	a = s.createElement(o), m = s.getElementsByTagName(o)[0];
	a.async = 1;
    a.src = g;
    a.crossorigin= "anonymous";
	m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

sap.ui.define([
	"sap/ui/core/UIComponent"
], function (UIComponent) {
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
            UIComponent.prototype.init.apply(this, arguments);
            this.initGoogleAnalytics();
		},

        initGoogleAnalytics: function() {
			//Get GA tracking ID from Portal configuration
			var trackingID = "UA-184478963-5";
            //Initalize the tracker
            ga('create', trackingID, 'auto');
            this.registerPortalSiteNavigationEvents();
		},
		
		registerPortalSiteNavigationEvents: function(){
			//Track app and page navigation events
            var AppLifeCycle = sap.ushell.Container.getService("AppLifeCycle");
            AppLifeCycle.attachAppLoaded(function(oEvent){
                var oParameters = oEvent.getParameters();
                oParameters.getIntent().then(function(event){
                    var sSenanticObject = event.semanticObject;
                    ga('send', 'pageview', {
						'page': sSenanticObject
					});
                });
                
            }.bind(this));
        }
	});
});