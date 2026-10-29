"use client";

import * as THREE from "three";
import { createRoot } from "react-dom/client";
import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, ThreeElements } from "@react-three/fiber";
import { Suspense } from "react";
import "./styles.css";

function CanvasScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("skyblue");

  //const container = document.querySelector("#scene-container");

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
  //const light = new THREE.PointLight(0xffffff, 1, 100);
  //light.position.set(0, 10, 10);
  scene.add(camera);
  //scene.add(light);

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  function generateImg() {
    console.log("making img");
    const url = renderer.domElement.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "chart.png";
    link.href = url;
    link.click();
  }

  function initCanvasWhiteBox() {
    const geometry = new THREE.BoxGeometry(300, 300, 1);
    const material = new THREE.MeshBasicMaterial();

    const boxMesh = new THREE.Mesh(geometry, material);
    scene.add(boxMesh);
    renderer.render(scene, camera);
  }

  useEffect(() => {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(300, 300);
    const canvasContainer = document.querySelector("#scene-container");
    if (canvasContainer.childElementCount == 0) {
      canvasContainer.appendChild(renderer.domElement);
    }
    initCanvasWhiteBox();
  });

  return (
    <div>
      <div id="scene-container"></div>
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
