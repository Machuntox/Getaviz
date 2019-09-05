var aframeCanvasAnimationController = (function() {
	
    var isInNavigation = false;

    function initialize(setupConfig){
		application.transferConfigParams(setupConfig, controllerConfig);
		var cssLink = document.createElement("link");
		cssLink.type = "text/css";
		cssLink.rel = "stylesheet";
		cssLink.href = "scripts/CanvasAnimation/animation.css";
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
		hoverColor : "red",
		markingColor : "blue",
		selectColor : "green",
		hoverAnimation : animationMode.color,
		selectAnimation : animationMode.color,
		markAnimation : animationMode.color,
		markMouseKey: 2,
		selectionMouseKey: 1

	};
	
	function activate(){
		// activate hoverAnimation
		var multiPart = document.getElementById("multiPart");
		multiPart.addEventListener("mouseenter", handleOnMouseEnter, false);
		multiPart.addEventListener("mouseleave", handleOnMouseLeave, false);

		events.hovered.on.subscribe(onEntityHover);
		events.hovered.off.subscribe(onEntityUnhover); 

		// activate selectAnimation
		actionController.actions.mouse.key[controllerConfig.selectionMouseKey].down.subscribe(selectAction);

			
		events.selected.on.subscribe(onEntitySelected);
		events.selected.off.subscribe(onEntityUnselected);
		events.componentSelected.on.subscribe(onComponentSelected);
        events.antipattern.on.subscribe(onComponentSelected);

		// activate markAnimation
		actionController.actions.mouse.key[controllerConfig.markMouseKey].down.subscribe(markAction); // pushing rightclick -> activate

		events.marked.on.subscribe(onEntityMarked); // change color for long time
		events.marked.off.subscribe(onEntityUnmarked); // reset Color
	}
	
	function reset(){
		// reset hoverAnimation
		var hoveredEntities = events.hovered.getEntities();		
		
		hoveredEntities.forEach(function(hoveredEntity){
			var unHoverEvent = {					
					sender: aframeCanvasAnimationController,
					entities: [hoveredEntity]
			};

			events.hovered.off.publish(unHoverEvent);	
		});	

		// reset selectAnimation
		var selectedEntities = events.selected.getEntities();		
		
		selectedEntities.forEach(function(selectedEntity){
			var unselectEvent = {
                sender: aframeCanvasAnimationController,
                entities: [selectedEntity]
            };

			events.selected.off.publish(unselectEvent);	
		});	

		// reset markAnimation
		let markedEntities = events.marked.getEntities();
		
		canvasManipulator.resetColorOfEntities(markedEntities);	
	}

	function selectAction(eventObject){

		if(!eventObject.entity){
			return;
		}
		
		if(controllerConfig.selectAnimation === "size"){
			changeSize(eventObject);
			return;
		}
		
		if(controllerConfig.selectAnimation === "color"){
			changeColor(eventObject, "select");
			return;
		}

		if(controllerConfig.selectAnimation === "position"){
			changePosition(eventObject);
			return;
		}

		if(controllerConfig.selectAnimation === "rotation"){
			changeRotation(eventObject);
			return;
		} else {
			console.log("You didn't pick any Animation for the selectAction.");
			return;
		}
	}

	function markAction(eventObject){

		if(!eventObject.entity){
			return;
		}

		if(controllerConfig.markAnimation === "size"){
			changeSize(eventObject);
			return;
		}

		if(controllerConfig.markAnimation === "color"){
			changeColor(eventObject, "mark");
			return;
		}

		if(controllerConfig.markAnimation === "position"){
			changePosition(eventObject);
			return;
		}

		if(controllerConfig.markAnimation === "rotation"){
			changeRotation(eventObject);
			return;
		} else {
			console.log("You didn't pick any Animation for the markAction.");
			return;
		}
	}

	function changeColor(eventObject, option) {            
				
		let applicationEvent = {
			sender: aframeCanvasAnimationController,
			entities: [eventObject.entity]
		};
		if (option == "mark") {
			if(eventObject.entity.marked){
				events.marked.off.publish(applicationEvent);		
			} else {
				events.marked.on.publish(applicationEvent);		
			}	
		}
		if (option == "select") {
			events.selected.on.publish(applicationEvent);		
		}
		//center of rotation
		if(controllerConfig.setCenterOfRotation){
			canvasManipulator.setCenterOfRotation(eventObject.entity);
		}
	}

	function changeSize(eventObject) {
		
	}
	
	function changePosition(eventObject) {

	}

	function changeRotation(eventObject) {

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

	function handleOnMouseEnter(multipartEvent) {
		if(isInNavigation){
			return;
		}        

		var entity = model.getEntityById(multipartEvent.partID); 
		if(entity === undefined){
			entity = multipartEvent.target.id;
			console.log("entity: " + entity);
			events.log.error.publish({ text: "Entity of partID " + multipartEvent.partID + " not in model data."});
			return;
		}
		
		var applicationEvent = {
			sender		: aframeCanvasAnimationController,
			entities	: [entity],
			posX		: multipartEvent.layerX,
			posY		: multipartEvent.layerY
		};
		
		events.hovered.on.publish(applicationEvent);		
	}

	function handleOnMouseLeave(multipartEvent) {
		
		var entity = model.getEntityById(multipartEvent.partID); 
		if(entity === undefined){
			events.log.error.publish({ text: "Entity of partID " + multipartEvent.partID + " not in model data."});
			return;
		}

		var applicationEvent = {			
			sender		: aframeCanvasAnimationController,
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

		if(entity.marked && entity.selected){
			canvasManipulator.unhighlightEntities([entity]);	
		} else {
			canvasManipulator.highlightEntities([entity], controllerConfig.hoverColor);	
		}
    }
	
	function onEntityUnhover(applicationEvent) {
		var entity = applicationEvent.entities[0];
		
		if(entity.marked && entity.selected){
			canvasManipulator.highlightEntities([entity], controllerConfig.hoverColor);	
		} else {
			if(!entity.selected){
				canvasManipulator.unhighlightEntities([entity]);			
			}
			if(entity.type === "Namespace"){
			    canvasManipulator.unhighlightEntities([entity]);
            }
        }
	}
	
	function onEntitySelected(applicationEvent) {	
		
		var entity = applicationEvent.entities[0];	
		
		var selectedEntities = events.selected.getEntities();		
		
		//select same entity again -> nothing to do
		if(selectedEntities.has(entity)){
			return;
		}

        if(entity.type == "text"){
            return;
        }

        /* if(entity.type == "Namespace"){
		    return;
        } */

		//unhighlight old selected entities	for single select	
		if(selectedEntities.size != 0){
		
			selectedEntities.forEach(function(selectedEntity){
								
				var unselectEvent = {					
					sender: aframeCanvasAnimationController,
					entities: [selectedEntity]
				}	

				events.selected.off.publish(unselectEvent);	
			});
		}
		
		//higlight new selected entity
		canvasManipulator.highlightEntities([entity], controllerConfig.selectColor);	

		//center of rotation
		if(controllerConfig.setCenterOfRotation){
			canvasManipulator.setCenterOfRotation(entity);
		}
    }
	
	function onEntityUnselected(applicationEvent){
		var entity = applicationEvent.entities[0];
		canvasManipulator.unhighlightEntities([entity]);		
	}

	function onComponentSelected(applicationEvent){
		console.log("executed")
        var selectedEntities = events.selected.getEntities();
        selectedEntities.forEach(function(selectedEntity){

            var unselectEvent = {
                sender: aframeCanvasAnimationController,
                entities: [selectedEntity]
            }

            events.selected.off.publish(unselectEvent);
        });
	}

    return {
        initialize: initialize,
		activate: activate,
		reset: reset,
		animationMode : animationMode
    };    
})();
