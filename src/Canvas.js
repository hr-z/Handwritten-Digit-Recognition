// //import {useDraw} from "./Hook.js";
import {  useEffect, useRef } from "react";
import * as tf from '@tensorflow/tfjs';
import {createModel} from "./model.js"
// loadModel();
var isPainting = false;
var previousPoint = {x : 0,y : 0};
var model;
const Canvas = props => {
    
    const ref = useRef();
    useEffect(() => {
        const canvas = ref.current;
        const ctx = canvas.getContext('2d');
        canvas.addEventListener("mouseup",() => {
            isPainting = false;
        });

        canvas.addEventListener("mousedown",() => {
            isPainting = true;
        });
        canvas.addEventListener("mousemove",(e) => {
            const point = getRelativeCanvasLoc(e.clientX, e.clientY, ref);
            if (isPainting) draw(ctx, previousPoint, point);
            previousPoint = point;
            console.log(point);
        });
        canvas.addEventListener("mouseLeave",() => {
            isPainting = false;
        });
        const draw = (ctx, previousPoint, point) => {
            previousPoint = previousPoint ?? point;
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.lineWidth = 5;
            ctx.strokeStyle = 'black';
            ctx.lineJoin = 'bevel';
            ctx.lineCap = 'round';
            ctx.moveTo(previousPoint.x, previousPoint.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
            ctx.closePath();
        }
        
        
    },[])
    
    const clearCanvas = () => {
        const canvas = ref.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    const checkAnswer = () => {
        const canvas = ref.current;
        const imageSrc = canvas.toDataURL('image/png');
        const img = new Image();
        img.src = imageSrc;
        
        var resizedCanvas = document.createElement("canvas");
        var resizedImg = resizedCanvas.getContext("2d");
        img.onload = () => {
            const trimmedCtx = trimCanvas(canvas);
            const trimmedImg = new Image();
            trimmedImg.src = trimmedCtx.canvas.toDataURL('image/png');
            resizedCanvas.width = 28;
            resizedCanvas.height = 28;
            resizedImg.drawImage(trimmedImg,0,0,28,28);
            // const resizedDataURL = resizedImg.canvas.toDataURL('image/png'); 
            // const resizedImg = new Image(); 
            // resizedImg.src = resizedDataURL;

            
            predict(resizedImg);
            //testing
            // const a = document.createElement('a');
            // a.href = resizedDataURL; // Set the Data URL as the anchor's href
            // a.download = 'captured_image.png'; // Specify the default filename for the download
            
            // a.click();

        }


    }
    
    return (<div>
                <canvas style={canvasStyle} ref={ref} {...props} />
                <div>
                    <button onClick={clearCanvas}>Clear</button>
                    <button onClick={checkAnswer}>Check Answer</button>
                </div>
            </div>
            )
}

// async function loadModel() {
//     model = await tf.loadLayersModel('E:/Handwrite Recognition/handwrite/src/model.json');
//     if (model) {
//       const result = model.predict(/* input data */);
//       console.log(result);
//     } else {
//       console.error('Model is undefined.');
//     }
// }

function predict(img) {
    let imageData = img.getImageData(0, 0, 28, 28);

    let inputTensor = tf.browser.fromPixels(imageData);

    inputTensor = tf.image.resizeBilinear(inputTensor, [28, 28]);

    inputTensor = inputTensor.div(tf.scalar(255));

    inputTensor = inputTensor.reshape([1, -1]);
    console.log(inputTensor);
    let prediction;
    (model = createModel()).then(()=>{prediction = model.predict(inputTensor);});

    //const prediction = model.predict(inputTensor);

    // const result = model.predict(X);
    console.log("The prediction result is:" + prediction);
}
function trimCanvas(c) {
    var ctx = c.getContext('2d'),
        copy = document.createElement('canvas').getContext('2d'),
        pixels = ctx.getImageData(0, 0, c.width, c.height),
        l = pixels.data.length,
        i,
        bound = {
            top: null,
            left: null,
            right: null,
            bottom: null
        },
        x, y;
    
    // Iterate over every pixel to find the highest
    // and where it ends on every axis ()
    for (i = 0; i < l; i += 4) {
        if (pixels.data[i + 3] !== 0) {
            x = (i / 4) % c.width;
            y = ~~((i / 4) / c.width);

            if (bound.top === null) {
                bound.top = y;
            }

            if (bound.left === null) {
                bound.left = x;
            } else if (x < bound.left) {
                bound.left = x;
            }

            if (bound.right === null) {
                bound.right = x;
            } else if (bound.right < x) {
                bound.right = x;
            }

            if (bound.bottom === null) {
                bound.bottom = y;
            } else if (bound.bottom < y) {
                bound.bottom = y;
            }
        }
    }
    
    // Calculate the height and width of the content
    var trimHeight = bound.bottom - bound.top,
        trimWidth = bound.right - bound.left,
        trimmed = ctx.getImageData(bound.left, bound.top, trimWidth, trimHeight);

    copy.canvas.width = trimWidth;
    copy.canvas.height = trimHeight;
    copy.putImageData(trimmed, 0, 0);

    // Return trimmed canvas
    return copy;
}
function getRelativeCanvasLoc(clientX, clientY, ref) {
    if (!ref.current) {
        return null;
    }
    const canvasBorder = ref.current.getBoundingClientRect();
    return {
        x : clientX - canvasBorder.left,
        y : clientY - canvasBorder.top
    }
}

const canvasStyle = {
     border: "1px solid blue"
}

// const buttonStyle = {
//     theme: "blue"
// }
export default Canvas








