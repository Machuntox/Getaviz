var canvasManipulator = (function () {

    var colors = {
        darkred: "darkred",
        red: "red",
        black: "black",
        orange: "orange",
        darkorange: "darkorange"
    };

    var scene = {};

    var initialCameraView = {};

    function initialize() {

        scene = document.querySelector("a-scene");

        initialCameraView.target = globalCamera.target;
        initialCameraView.position = globalCamera.object.position;
        initialCameraView.spherical = globalCamera.spherical;
    }

    function reset() {
        let offset = new THREE.Vector3();
        offset.subVectors(initialCameraView.target, globalCamera.target).multiplyScalar(globalCamera.data.panSpeed);
        globalCamera.panOffset.add(offset);

        globalCamera.sphericalDelta.phi = 0.25 * (initialCameraView.spherical.phi - globalCamera.spherical.phi);
        globalCamera.sphericalDelta.theta = 0.25 * (initialCameraView.spherical.theta - globalCamera.spherical.theta);

        globalCamera.scale = initialCameraView.spherical.radius/globalCamera.spherical.radius;
    }

    function changeTransparencyOfEntities(entities, value) {
        entities.forEach(function (entity2) {
            //  getting the entity again here, because without it the check if originalTransparency is defined fails sometimes
            let entity = model.getEntityById(entity2.id);
            let component = document.getElementById(entity.id);
            if (component == undefined) {
                events.log.error.publish({text: "CanvasManipualtor - changeTransparencyOfEntities - components for entityIds not found"});
                return;
            }
            if (entity.originalTransparency === undefined) {
                entity.originalTransparency = {};
                entity.currentTransparency = {};
                if(component.getAttribute("material").opacity) {
                    entity.originalTransparency = 1 - component.getAttribute("material").opacity;
                }
            }
            entity.currentTransparency = value;
            setTransparency(component, value);
        });
    }

    function resetTransparencyOfEntities(entities) {
        entities.forEach(function (entity) {
            let component = document.getElementById(entity.id);
            if (component == undefined) {
                events.log.error.publish({text: "CanvasManipualtor - resetTransparencyOfEntities - components for entityIds not found"});
                return;
            }
            if (!(entity.originalTransparency == undefined)) {
                entity.currentTransparency = entity.originalTransparency;
                setTransparency(component, entity.originalTransparency);
            }
        });
    }

    function changeColorOfEntities(entities, color) {
        entities.forEach(function (entity) {
                if (!(entity == undefined)) {
                    var component = document.getElementById(entity.id);
                }
                if (component == undefined) {
                    events.log.error.publish({text: "CanvasManipualtor - changeColorOfEntities - components for entityIds not found"});
                    return;
                }
                if (entity.originalColor == undefined) {
                    entity.originalColor = component.getAttribute("color");
                }
                entity.currentColor = color;
                setColor(component, color);
            }
        );
    }

    function resetColorOfEntities(entities) {
        entities.forEach(function (entity) {
            let component = document.getElementById(entity.id);
            if (component == undefined) {
                events.log.error.publish({text: "CanvasManipualtor - resetColorOfEntities - components for entityIds not found"});
                return;
            }
            if (entity.originalColor) {
                entity.currentColor = entity.originalColor;
                setColor(component, entity.originalColor);
            }
        });
    }

    function setColor(object, color) {
        color == colors.darkred ? color = colors.red : color = color;
        let colorValues = color.split(" ");
        if (colorValues.length == 3) {
            color = "#" + parseInt(colorValues[0]).toString(16) + "" + parseInt(colorValues[1]).toString(16) + "" + parseInt(colorValues[2]).toString(16);
        }
        object.setAttribute("color", color);
    }

    function setScale(object, scale) {
        scale = parseInt(scale.x).toString(16) + " " + parseInt(scale.y).toString(16) + " " + parseInt(scale.z).toString(16);
        object.setAttribute("scale", scale);
    }

    function setPosition(object, coordinates) {
        coordinates = coordinates.x.toString() + " " + coordinates.y.toString() + " " + coordinates.z.toString();
        object.setAttribute("position", coordinates);
    }

    function setRotation(object, rotation) {
        rotation = parseInt(rotation.x).toString() + " " + parseInt(rotation.y).toString() + " " + parseInt(rotation.z).toString();
        object.setAttribute("rotation", rotation);
    }

    function hideEntities(entities) {
        entities.forEach(function (entity) {
            let component = document.getElementById(entity.id);
            if (component == undefined) {
                events.log.error.publish({text: "CanvasManipualtor - hideEntities - components for entityIds not found"});
                return;
            }
            setVisibility(component, false)
        });
    }

    function showEntities(entities) {
        entities.forEach(function (entity) {
            let component = document.getElementById(entity.id);
            if (component == undefined) {
                events.log.error.publish({text: "CanvasManipualtor - showEntities - components for entityIds not found"});
                return;
            }
            setVisibility(component, true)
        });
    }

    function pulsateColor(entities, color, time)
    {
        entities.forEach(function (entity2) {
            //  getting the entity again here, because without it the check if originalTransparency is defined fails sometimes
            let entity = model.getEntityById(entity2.id);
            let component = document.getElementById(entity.id);
            if (component == undefined) {
                events.log.error.publish({text: "CanvasManipualtor - pulsateColor - components for entityIds not found"});
                return;
            }
            // save old color for later
            if (entity.originalColor == undefined) {
                entity.originalColor = component.getAttribute("color");
                entity.currentColor = entity.originalColor;
            }
            if (entity["originalTransparency"] === undefined) {
                // in case "material".opacity is undefined originalTransparency gets set to 0 which would be the default value anyways
                entity.originalTransparency = {};
                entity.currentTransparency = {};
                if(component.getAttribute("material").opacity) {
                    entity.originalTransparency = 1 - component.getAttribute("material").opacity;
                } else entity.originalTransparency = 0;
                entity.currentTransparency = entity.originalTransparency;
            }
            component.setAttribute('animation__color', `property: color; dir: alternate; dur: ${time}; easing: easeInOutSine; loop: true; to: ${color}`);

            setTransparency(component, 0);
        });
    }

    function resetPulsateColor(entities)
    {
        entities.forEach(function (entity2) {
            //  getting the entity again here, because without it the check if originalTransparency is defined fails sometimes
            let entity = model.getEntityById(entity2.id);
            let component = document.getElementById(entity.id);
            if (component == undefined) {
                events.log.error.publish({text: "CanvasManipualtor - resetPulsateColor - components for entityIds not found"});
                return;
            }
            component.removeAttribute('animation__color');
            setColor(component, entity.currentColor);
            setTransparency(component, 0);
        });
    }
    
    function pulsateScale(entities, scale, time) {
        entities.forEach(function (entity2) {
            //  getting the entity again here, because without it the check if originalTransparency is defined fails sometimes
            let entity = model.getEntityById(entity2.id);
            let component = document.getElementById(entity.id);
            if (component == undefined) {
                events.log.error.publish({text: "CanvasManipualtor - pulsateScale - components for entityIds not found"});
                return;
            }
            // save old scale for later
            if (entity.scale == undefined) {
                entity.originalScale = component.getAttribute("scale");
                entity.currentScale = entity.originalScale;
            }
            if (entity["originalTransparency"] === undefined) {
                // in case "material".opacity is undefined originalTransparency gets set to 0 which would be the default value anyways
                entity.originalTransparency = {};
                entity.currentTransparency = {};
                if(component.getAttribute("material").opacity) {
                    entity.originalTransparency = 1 - component.getAttribute("material").opacity;
                } else entity.originalTransparency = 0;
                entity.currentTransparency = entity.originalTransparency;
            }
            component.setAttribute('animation__yoyo', `property: scale; dir: alternate; dur: ${time}; easing: easeInOutSine; loop: true; to: ` + scale);
            setTransparency(component, 0);
        });
    }

    function resetPulsateScale(entities) {
        entities.forEach(function (entity2) {
            //  getting the entity again here, because without it the check if originalTransparency is defined fails sometimes
            let entity = model.getEntityById(entity2.id);
            let component = document.getElementById(entity.id);
            if (component == undefined) {
                events.log.error.publish({text: "CanvasManipualtor - resetPulsateScale - components for entityIds not found"});
                return;
            }
            component.removeAttribute('animation__yoyo');
            setScale(component, entity.currentScale);
            setTransparency(component, 0);
        });
    }


    function pulsatePosition(entities, position, time) {
        entities.forEach(function (entity2) {
            //  getting the entity again here, because without it the check if originalTransparency is defined fails sometimes
            let entity = model.getEntityById(entity2.id);
            let component = document.getElementById(entity.id);
            let canvas = document.getElementById("canvas");
            if (component == undefined) {
                events.log.error.publish({text: "CanvasManipualtor - pulsatePosition - components for entityIds not found"});
                return;
            }

            // save old position for later
            if (entity.originalPosition == undefined) {
                var coordinates = component.getAttribute("position");
                coordinates = coordinates.x.toString() + " " + coordinates.y.toString() + " " + coordinates.z.toString();
                if(canvas.getAttribute('data-id') !== entity.id) {
                    canvas.setAttribute('data-oldPosition', coordinates);
                    canvas.setAttribute('data-id', entity.id);
                }
            }
            if (entity["originalTransparency"] === undefined) {
                // in case "material".opacity is undefined originalTransparency gets set to 0 which would be the default value anyways
                entity.originalTransparency = {};
                entity.currentTransparency = {};
                if(component.getAttribute("material").opacity) {
                    entity.originalTransparency = 1 - component.getAttribute("material").opacity;
                } else entity.originalTransparency = 0;
                entity.currentTransparency = entity.originalTransparency;
            } 
            component.setAttribute('animation__position', `property: position; dir: alternate; dur: ${time}; easing: easeInOutSine; loop: true; to: ` + position);
            setTransparency(component, 0);
        });
    }

    function resetPulsatePosition(entities) {
        entities.forEach(function (entity2) {
            //  getting the entity again here, because without it the check if originalTransparency is defined fails sometimes
            let entity = model.getEntityById(entity2.id);
            let component = document.getElementById(entity.id);
            let canvas = document.getElementById("canvas");
            if (component == undefined) {
                events.log.error.publish({text: "CanvasManipualtor - resetPulsatePosition - components for entityIds not found"});
                return;
            }
            component.removeAttribute('animation__position');
            component.setAttribute("position", canvas.getAttribute("data-oldPosition"));
            setTransparency(component, 0);
        });
    }

    function pulsateRotation(entities, rotation, time)
    {
        entities.forEach(function (entity2) {
            //  getting the entity again here, because without it the check if originalTransparency is defined fails sometimes
            let entity = model.getEntityById(entity2.id);
            let component = document.getElementById(entity.id);
            if (component == undefined) {
                events.log.error.publish({text: "CanvasManipualtor - highlightEntities - components for entityIds not found"});
                return;
            }
            if (entity.originalRotation == undefined) {
                entity.originalRotation = component.getAttribute("rotation");
                entity.currentRotation = entity.originalRotation;
            }
            if (entity["originalTransparency"] === undefined) {
                // in case "material".opacity is undefined originalTransparency gets set to 0 which would be the default value anyways
                entity.originalTransparency = {};
                entity.currentTransparency = {};
                if(component.getAttribute("material").opacity) {
                    entity.originalTransparency = 1 - component.getAttribute("material").opacity;
                } else entity.originalTransparency = 0;
                entity.currentTransparency = entity.originalTransparency;
            }
            component.setAttribute('animation__yoyo', `property: rotation; dir: alternate; dur: ${time}; easing: easeInOutSine; loop: true; to: ` + rotation);
            setTransparency(component, 0);
        });
    }

    function resetPulsateRotation(entities) {
        entities.forEach(function (entity2) {
            //  getting the entity again here, because without it the check if originalTransparency is defined fails sometimes
            let entity = model.getEntityById(entity2.id);
            let component = document.getElementById(entity.id);
            if (component == undefined) {
                events.log.error.publish({text: "CanvasManipualtor - resetPulsateRotation - components for entityIds not found"});
                return;
            }
            component.removeAttribute('animation__yoyo');
            setRotation(component, entity.currentRotation);
            setTransparency(component, 0);
        });
    }

    // resets every pulsate animation of entity
    function resetPulsates(entities) {
        entities.forEach(function (entity2) {
            //  getting the entity again here, because without it the check if originalTransparency is defined fails sometimes
            let entity = model.getEntityById(entity2.id);
            let component = document.getElementById(entity.id);
            if (component == undefined) {
                events.log.error.publish({text: "CanvasManipualtor - resetPulsates - components for entityIds not found"});
                return;
            }
            if (entity.originalScale == undefined) {
                entity.originalScale = component.getAttribute("scale");
                entity.currentScale = entity.originalscale;
            }
            if (entity.originalRotation == undefined) {
                entity.originalRotation = component.getAttribute("rotation");
                entity.currentRotation = entity.originalRotation;
            }
            if (entity.originalColor == undefined) {
                entity.originalColor = component.getAttribute("color");
                entity.currentColor = entity.originalColor;
            }
            if (entity.originalPosition == undefined) {
                entity.originalPosition = component.getAttribute("position");
                entity.currentPosition = entity.originalPosition;
            }
            if (entity["originalTransparency"] === undefined) {
                // in case "material".opacity is undefined originalTransparency gets set to 0 which would be the default value anyways
                entity.originalTransparency = {};
                entity.currentTransparency = {};
                if(component.getAttribute("material").opacity) {
                    entity.originalTransparency = 1 - component.getAttribute("material").opacity;
                } else entity.originalTransparency = 0;
                entity.currentTransparency = entity.originalTransparency;
            }
            component.removeAttribute('animation__color');
            setColor(component, entity.currentColor);
            setScale(component, entity.currentScale);
            setRotation(component, entity.currentRotation);
            setTransparency(component, 0);
        });
    }

    function highlightEntities(entities, color) {
        entities.forEach(function (entity2) {
            //  getting the entity again here, because without it the check if originalTransparency is defined fails sometimes
            let entity = model.getEntityById(entity2.id);
            let component = document.getElementById(entity.id);
            if (component == undefined) {
                events.log.error.publish({text: "CanvasManipualtor - highlightEntities - components for entityIds not found"});
                return;
            }
            if (entity.originalColor == undefined) {
                entity.originalColor = component.getAttribute("color");
                entity.currentColor = entity.originalColor;
            }
            if (entity["originalTransparency"] === undefined) {
                // in case "material".opacity is undefined originalTransparency gets set to 0 which would be the default value anyways
                entity.originalTransparency = {};
                entity.currentTransparency = {};
                if(component.getAttribute("material").opacity) {
                    entity.originalTransparency = 1 - component.getAttribute("material").opacity;
                } else entity.originalTransparency = 0;
                entity.currentTransparency = entity.originalTransparency;
            }
            setColor(component, color);
            setTransparency(component, 0);
        });
    }

    function unhighlightEntities(entities) {
        entities.forEach(function (entity) {
            let component = document.getElementById(entity.id);
            if (component == undefined) {
                events.log.error.publish({text: "CanvasManipualtor - unhighlightEntities - components for entityIds not found"});
                return;
            }
            setTransparency(component, entity.currentTransparency);
            setColor(component, entity.currentColor);
        });
    }

    function flyToEntity(entity) {
        setCenterOfRotation(entity);
        let object = document.getElementById(entity.id);
        let boundingSphereRadius = object.object3DMap.mesh.geometry.boundingSphere.radius;
        globalCamera.scale = boundingSphereRadius/globalCamera.spherical.radius;
    }

    function addElement(element) {
        var addedElements = document.getElementById("addedElements");
        addedElements.appendChild(element);
    }

    function removeElement(element) {
        element.parentNode.removeChild(element);
    }


    function setCenterOfRotation(entity) {
        let offset = new THREE.Vector3();
        offset.subVectors(getCenterOfEntity(entity), globalCamera.target).multiplyScalar(globalCamera.data.panSpeed);
        globalCamera.panOffset.add(offset);
    }

    function getCenterOfEntity(entity) {
        var center = new THREE.Vector3();
        var object = document.getElementById(entity.id).object3DMap.mesh;
        center.x = object.geometry.boundingSphere.center["x"];
        center.y = object.geometry.boundingSphere.center["y"];
        center.z = object.geometry.boundingSphere.center["z"];
        return object.localToWorld(center);
    }

    function setTransparency(object, value) {
        object.setAttribute('material', {
            opacity: 1 - value
        });
    }


    function setVisibility(object, visibility) {
        object.setAttribute("visible", visibility);
    }

    function getElementIds() {
        let sceneArray = Array.from(scene.children);
        sceneArray.shift(); // so camera entity needs to be first in model.html
        sceneArray.pop();  // last element is of class "a-canvas"
        let elementIds = [];
        sceneArray.forEach(function (object) {
            elementIds.push(object.id);
        });
        return elementIds;
    }

    return {
        initialize: initialize,
        reset: reset,
        colors: colors,

        changeTransparencyOfEntities: changeTransparencyOfEntities,
        resetTransparencyOfEntities: resetTransparencyOfEntities,

        changeColorOfEntities: changeColorOfEntities,
        resetColorOfEntities: resetColorOfEntities,

        pulsateColor: pulsateColor,
        resetPulsateColor: resetPulsateColor,

        pulsateScale: pulsateScale,
        resetPulsateScale: resetPulsateScale,

        pulsatePosition: pulsatePosition,
        resetPulsatePosition: resetPulsatePosition,

        pulsateRotation: pulsateRotation,
        resetPulsateRotation: resetPulsateRotation,

        resetPulsates: resetPulsates,

        hideEntities: hideEntities,
        showEntities: showEntities,

        highlightEntities: highlightEntities,
        unhighlightEntities: unhighlightEntities,

        flyToEntity: flyToEntity,

        addElement: addElement,
        removeElement: removeElement,

        setCenterOfRotation: setCenterOfRotation,
        getCenterOfEntity: getCenterOfEntity,

        getElementIds: getElementIds
    };

})
();