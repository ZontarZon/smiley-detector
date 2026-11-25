"use client";

import * as THREE from "three";
import React, { useRef, useEffect, useState } from "react";
import { Suspense } from "react";
import axios from "axios";
import "./styles.css";

function CanvasScene() {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    300 / -2,
    300 / 2,
    300 / 2,
    300 / -2,
    1,
    1000,
  );
  camera.position.set(0, 0, 10);
  scene.add(camera);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingContext = useRef<CanvasRenderingContext2D>(null);
  const [prediction, setPrediction] = useState(null);

  const mouse = new THREE.Vector2();

  const drawingParams = {
    isDrawing: false,
    draw: true,
  };

  function clearImg() {
    if (canvasRef.current && drawingContext.current) {
      console.log(typeof drawingContext);
      drawingContext.current.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );
    }
  }

  // @source: https://stackoverflow.com/a/52672952/9457623
  function downloadImg() {
    if (canvasRef.current) {
      const newCanvas = document.createElement("canvas");
      newCanvas.width = 300;
      newCanvas.height = 300;
      const ctx = newCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#FFF";
        ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
        ctx.drawImage(canvasRef.current, 0, 0);
      }
      const url = newCanvas.toDataURL("image/jpeg");
      const link = document.createElement("a");
      link.download = "smiley.png";
      link.href = url;
      link.click();
    }
  }

  // @source: https://jsfiddle.net/4jk0c83L/
  function onPointerDown(event: MouseEvent) {
    if (!drawingParams.draw) {
      console.log("draw is false");
      return;
    }

    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    drawingParams.isDrawing = true;
    draw(event);
  }

  function onPointerMove(event: MouseEvent) {
    if (!drawingParams.isDrawing) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    draw(event);
  }

  function onPointerUp() {
    drawingParams.isDrawing = false;
  }

  // @source: https://stackoverflow.com/a/18053642/9457623
  function draw(event: MouseEvent) {
    if (canvasRef.current && drawingContext.current) {
      const rect = canvasRef.current.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      drawingContext.current.beginPath();
      drawingContext.current.arc(x, y, 10, 0, Math.PI * 2);
      drawingContext.current.fillStyle = "black";
      drawingContext.current.fill();
    }
  }

  const dataURItoBlob = function (dataURI: string) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    let byteString: string;
    if (dataURI.split(",")[0].indexOf("base64") >= 0)
      byteString = atob(dataURI.split(",")[1]);
    else byteString = unescape(dataURI.split(",")[1]);

    // separate out the mime component
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

    // write the bytes of the string to a typed array
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
  };

  function callForPrediction() {
    if (!canvasRef.current) {
      return;
    }
    //@source: https://medium.com/@kaweyo_41978/boosting-your-full-stack-workflow-with-next-js-and-fastapi-and-vercel-3c7d3cd8220f
    let baseUrl = "https://smiley-detector-wheat.vercel.app/api/py/predict";
    if (process.env.NODE_ENV === "development") {
      baseUrl = "http://localhost:3000/api/py/predict";
    }
    const newCanvas = document.createElement("canvas");
    newCanvas.width = 300;
    newCanvas.height = 300;
    const ctx = newCanvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#FFF";
      ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
      ctx.drawImage(canvasRef.current, 0, 0);
    }
    // Source - https://stackoverflow.com/a/64463046
    // Posted by Reinier68
    // Retrieved 2026-10-30, License - CC BY-SA 4.0
    const url = newCanvas.toDataURL("image/jpeg");
    const file = dataURItoBlob(url);
    const form = new FormData();
    form.append("file", file);

    try {
      axios
        .post(baseUrl, form)
        .then(function (res) {
          console.log(res.data);
          setPrediction(res.data[0][0]);
        })
        .catch(function (error) {
          console.log(error);
          return;
        });
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  }

  // The useEffect contents will run after the canvas initializes
  // on the screen.
  // eslint-disable-next-line react-hooks/immutability
  useEffect(() => {
    if (canvasRef.current) {
      drawingContext.current = canvasRef.current.getContext("2d");
      canvasRef.current.addEventListener("pointerdown", onPointerDown);
      canvasRef.current.addEventListener("pointermove", onPointerMove);
      canvasRef.current.addEventListener("pointerup", onPointerUp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-row flex-1 justify-center">
      <div className="flex flex-col flex-1 items-center justify-center gap-5">
        <div id="scene-container">
          <canvas
            id="drawingCanvas"
            ref={canvasRef}
            width={300}
            height={300}
          ></canvas>
        </div>
        <div className="flex flex-row flex-1 items-center justify-center">
          <button onClick={clearImg}> Clear image </button>
          <button onClick={downloadImg}> Download image </button>
          <button onClick={callForPrediction}>Submit</button>
        </div>
      </div>

      {prediction != null && (
        <div>
          <p className="text-2xl">
            Result: {prediction >= 0.5 ? "Yes!" : "Nope"}
          </p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main
        id="main"
        className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between gap-5 py-32 px-16 bg-white dark:bg-black sm:items-start"
      >
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-4xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Smiley Detector
          </h1>
          <h2 className="text-3xl">
            Use the canvas to draw a smiley face! Or not. The Smiley Detector
            will try to determine if your drawing is a smile.
          </h2>
          <p className="leading-6 text-zinc-600 dark:text-zinc-400">
            Use your mouse or finger to draw on the canvas. Once you&apos;re
            done, press the Submit button to run your drawing through the
            SmileyDetector.
          </p>
        </div>
        <div>
          <Suspense>
            <CanvasScene />
          </Suspense>
        </div>
        <h3 className="text-2xl">About the Smiley Detector</h3>
        <p className="leading-6 text-zinc-600 dark:text-zinc-400">
          The Smiley Detector is a small Convolutional Neural Network for Binary
          Classification, leveraging Binary Cross-Entropy Loss, NAdam
          (Nesterov-accelerated Adaptive Moment) optimization, and weight decay.
        </p>

        <p className="leading-6 text-zinc-600 dark:text-zinc-400">
          Here are the training results:
        </p>
        <p>
          <img src="Figure_1.png" alt="model training results" />
        </p>

        <p className="leading-6 text-zinc-600 dark:text-zinc-400">
          Data augmentation was used to accommodate for the small dataset.
        </p>

        <h4 className="text-2xl">Example Results</h4>

        <div className="flex gap-5">
          <div>
            <img src="smiley00071.png" alt="accepted smiley" />
            <p className="green">Yes</p>
          </div>

          <div>
            <img src="notsmiley00189.png" alt="not accepted smiley" />
            <p className="red">No</p>
          </div>
        </div>

        <div className="flex gap-5">
          <div>
            <img src="smiley00004.png" alt="accepted smiley" />
            <p className="green">Yes</p>
          </div>

          <div>
            <img src="notsmiley00012.png" alt="not accepted smiley" />
            <p className="red">No</p>
          </div>
        </div>

        <div className="flex gap-5">
          <div>
            <img src="smiley00391.png" alt="accepted smiley" />
            <p className="green">Yes</p>
          </div>

          <div>
            <img src="notsmiley00070.png" alt="not accepted smiley" />
            <p className="red">Yes (False positive!)</p>
          </div>
        </div>

        <p className="leading-6 text-zinc-600 dark:text-zinc-400">
          The Smiley Detector appears to have issues mainly with rotated faces
          and very small faces, for which more data augmentation and/or more
          data for the dataset could be introduced to improve the model.
        </p>
      </main>
    </div>
  );
}
