"use client";
import { Loadmodels } from "@/utils/loadmodels";
import React, { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";

function Webcamfeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamref = useRef<MediaStream>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const startWebCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamref.current = stream;
      }
    } catch (error) {
      alert("There is a problem starting the webcam");
    }
  };

  const stopWebcam = async () => {
    if (streamref.current) {
      streamref.current.getTracks().forEach((track) => track.stop());
      streamref.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };
  useEffect(() => {
    const run = async () => {
      await Loadmodels();

      const interval = setInterval(async () => {
        if (
          !videoRef.current ||
          videoRef.current.readyState !== 4 ||
          !canvasRef.current
        )
          return;

        const detections = await faceapi
          .detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks()
          .withFaceExpressions()
          .withFaceDescriptors()
          .withAgeAndGender();

        if (detections.length > 0) {
          const { width, height } = videoRef.current.getBoundingClientRect();
          const displaySize = {
            width: Math.round(width),
            height: Math.round(height),
          };

          faceapi.matchDimensions(canvasRef.current, displaySize);
          const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
          );

          canvasRef.current
            .getContext("2d")
            ?.clearRect(
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height
            );
          faceapi.draw.drawDetections(canvasRef.current, resizedDetections);

          resizedDetections.forEach((detection) => {
            const { age, gender, expressions } = detection;
            const { x, y } = detection.detection.box;

            const bestExpression = Object.entries(expressions).reduce(
              (prev, curr) => (curr[1] > prev[1] ? curr : prev)
            )[0];

            const ctx = canvasRef.current?.getContext("2d");
            if (ctx) {
              const lines = [
                `${gender}`,
                ` ${Math.round(age)}`,
                ` ${bestExpression}`,
              ];

              const lineHeight = 20;
              const padding = 10;
              const boxWidth = 150;
              const boxHeight = lines.length * lineHeight + padding;

              ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
              ctx.fillRect(x, y - boxHeight, boxWidth, boxHeight);

              (ctx.fillStyle = "white"),
                (ctx.font = "16px"),
                lines.forEach((line, i) => {
                  ctx.fillText(
                    line,
                    x + 10,
                    y - boxHeight + padding + i * lineHeight
                  );
                });
            }
          });
        } else {
          console.log("no face detected");
        }
      }, 1000);

      return () => clearInterval(interval);
    };

    run();
  }, []);

  return (
    <div className="w-full h-auto flex flex-col justify-center gap-5 items-center">
      <div className="w-full flex flex-col gap-2">
        <div className="relative w-full lg:w-[60vw] mx-auto px-5 lg:p-0">
          <video
            className="w-full h-[60vh] object-fill rounded-lg border border-dashed border-zinc-500"
            ref={videoRef}
            autoPlay
            muted
            playsInline
          />
          <canvas ref={canvasRef} className="absolute inset-0" />
        </div>

        <div className="w-[60vw] mx-auto flex gap-2">
          <button
            onClick={startWebCam}
            className="w-full p-1.5 bg-[#432F91] rounded-md text-white cursor-pointer"
          >
            Start
          </button>
          <button
            onClick={stopWebcam}
            className="w-full p-1 bg-[#E11474] rounded-md text-white cursor-pointer"
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}

export default Webcamfeed;
