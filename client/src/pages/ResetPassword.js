import React, { useState } from "react";
import { MDBInput, MDBBtn } from "mdb-react-ui-kit";
import { Navigate } from "react-router-dom";

function ResetPassword({ email }) {
  const [resetCode, setResetCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [redirect, setRedirect] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (error) return;

    // Send a POST request to your server to reset the password
    try {
      const response = await fetch("http://localhost:4000/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, resetCode, password }),
      });

      if (response.ok) {
        setMessage("Password reset successful");
        setTimeout(() => {
          setRedirect(true);
        }, 2000);
      } else {
        const data = await response.json();
        setMessage(data.message || "An error occurred");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validatePassword = (password) => {
    // Use a regular expression to check for the required criteria
    if (!password) return true;

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    return regex.test(password);
  };

  const onChangePassword = (password) => {
    setPassword(password);

    validatePassword(password)
      ? setError("")
      : setError(
          "Password must contain at least one uppercase letter, one lowercase letter, and one numerical character."
        );
  };

  if (redirect) {
    return <Navigate to={"/login"} />;
  }

  return (
    <div>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginTop: "1rem" }}>
          <MDBInput
            wrapperClass={`mb-3`}
            label="Reset Code"
            id="form1"
            type="text"
            value={resetCode}
            onChange={(e) => setResetCode(e.target.value)}
            required
          ></MDBInput>
        </div>

        <div className="password-input-container">
          <MDBInput
            wrapperClass={`mb-${error ? "1" : "4"}`}
            label="Password"
            id="form1"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(ev) => onChangePassword(ev.target.value)}
            required
          >
            <span
              className="password-toggle-icon"
              onClick={() => togglePasswordVisibility("password")}
            >
              {showPassword ? (
                <i className="far fa-eye-slash"></i>
              ) : (
                <i className="far fa-eye" style={{ opacity: "0.5" }}></i>
              )}
            </span>
          </MDBInput>

          {error && (
            <div
              className="error-message text-start mb-2"
              style={{ fontSize: "12px", color: "red", opacity: 0.7 }}
            >
              {error}
            </div>
          )}
        </div>
        <MDBBtn className="mb-0 px-5" size="lg" type="submit">
          Reset Password
        </MDBBtn>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ResetPassword;
