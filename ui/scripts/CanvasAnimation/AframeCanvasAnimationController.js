var aframeCanvasAnimationController
 = (function() {
    
    var isInNavigation = false;
	
    function initialize(setupConfig){
		application.transferConfigParams(setupConfig, controllerConfig);
		var cssLink = document.createElement("link");
		cssLink.type = "text/css";
		cssLink.rel = "stylesheet";
		cssLink.href = "scripts/CanvasHover/ho.css";
		document.getElementsByTagName("head")[0].appendChild(cssLink);	
    }

    let animationMode = {
		size : "size",
		color : "color",
		position : "position",
		rotation : "rotation"
	}

	//config parameters	
	var controllerConfig = {
        hoverTiming : 2000, // 1000 = 1s
        hoverColor : "#000000", // must be hexcode
        hoverSize : '2 2 2', // 'X-achis, Y-achis, Z-achis' | 2 -> double in size
		markingColor : "blue",
		selectColor : "green",
		hoverAnimation : animationMode.size,
		selectAnimation : animationMode.color,
		markAnimation : animationMode.color,
		markMouseKey: 2,
		selectionMouseKey: 1

    };
	
	function activate(){

		actionController.actions.mouse.hover.subscribe(handleOnMouseEnter); // subscribe event
		actionController.actions.mouse.unhover.subscribe(handleOnMouseLeave); // unsubscribe event
							
		events.hovered.on.subscribe(onEntityHover); // function while hovering
		events.hovered.off.subscribe(onEntityUnhover); // function when unhover
	}
	
	function reset(){
		var hoveredEntities = events.hovered.getEntities();		
		
		hoveredEntities.forEach(function(hoveredEntity){
			var unHoverEvent = {					
                    sender: aframeCanvasAnimationController
                    ,
					entities: [hoveredEntity]
			};

			events.hovered.off.publish(unHoverEvent);	
		});		
	}
		
	function handleOnMousedown(canvasEvent) {
		isInNavigation = true;
	}
	
	function handleOnMouseup(canvasEvent) {
		isInNavigation = false;
	}

	function handleOnMouseEnter(eventObject) {
		if(isInNavigation){
			return;
		}        

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
        
        if(controllerConfig.hoverAnimation === "size"){
			changeSize(entity);
			return;
		}
		
		if(controllerConfig.hoverAnimation === "color"){
			changeColor(entity);
			return;
		}

		if(controllerConfig.hoverAnimation === "position"){
			changePosition(entity);
			return;
		}

		if(controllerConfig.hoverAnimation === "rotation"){
			changeRotation(entity);
			return;
		} else {
			console.log("You didn't pick any Animation for the selectAction.");
			return;
		}
    }
	
	function onEntityUnhover(applicationEvent) {
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
        
        if(controllerConfig.hoverAnimation === "size"){
            canvasManipulator.resetPulsateSize([entity]);
			return;
		}
		
		if(controllerConfig.hoverAnimation === "color"){
            canvasManipulator.resetPulsateColor([entity]);
            return;
		}

		if(controllerConfig.hoverAnimation === "position"){
			canvasManipulator.resetPulsatePosition([entity]);
			return;
		}

		if(controllerConfig.hoverAnimation === "rotation"){
			canvasManipulator.resetPulsateRotation([entity]);
			return;
		} else {
			console.log("You didn't pick any Animation for the selectAction.");
			return;
		}
    }

    function changeSize(entity)
    {
        if(entity.marked || entity.selected){
			canvasManipulator.resetPulsates([entity]);	
		} else {
			canvasManipulator.pulsateSize([entity], controllerConfig.hoverSize, controllerConfig.hoverTiming);	
        }
    }
    
    function changeColor(entity)
    {
        if(entity.marked || entity.selected){
			canvasManipulator.resetPulsates([entity]);	
		} else {
			canvasManipulator.pulsateColor([entity], controllerConfig.hoverColor, controllerConfig.hoverTiming);	
		}
    }

    function changePosition(entity)
    {

    }

    function changeRotation(entity)
    {

    }

    return {
        initialize: initialize,
		activate: activate,
		reset: reset,
		handleOnMouseEnter: handleOnMouseEnter,
		handleOnMouseLeave: handleOnMouseLeave
    };    
})();
