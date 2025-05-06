"use client";
import { Loadmodels } from "@/utils/loadmodels";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import Dropzone from "react-dropzone";
import { CloudDownload, X } from "lucide-react";

function Imagefeed() {
  const [images, setImages] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImage = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    try {
      const imageURL = URL.createObjectURL(file);
      setImages(imageURL);
    } catch (error) {
      alert("Image not accepted");
    }
  };

  useEffect(() => {
    Loadmodels();
  }, []);

  const handleLoadDetect = async () => {
    if (!imageRef.current || !canvasRef.current) return;
    setLoading(true);

    const detections = await faceapi
      .detectAllFaces(imageRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withFaceDescriptors()
      .withAgeAndGender();

    if (detections.length > 0) {
      const displaySize = {
        width: imageRef.current.width,
        height: imageRef.current.height,
      };
      faceapi.matchDimensions(canvasRef.current, displaySize);

      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      canvasRef.current
        .getContext("2d")
        ?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

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
            `${bestExpression}`,
          ];

          const lineHeight = 20;
          const padding = 20;
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

      setLoading(false);
    } else {
      setLoading(false);
      alert("No face detected!. Please upload proper image.");
    }
  };

  const handleRemoveImage = () => {
    setImages(null);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  return (
    <section className="w-full h-auto">
      <div className="w-60 h-80 relative mx-auto">
        {images ? (
          <>
            <Image
              onLoad={handleLoadDetect}
              ref={imageRef}
              className="w-full h-full object-fill"
              src={images!}
              alt="image"
              width={200}
              height={200}
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-0 -right-8 z-20 bg-[#E11474] rounded-r-lg cursor-pointer"
            >
              <X className="size-8 text-white" />
            </button>
          </>
        ) : (
          <Dropzone
            onDropAccepted={handleImage}
            maxSize={5 * 1024 * 1024}
            accept={{
              "image/png": [".png"],
              "image/jpg": [".jpg"],
              "image/jpeg": [".jpeg"],
            }}
          >
            {({ getRootProps, getInputProps }) => (
              <div
                className="w-full h-full border border-dashed border-black bg-gray-200 rounded-md cursor-pointer"
                {...getRootProps()} // This is where the dropzone functionality is tied to the div
              >
                <input {...getInputProps()} />

                <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
                  <CloudDownload className="text-black/50" />
                  <p className="text-center text-xs flex flex-col text-black/70">
                    <span className="font-bold text-black">
                      Click to upload
                    </span>
                    <span>or</span>
                    <span>drag it here</span>
                  </p>
                </div>
              </div>
            )}
          </Dropzone>
        )}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-60 h-80 pointer-events-none"
        ></canvas>
      </div>
      {loading && (
        <p className="w-full flex justify-center items-center text-xl tracking-wide animate-pulse p-5">
          Loading...
        </p>
      )}
    </section>
  );
}

export default Imagefeed;
