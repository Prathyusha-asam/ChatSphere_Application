"use client";

import RegisterForm from "@/components/auth/RegistrationForm";
import Image from "next/image";
export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
         <Image
                  src="/images/background1.svg"
                  alt=""
                  width={120}
                  height={120}
                  className="absolute top-16 left-12 opacity-20"
                />
        
                <Image
                  src="/images/background2.svg"
                  alt=""
                  width={100}
                  height={100}
                  className="absolute top-24 right-20 opacity-15"
                />
                <Image
                  src="/images/background1.svg"
                  alt=""
                  width={120}
                  height={120}
                  className="absolute top-44 left-320 opacity-20"
                />
        
                <Image
                  src="/images/background3.svg"
                  alt=""
                  width={140}
                  height={140}
                  className="absolute top-90 left-100 opacity-10"
                />
                <Image
                  src="/images/background3.svg"
                  alt=""
                  width={140}
                  height={140}
                  className="absolute top-160 left-250 opacity-10"
                />
        
                <Image
                  src="/images/background1.svg"
                  alt=""
                  width={160}
                  height={160}
                  className="absolute bottom-24 right-24 opacity-15"
                />
        
                <Image
                  src="/images/background2.svg"
                  alt=""
                  width={110}
                  height={110}
                  className="absolute bottom-32 left-32 opacity-20"
                />
      <RegisterForm />
    </div>
  );
}
