"use client";

import * as THREE from "three";
import { createRoot } from "react-dom/client";
import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, ThreeElements } from "@react-three/fiber";
import { Suspense } from "react";
import "./styles.css";

function CanvasScene() {
  let canvas;
  let context;
  let drawingCanvas;
  let drawingContext;

  const scene = new THREE.Scene();

  const fov = 35; // AKA Field of View
  const aspect = 1; // Because clientWidth / clientHeight is 300/300
  const near = 0.1; // the near clipping plane
  const far = 100; // the far clipping plane
  let renderer;
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

  let drawingTexture;

  let drawingMaterial;

  const mouse = new THREE.Vector2();

  const drawingParams = {
    isDrawing: false,
    draw: true,
    brushSize: 10,
    brushColor: "#0074d9",
  };

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  // @source: https://stackoverflow.com/a/52672952/9457623
  function generateImg() {
    let newCanvas = drawingCanvas.cloneNode(true);
    var ctx = newCanvas.getContext("2d");
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
    ctx.drawImage(drawingCanvas, 0, 0);
    const url = newCanvas.toDataURL("image/jpeg");
    const link = document.createElement("a");
    link.download = "chart.png";
    link.href = url;
    link.click();
  }

  const geometry = new THREE.BoxGeometry(300, 300, 1);

  let boxMesh;
  function initCanvasWhiteBox() {
    boxMesh = new THREE.Mesh(geometry, drawingMaterial);
    scene.add(boxMesh);
  }

  // @source: https://jsfiddle.net/4jk0c83L/
  function onPointerDown(event) {
    if (!drawingParams.draw) {
      console.log("draw is false");
      return;
    }

    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(boxMesh);

    if (intersects.length > 0) {
      drawingParams.isDrawing = true;
      draw(intersects[0].uv);
    } else {
      console.log("no intersections");
    }
  }

  function onPointerMove(event) {
    if (!drawingParams.isDrawing) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(boxMesh);

    if (intersects.length > 0) {
      draw(intersects[0].uv);
    }
  }

  function onPointerUp() {
    drawingParams.isDrawing = false;
  }

  // @source: https://stackoverflow.com/a/18053642/9457623
  function draw(uv) {
    // Corrected UV to canvas coords
    const rect = canvas.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // context is 2D for the drawingContext, webgl2 for the scene
    drawingContext.beginPath();
    drawingContext.arc(x, y, 10, 0, Math.PI * 2);
    drawingContext.fillStyle = "green";
    drawingContext.fill();
  }

  useEffect(() => {
    const canvasContainer = document.querySelector("#scene-container");

    drawingCanvas = document.getElementById("drawingCanvas");
    drawingContext = drawingCanvas.getContext("2d");

    drawingTexture = new THREE.CanvasTexture(canvas);
    drawingTexture.colorSpace = THREE.SRGBColorSpace;

    drawingMaterial = new THREE.MeshBasicMaterial({
      map: drawingTexture,
      transparent: true,
      visible: false,
    });
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(300, 300);
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    if (canvasContainer.childElementCount == 1) {
      canvas = renderer.domElement;
      canvas.id = "canvas";
      canvasContainer.appendChild(canvas);
      context = canvas.getContext("webgl2");
    }
    initCanvasWhiteBox();

    animate();

    return () => {
      renderer.dispose();
      drawingTexture.dispose();
      canvas.remove();
    };
  });

  return (
    <div>
      <div id="scene-container">
        <canvas id="drawingCanvas" width={300} height={300}></canvas>
      </div>

      <button onClick={generateImg}> Download image </button>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Smiley Detector
          </h1>
          <h2>
            Use the canvas to draw a smiley face! Or not. The Smiley Detector
            will determine the likelihood that the drawing is a smile.
          </h2>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            TODO
          </p>
        </div>
        <div>
          <Suspense>
            <CanvasScene />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
