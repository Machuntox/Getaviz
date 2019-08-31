var canvasAnimationController = (function() {
	
    function initialize(setupConfig){
		application.transferConfigParams(setupConfig, controllerConfig);
		var cssLink = document.createElement("link");
		cssLink.type = "text/css";
		cssLink.rel = "stylesheet";
		cssLink.href = "scripts/CanvasClick/animation.css";
		document.getElementsByTagName("head")[0].appendChild(cssLink);	
    }
	
	//config parameters	
	var controllerConfig = {

	};
	
	function activate(){
		
	}
	
	function reset(){

	}
	
	

    return {
        initialize: initialize,
		activate: activate,
		reset: reset
    };    
})();
