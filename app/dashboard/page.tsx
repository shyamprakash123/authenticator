"use client";

import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
  const [localStorageUser, setLocalStorageUser] = useState<any>(null);
  const [accountType, setAccountType] = useState<string>("");
  const [authToken, setAuthToken] = useState<string>("");
  const [authCode, setAuthCode] = useState<any[]>([]);
  const [timer, setTimer] = useState<number>(60);

  const fetchAuthCode = async () => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      if (user) {
        const parsedUser = JSON.parse(user);
        const codeResponse = await fetch("/api/twoFactorCode", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: parsedUser.id,
            accountType,
          }),
        });
        const res = await codeResponse.json();
        if (!codeResponse.ok) {
          throw new Error("Failed to fetch Auth Token " + res.error);
        }
        setAuthCode(res.data);
      }
    }
  };

  useEffect(() => {
    const fetchAuthToken = async () => {
      if (typeof window !== "undefined") {
        const user = localStorage.getItem("user");
        const accountType = localStorage.getItem("accountType");
        if (user && accountType) {
          const parsedUser = JSON.parse(user);
          setLocalStorageUser(parsedUser);
          setAccountType(accountType);
          const authResponse = await fetch("/api/authToken", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: parsedUser.id,
              accountType,
            }),
          });
          const authres = await authResponse.json();
          if (!authResponse.ok) {
            throw new Error("Failed to fetch Auth Token " + authres.error);
          }
          setAuthToken(authres.data.token);

          const codeResponse = await fetch("/api/twoFactorCode", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: parsedUser.id,
              accountType,
            }),
          });
          const res = await codeResponse.json();
          if (!codeResponse.ok) {
            throw new Error("Failed to fetch Auth Token " + res.error);
          }
          setAuthCode(res.data);
        }
      }
    };
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 1) fetchAuthCode();
        return prevTimer === 0 ? 60 : prevTimer - 1;
      });
    }, 1000);

    fetchAuthToken();

    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (authCode: string) => {
    toast.success("Copied to clipboard");
    navigator.clipboard.writeText(authCode);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <ToastContainer />
      <div className="absolute top-0 left-0 p-2">
        <h1 className="text-xl font-bold mb-4 ">Autentication Token</h1>
        <button
          className="flex bg-gray-400 hover:bg-gray-600/70 text-white py-2 px-4 rounded items-center"
          onClick={() => copyToClipboard(authToken)}
        >
          <span className="text-2xl font-bold mr-2 bg-gray-500 p-1 rounded">
            {authToken}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            id="copy"
            className="w-6 h-6"
          >
            <path
              fill="#FFFFFF"
              d="M21,8.94a1.31,1.31,0,0,0-.06-.27l0-.09a1.07,1.07,0,0,0-.19-.28h0l-6-6h0a1.07,1.07,0,0,0-.28-.19.32.32,0,0,0-.09,0A.88.88,0,0,0,14.05,2H10A3,3,0,0,0,7,5V6H6A3,3,0,0,0,3,9V19a3,3,0,0,0,3,3h8a3,3,0,0,0,3-3V18h1a3,3,0,0,0,3-3V9S21,9,21,8.94ZM15,5.41,17.59,8H16a1,1,0,0,1-1-1ZM15,19a1,1,0,0,1-1,1H6a1,1,0,0,1-1-1V9A1,1,0,0,1,6,8H7v7a3,3,0,0,0,3,3h5Zm4-4a1,1,0,0,1-1,1H10a1,1,0,0,1-1-1V5a1,1,0,0,1,1-1h3V7a3,3,0,0,0,3,3h3Z"
            ></path>
          </svg>
        </button>
      </div>
      <h1 className="text-3xl font-bold mb-4">
        {authCode.length > 0 ? "Autentication Codes" : "No apps linked"}
      </h1>
      <div className="w-full max-w-md">
        <div className="mb-4">
          <ul>
            {authCode.map((app: any) => (
              <li
                key={app.name}
                className={`py-2 px-4 cursor-pointer flex items-center`}
              >
                <h1 className="mr-4 text-2xl font-bold">
                  {app.appName}
                  {` - `}
                </h1>

                <div className="flex items-center">
                  <div className="flex items-center space-x-4 mr-4">
                    <button
                      className="flex bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded items-center"
                      onClick={() => copyToClipboard(app.code)}
                    >
                      <span className="text-2xl font-bold mr-2 bg-gray-400 p-1 rounded">
                        {app.code}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        id="copy"
                        className="w-6 h-6"
                      >
                        <path
                          fill="#FFFFFF"
                          d="M21,8.94a1.31,1.31,0,0,0-.06-.27l0-.09a1.07,1.07,0,0,0-.19-.28h0l-6-6h0a1.07,1.07,0,0,0-.28-.19.32.32,0,0,0-.09,0A.88.88,0,0,0,14.05,2H10A3,3,0,0,0,7,5V6H6A3,3,0,0,0,3,9V19a3,3,0,0,0,3,3h8a3,3,0,0,0,3-3V18h1a3,3,0,0,0,3-3V9S21,9,21,8.94ZM15,5.41,17.59,8H16a1,1,0,0,1-1-1ZM15,19a1,1,0,0,1-1,1H6a1,1,0,0,1-1-1V9A1,1,0,0,1,6,8H7v7a3,3,0,0,0,3,3h5Zm4-4a1,1,0,0,1-1,1H10a1,1,0,0,1-1-1V5a1,1,0,0,1,1-1h3V7a3,3,0,0,0,3,3h3Z"
                        ></path>
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-24 h-24 relative">
                      <svg className="absolute" width="100%" height="100%">
                        <circle
                          cx="50%"
                          cy="50%"
                          r="45%"
                          fill="none"
                          stroke="#d1d5db"
                          strokeWidth="10%"
                        />
                        <circle
                          className="animate-draw"
                          cx="50%"
                          cy="50%"
                          r="45%"
                          fill="none"
                          stroke="#059669"
                          strokeWidth="10%"
                          strokeDasharray="283"
                          strokeDashoffset={283 - (283 * timer) / 60}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl font-semibold">
                        {timer}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
