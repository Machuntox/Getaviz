# aframeCanvasAnimationController

[file](https://github.com/Machuntox/Getaviz/blob/master/ui/scripts/CanvasAnimation/AframeCanvasAnimationController.js)
[testenvironmentlink](http://localhost:8082/ui/index.php?setup=web_a-frame/animation&model=City%20bank%20aframe&aframe=true)

I added the following animations:
- color -> changes color over time and back
- scale -> changes size over time and back
- position -> changes position over time and back
- rotation -> changes rotation over time and back

for the actions: 
- hover
- select (mouse leftclick)
- mark (mouse rightclick)

In the [file](https://github.com/Machuntox/Getaviz/blob/master/ui/scripts/CanvasAnimation/AframeCanvasAnimationController.js) you can define the parameters for each actions independently in the controllerConfig. 

## How to set parameters
time -> number in milisecondes (2000 = 2s)
color -> hexcode as string
scale -> 'X-axis, Y-axis, Z-axis' | 2 -> double in scale | EXAMPLE: '2 2 2'
position -> 'X-axis, Y-axis, Z-axis' | number means degrees of rotation | EXAMPLE: '0 360 0'

## Current problem
The position animation won't reset properly, because aframe initializes the entity each frame. Therefore the stored old position gets lost. This only happens for the position animation, because aframe handles the position attribute differently.
