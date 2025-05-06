"use client";
import { useState } from "react";
import Imagefeed from "./Imagefeed";
import Webcamfeed from "./Webcamfeed";

function Header() {
  const [DetectType, setDetectType] = useState("Webcam");

  return (
    <header className="w-full h-auto flex flex-col justify-center gap-5 items-center p-5">
      <h1 className="text-4xl text-[#432F91] font-semibold flex justify-center items-center">
        Voicera WebDev Frontend
      </h1>
      <div className="w-full md:w-[60vw] lg:w-[25vw] h-12 mx-auto rounded-full text-white bg-[#432F91] p-1 flex">
        <button
          onClick={() => setDetectType("Webcam")}
          className={`w-[50%] rounded-full  flex justify-center items-center cursor-pointer  ${
            DetectType === "Webcam" ? "bg-[#E11474]" : "bg-[#432F91]"
          }`}
        >
          Webcam
        </button>
        <button
          onClick={() => setDetectType("image")}
          className={`w-[50%] rounded-full  flex justify-center items-center cursor-pointer ${
            DetectType === "image" ? "bg-[#E11474]" : "bg-[#432F91]"
          }`}
        >
          Upload Image
        </button>
      </div>
      {DetectType === "Webcam" ? <Webcamfeed /> : <Imagefeed />}
    </header>
  );
}

export default Header;
