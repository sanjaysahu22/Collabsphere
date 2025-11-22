import React, { useState,useEffect } from "react";
import { auth, provider,db} from "./firebase";
import { signInWithPopup,signInWithEmailAndPassword,createUserWithEmailAndPassword, EmailAuthProvider,linkWithCredential,  fetchSignInMethodsForEmail,linkWithPopup,GoogleAuthProvider 
 ,signOut, deleteUser} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { collection, query, where, getDocs,deleteDoc } from "firebase/firestore";


const getFingerprint = async () => {
  const fp = await FingerprintJS.load();
  const devicedata = await fp.get();
  return devicedata.visitorId; // Unique fingerprint ID
};




// ...

const GoogleLogin = () => {
  const [user_email,set_user_email]=useState("")
  const [user_password,set_user_password]=useState("")
 
  useEffect(() => {
  



    fetch("http://127.0.0.1:5000/auto_login", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    
      credentials:"include",
  }) .then(res => res.json())
  .then(data => console.log("Server Response:", data));
  
  
  
  
    
  }, []);
  const userlogin=async(e)=>{
    e.preventDefault();

    // Link the credential to the Google account

     const user_credential = await signInWithEmailAndPassword(auth, user_email+"@iiitkottayam.ac.in",user_password)
    //createUserWithEmailAndPassword(auth, user_email, user_password)
    const  user=user_credential.user
     const idToken = await user.getIdToken(); // Firebase token
     const uid =  await user.uid;
     const fingerprint = await getFingerprint(); // Generate this
      
      /////////
      const response = await fetch("http://127.0.0.1:5000/verify/user_id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, uid, fingerprint,user_email }),
        credentials: "include",
    });
    const data = await response.json();
    console.log("Server Response:", data);
    
    }
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider.setCustomParameters({prompt:"select_account"}));
    
      const user = result.user;
      const email=user.email
    if(email.endsWith("iiitkottayam.ac.in")){
         console.log("user allowed",user)
     

    }
    else{
    
      console.error("Unauthorized domain");
      await signOut(auth);

      // (Optional) Delete the user account from Firebase Authentication
      await deleteUser(user).catch((error) => {
        console.error("Error deleting unauthorized user:", error);
      });
      return 

    }
      const idToken = await user.getIdToken(); // Firebase token
      const uid = user.uid;
      const fingerprint = await getFingerprint(); // Generate this

      
             console.log(fingerprint)
     fetch("http://127.0.0.1:5000/verify/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, uid, fingerprint,email }),
        credentials:"include",
    })
    .then(res => res.json())
    .then(data => console.log("Server Response:", data));
    } catch (error) {
      console.error("Login Failed:", error);
    }
  };

  return (
  <>
  <label>Username:</label>
  <form onSubmit={userlogin}>
  <input type="text" className="user_email" value={user_email} onChange={(e)=>set_user_email(e.target.value)}/>
  <br/>
  <label>Password:</label>
  <input type="password" className="user_password" value={user_password} onChange={(e)=>set_user_password(e.target.value)}/>
  <br/><br/>
  
  <button type="submit">Login</button>
  </form>


 <br/>
  <button onClick={handleLogin}>Sign in with Google</button>
  </>

  )
};

export default GoogleLogin;
