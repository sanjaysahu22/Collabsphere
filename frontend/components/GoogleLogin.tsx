"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import for navigation
import { auth, provider } from "./firebase";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  signOut, 
  deleteUser 
} from "firebase/auth";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { Button } from "./ui/button";
import { useUserContext } from "../lib/usercontext";

const getFingerprint = async () => {
  const fp = await FingerprintJS.load();
  const devicedata = await fp.get();
  return devicedata.visitorId; // Unique fingerprint ID
};

const GoogleLogin = () => {
  const router = useRouter(); // Initialize router
  const { setUser } = useUserContext();
  const [user_email, set_user_email] = useState("");
  const [user_password, set_user_password] = useState("");

  useEffect(() => {
    fetch("https://collabsphere-d7g1.onrender.com/auto_login", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
    .then(res => res.json())
    .then(data => console.log("Server Response:", data));
  }, []);

  const userlogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      const user_credential = await signInWithEmailAndPassword(auth, `${user_email}@iiitkottayam.ac.in`, user_password);
      const user = user_credential.user;
      const idToken = await user.getIdToken();
      const uid = await user.uid;
      const fingerprint = await getFingerprint();

      const response = await fetch("https://collabsphere-d7g1.onrender.com/verify/user_id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, uid, fingerprint, user_email }),
        credentials: "include",
      });

      const data = await response.json();
      console.log("Server Response:", data);

      // ✅ Navigate to dashboard if successful
      if (response.ok) {
        // Update UserContext with user data
        setUser({
          id: data.roll_no
        });
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogin = async () => {
    try {
      provider.setCustomParameters({ prompt: "select_account" }); // ✅ Set it first
      const result = await signInWithPopup(auth, provider);
        const user = result.user;
      const email = user.email;

      if (email?.endsWith("iiitkottayam.ac.in")) {
        console.log("User allowed", user);
      } else {
        console.error("Unauthorized domain");
        await signOut(auth);
        await deleteUser(user).catch((error) => console.error("Error deleting unauthorized user:", error));
        return;
      }

      const idToken = await user.getIdToken();
      const uid = user.uid;
      const fingerprint = await getFingerprint();

      const response = await fetch("https://collabsphere-d7g1.onrender.com/verify/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, uid, fingerprint, email }),
        credentials: "include",
      });

      const data = await response.json();
      console.log("Server Response:", data);
      console.log(response.ok , "allowed ")
      if (response.ok) {
        setUser({
          id: data.roll_no,
         
        });
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login Failed:", error);
    }
  };

  return (
    <>
      <Button
        onClick={handleLogin}
        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-2 rounded-md"
      >
        LogIn
      </Button>
    </>
  );
};

export default GoogleLogin;
