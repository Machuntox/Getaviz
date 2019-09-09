var aframeCanvasAnimationController
 = (function() {
    	
    function initialize(setupConfig){
		application.transferConfigParams(setupConfig, controllerConfig);
    }

    let animationMode = {
		scale : "scale",
		color : "color",
		position : "position",
		rotation : "rotation",
		false: false
	}

	// config parameters | change them to your preferences
	var controllerConfig = {
		// hover
        hoverTime : 2000, // 1000 = 1s
        hoverColor : "#000000", // must be hexcode
		hoverScale : '2 2 2', // 'X-axis, Y-axis, Z-axis' | 2 -> double in scale
		hoverPosition: '5 5 5', //  'X-axis, Y-axis, Z-axis'
		hoverRotation: '0 360 0', // 'X-axis, Y-axis, Z-axis' | number means degrees of rotation
		// select (leftclick)
		selectTime : 2000,
        selectColor : "#ffffff", 
		selectScale : '2 2 2', 
		selectPosition: '5 5 5',
		selectRotation: '0 360 0',
		// mark (rightclick)
		markTime : 2000,
        markColor : "#ffffff", 
		markScale : '2 2 2', 
		markPosition: '5.9 30.4 5',
		markRotation: '0 360 0',
		hoverAnimation : animationMode.position,
		selectAnimation : animationMode.color,
		markAnimation : animationMode.rotation,

		// down change these!
		markMouseKey: 2,
		selectionMouseKey: 1
    };
	
	function activate(){
		// active hoverAnimation
		actionController.actions.mouse.hover.subscribe(handleOnMouseEnter); // hover
		actionController.actions.mouse.unhover.subscribe(handleOnMouseLeave); // unhover
		events.hovered.on.subscribe(onEntityHover); 
		events.hovered.off.subscribe(onEntityUnhover); 

		// activate selectAnimation
		actionController.actions.mouse.key[controllerConfig.selectionMouseKey].down.subscribe(selectAction); // mouse leftclick -> activate
		events.selected.on.subscribe(onEntitySelected);
		events.selected.off.subscribe(onEntityUnselected);

		//activate markAnimation
		actionController.actions.mouse.key[controllerConfig.markMouseKey].down.subscribe(markAction); // mouse rightclick -> activate
		events.marked.on.subscribe(onEntityMarked);
		events.marked.off.subscribe(onEntityUnmarked);
	}
	
	function reset(){
		var hoveredEntities = events.hovered.getEntities();		
		
		hoveredEntities.forEach(function(hoveredEntity){
			var unHoverEvent = {					
                    sender: aframeCanvasAnimationController,
					entities: [hoveredEntity]
			};

			events.hovered.off.publish(unHoverEvent);	
		});		
	}

	/* 
	* Hover
	*/

	function handleOnMouseEnter(eventObject) {
		var entity = model.getEntityById(eventObject.target.id);
		if(entity === undefined){
			entity = eventObject.target.id;
			events.log.error.publish({ text: "Entity of partID " + eventObject.target.id + " not in model data."});
			return;
		}
		
		var applicationEvent = {
            sender		: aframeCanvasAnimationController
            ,
			entities	: [entity],
			posX		: eventObject.layerX,
			posY		: eventObject.layerY
		};
		events.hovered.on.publish(applicationEvent);		
	}

	function handleOnMouseLeave(eventObject) {
		var entity = model.getEntityById(eventObject.target.id);
		if(entity === undefined){
			events.log.error.publish({ text: "Entity of partID " + eventObject.target.id + " not in model data."});
			return;
		}

		var applicationEvent = {			
            sender		: aframeCanvasAnimationController
            ,
			entities	: [entity]			
		};
		
		events.hovered.off.publish(applicationEvent);	
	}

	function onEntityHover(applicationEvent) {
		change(applicationEvent, controllerConfig.hoverAnimation);
    }
	
	function onEntityUnhover(applicationEvent) {
		resetChange(applicationEvent, controllerConfig.hoverAnimation);
	}
	
	/* 
	* Select
	*/

	function selectAction(eventObject){
		var applicationEvent = {			
			sender: aframeCanvasAnimationController,
			entities: [eventObject.entity]
		};
		
		events.selected.on.publish(applicationEvent);		
	}

	function onEntitySelected(applicationEvent) {
		var entity = applicationEvent.entities[0];			
		var selectedEntities = events.selected.getEntities();
		var element = document.getElementById(entity.id);

		//select same entity again -> stop animation
		if(selectedEntities.has(entity.id) && (element.hasAttribute("animation__color") || element.hasAttribute("animation__yoyo"))){
			selectedEntities.forEach(function(selectedEntity){
								
				var unselectEvent = {					
					sender: aframeCanvasAnimationController,
					entities: [selectedEntity]
				}	
				events.selected.off.publish(unselectEvent);	
			});

			return;
		}

		change(applicationEvent, controllerConfig.selectAnimation);
	}

	function onEntityUnselected(applicationEvent) {
		resetChange(applicationEvent, controllerConfig.selectAnimation);
	}

	/* 
	* Mark
	*/

	function markAction(applicationEvent) {
		var applicationEvent = {			
			sender: aframeCanvasAnimationController,
			entities: [applicationEvent.entity]
		};
		
		events.marked.on.publish(applicationEvent);

	}

	function onEntityMarked(applicationEvent) {
		var entity = applicationEvent.entities[0];			
		var markedEntities = events.marked.getEntities();
		var element = document.getElementById(entity.id);

		//select same entity again -> stop animation
		if(markedEntities.has(entity.id) && (element.hasAttribute("animation__color") || element.hasAttribute("animation__yoyo") || element.hasAttribute("animation__position"))){
			markedEntities.forEach(function(markedEntity){
				var unmarkedEvent = {					
					sender: aframeCanvasAnimationController,
					entities: [markedEntity]
				}	
				events.marked.off.publish(unmarkedEvent);	
			});
			return;
		}

		change(applicationEvent, controllerConfig.markAnimation);
	}

	function onEntityUnmarked(applicationEvent) {
		resetChange(applicationEvent, controllerConfig.markAnimation);	
	}

	/* 
	* change and unchange animations
	*/

	function change(applicationEvent, animation)
	{
		// set variables for hover
		if(event.type == 'mouseenter') {
			var time = controllerConfig.hoverTime;
			var color = controllerConfig.hoverColor;
			var scale = controllerConfig.hoverScale;
			var position = controllerConfig.hoverPosition;
			var rotation = controllerConfig.hoverRotation;
		}

		// set variables for select
		if(event.button == 0) { // 0 -> mouse leftclick
			var time = controllerConfig.selectTime;
			var color = controllerConfig.selectColor;
			var scale = controllerConfig.selectScale;
			var position = controllerConfig.selectPosition;
			var rotation = controllerConfig.selectRotation;
		}

		// set variables for mark
		if(event.button == 2) { // 2 -> mouse rightclick
			var time = controllerConfig.markTime;
			var color = controllerConfig.markColor;
			var scale = controllerConfig.markScale;
			var position = controllerConfig.markPosition;
			var rotation = controllerConfig.markRotation;
		}

		var entity = applicationEvent.entities[0];

        if(entity === undefined){
			events.log.error.publish({ text: "Entity is not defined"});
		}
		
		if(entity.isTransparent === true) {
			return;
		}

		if(entity.type === "text"){
			return;
		}
        
        if(animation === "scale"){
			canvasManipulator.pulsateScale([entity], scale, time);
			return;
		}
		
		if(animation === "color"){
			canvasManipulator.pulsateColor([entity], color, time);
			return;
		}

		if(animation === "position"){
			canvasManipulator.pulsatePosition([entity], position, time);
			return;
		}

		if(animation === "rotation"){
			canvasManipulator.pulsateRotation([entity], rotation, time);
			return;
		} 
		
		if(animation == false) {
			return;
		} else {
			console.log("You didn't pick any Animation for " + animation + ".");
			return;
		}
	}

	function resetChange(applicationEvent, animation)
	{
		var entity = applicationEvent.entities[0];

        if(entity === undefined){
			events.log.error.publish({ text: "Entity is not defined"});
		}
		
		if(entity.isTransparent === true) {
			return;
		}

		if(entity.type === "text"){
			return;
		}
        
        if(animation === "scale"){
            canvasManipulator.resetPulsateScale([entity]);
			return;
		}
		
		if(animation === "color"){
            canvasManipulator.resetPulsateColor([entity]);
            return;
		}

		if(animation === "position"){
			canvasManipulator.resetPulsatePosition([entity]);
			return;
		}

		if(animation === "rotation"){
			canvasManipulator.resetPulsateRotation([entity]);
			return;
		} 

		if(animation == false) {
			return;
		} else {
			console.log("You didn't pick any Animation for " + animation + ".");
			return;
		}
	}

    return {
        initialize: initialize,
		activate: activate,
		reset: reset,
		handleOnMouseEnter: handleOnMouseEnter,
		handleOnMouseLeave: handleOnMouseLeave
    };    
})();
