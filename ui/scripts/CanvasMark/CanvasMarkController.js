var canvasMarkController = (function() {
    
	 
	let SELECTION_MODES = {
		UP 			: "UP",
		DOWN 		: "DOWN",
		DURATION	: "DURATION"
	};
	
	//config parameters	
	var controllerConfig = {
		setCenterOfRotation : false,
        markingColor: "green",
    	selectionMouseKey: 2,
		selectionMode: SELECTION_MODES.UP,
		selectionDurationSeconds: 0.5,
		selectionMoveAllowed: false,
		showProgressBar: false,
	};

	let downActionEventObject;
    
	function initialize(setupConfig){	

		application.transferConfigParams(setupConfig, controllerConfig);	
			
    }	
				
	function activate(){  

		actionController.actions.mouse.key[controllerConfig.selectionMouseKey].down.subscribe(downAction); // pushing rightclick -> activate
		actionController.actions.mouse.key[controllerConfig.selectionMouseKey].up.subscribe(upAction); //  removing finger vom righclick -> activate
		actionController.actions.mouse.key[controllerConfig.selectionMouseKey].during.subscribe(duringAction); // long click for duration -> activate
		actionController.actions.mouse.move.subscribe(mouseMove);	

		events.marked.on.subscribe(onEntityMarked);
		events.marked.off.subscribe(onEntityUnmarked); 
    }
		
	function reset(){
		let markedEntities = events.marked.getEntities();
		
		canvasManipulator.resetColorOfEntities(markedEntities);	
	}




	function downAction(eventObject, timestamp){

		downActionEventObject = null;

		if(!eventObject.entity){
			return;
		}

		if(controllerConfig.selectionMode === "DOWN"){
			handleOnClick(eventObject);
			return;
		}
		
		downActionEventObject = eventObject;

		if(controllerConfig.selectionMode === "DURATION" && controllerConfig.showProgressBar){
			showProgressBar(eventObject);
		}
	}

	function upAction(eventObject){

		if(!downActionEventObject){
			return;
		}

		if(controllerConfig.selectionMode === "UP"){
			handleOnClick(downActionEventObject);
			return;
		}

		if(controllerConfig.selectionMode === "DURATION" && controllerConfig.showProgressBar){
			hideProgressBar();
		}
	}

	function duringAction(eventObject, timestamp, timeSinceStart){

		if(!downActionEventObject){
			return;
		}

		if(controllerConfig.selectionMode !== "DURATION"){
			return;
		}

		if(timeSinceStart > ( 1000 * controllerConfig.selectionDurationSeconds)){
			hideProgressBar();
			handleOnClick(downActionEventObject);
			downActionEventObject = null;
		}
	}

	function mouseMove(eventObject, timestamp){
		if(!downActionEventObject){
			return;
		}

		if(!controllerConfig.selectionMoveAllowed){
			hideProgressBar();
			downActionEventObject = null;
		}
	}


	function handleOnClick(eventObject) {            
				
		let applicationEvent = {
			sender: canvasMarkController,
			entities: [eventObject.entity]
		};
		
		if(eventObject.entity.marked){
			events.marked.off.publish(applicationEvent);		
		} else {
			events.marked.on.publish(applicationEvent);		
		}	

		//center of rotation
		if(controllerConfig.setCenterOfRotation){
			canvasManipulator.setCenterOfRotation(eventObject.entity);
		}
	}





	function onEntityMarked(applicationEvent) {
		let entity = applicationEvent.entities[0];
		
		if(entity.hovered){
			canvasManipulator.unhighlightEntities([entity]);			
		}
		canvasManipulator.changeColorOfEntities([entity], controllerConfig.markingColor);
	}

	function onEntityUnmarked(applicationEvent) {
		let entity = applicationEvent.entities[0];
		canvasManipulator.resetColorOfEntities([entity]);	
	}



	function showProgressBar(eventObject){
		
		let canvas = document.getElementById("canvas");
		
		let progressBarDivElement = document.createElement("DIV");
		progressBarDivElement.id = "progressBarDiv";
		
		canvas.appendChild(progressBarDivElement);

		let progressBar = $('#progressBarDiv');

		progressBar.jqxProgressBar({ 
			width: 				250, 
			height: 			30, 
			value: 				100, 
			animationDuration: 	controllerConfig.selectionDurationSeconds * 1000, 
			template: 			"success"
		});


		progressBar.css("top", eventObject.layerY + 10 + "px");
        progressBar.css("left", eventObject.layerX + 10 +  "px");

		progressBar.css("z-index", "1");
		progressBar.css("position", "absolute");

		progressBar.css("width", "250px");	
		progressBar.css("height", "30px");	

		progressBar.css("display", "block");

	}

	function hideProgressBar(){		
		
		let progressBarDivElement = document.getElementById("progressBarDiv");

		if(!progressBarDivElement){
			return;
		}	

		let canvas = document.getElementById("canvas");
		canvas.removeChild(progressBarDivElement);
	}
		

    return {
        initialize			: initialize,
		reset				: reset,
		activate			: activate,
		onEntityMarked		: onEntityMarked,
		onEntityUnmarked	: onEntityUnmarked,
		SELECTION_MODES		: SELECTION_MODES
    };    
})();