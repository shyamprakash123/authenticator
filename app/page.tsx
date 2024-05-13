"use client";

import { useEffect } from "react";
import Link from "next/link";

const LandingPage = () => {
  useEffect(() => {
    if (localStorage.getItem("user")) {
      window.location.href = "/dashboard";
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-6xl font-extrabold text-gray-600">
            Authenticator
          </h2>
        </div>
        <h1 className="mt-6 text-center text-2xl font-extrabold text-teal-600">
          Get Started
          <span>
            <Link
              href={"/login"}
              className="bg-teal-600 text-white p-2 rounded-md ml-4 text-xl"
            >
              Login
            </Link>
          </span>
        </h1>
      </div>
    </div>
  );
};

export default LandingPage;
