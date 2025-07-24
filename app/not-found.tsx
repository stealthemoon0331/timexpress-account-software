"use client";

import Image from "next/image";
import NotFoundImg from "./../public/assets/img/not_found.png"
import { ArrowBigLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div
    className="relative"
    style={{
        textAlign: "center",
        padding: "50px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        // background: '#20faf6',
        color: '#fff',
        backgroundColor: "#E1EFFF"
      }}
    >
      <Image src={NotFoundImg} className="w-auto h-auto" alt="Not Found"/>
      <button className="flex absolute z-50 bg-blue-500 p-4 mt-4 rounded-md hover:bg-blue-700 text-center" onClick={() => router.push("/")}>
        <ArrowBigLeft/> 
        <p>Back To Home</p>
      </button>
      
      {/* <h1 className="text-5xl text-red-700 font-semibold mb-10">
        404 Page Not Found
      </h1> */}
      {/* <p className="text-xl text-red-500">The page you are looking for does not exist.</p> */}
    </div>
  );
}
