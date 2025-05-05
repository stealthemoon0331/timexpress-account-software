"use client";

import dynamic from "next/dynamic";

const InputWrapper = dynamic(() => import('./ui/input'), { ssr: false,
  });
  
  export default InputWrapper;

