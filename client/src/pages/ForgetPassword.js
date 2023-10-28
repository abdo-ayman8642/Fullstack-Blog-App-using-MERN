import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import ResetPassword from "./ResetPassword";
import { MDBInput, MDBBtn } from "mdb-react-ui-kit";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [redirect, setRedirect] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:4000/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage("Password reset email sent.");
        setTimeout(() => {
          setRedirect(true);
        }, 2000);
      } else {
        setMessage("Email not found or an error occurred.");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred.");
    }
  };

  if (redirect) {
    return <ResetPassword email={email} />;
  }
  return (
    <div>
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <MDBInput
          wrapperClass="mb-4"
          label="Email address"
          id="formControlLg"
          type="text"
          size="lg"
          required
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          style={{ marginTop: "2rem" }}
        />

        <MDBBtn className="mb-0 px-5" size="lg" type="submit">
          Submit
        </MDBBtn>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ForgotPassword;
