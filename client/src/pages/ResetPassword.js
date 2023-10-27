import React, { useState } from "react";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Send a POST request to your server to reset the password
    try {
      const response = await fetch("http://localhost:4000/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, resetCode, newPassword }),
      });

      if (response.ok) {
        setMessage("Password reset successful");
      } else {
        const data = await response.json();
        setMessage(data.message || "An error occurred");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred");
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Reset Code:</label>
          <input
            type="text"
            value={resetCode}
            onChange={(e) => setResetCode(e.target.value)}
          />
        </div>
        <div>
          <label>New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <button type="submit">Reset Password</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ResetPassword;
