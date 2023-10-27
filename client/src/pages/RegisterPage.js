import React from "react";
import { useState } from "react";
import successImg from "../assets/undraw_welcoming_re_x0qo.svg";
import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBCol,
  MDBRow,
  MDBInput,
  MDBCheckbox,
  MDBIcon,
} from "mdb-react-ui-kit";
import { Link, Navigate } from "react-router-dom";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [showAlert, setShowAlert] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [errorConfirm, setErrorConfirm] = useState("");

  const togglePasswordVisibility = (field) => {
    field === "password"
      ? setShowPassword(!showPassword)
      : setShowConfirmPassword(!showConfirmPassword);
  };

  async function register(ev) {
    ev.preventDefault();

    if (error || errorConfirm) return;
    const response = await fetch("http://localhost:4000/register", {
      method: "POST",
      body: JSON.stringify({ username, password, email, firstname, lastname }),
      headers: { "Content-Type": "application/json" },
    });
    const json = await response.json();
    if (response.status === 200) {
      setShowAlert({ status: "ok" });
      setTimeout(() => {
        setShowAlert(null);
      }, 2000);
      setRedirect(true);
    } else {
      if (json.code === 11000) {
        const keys = Object.keys(json.keyPattern);

        if (keys.length > 0) {
          const key = keys[0];
          setShowAlert({ status: "no", message: `This ${key} is taken` });
        }
      } else setShowAlert({ status: "no", message: `Something went wrong` });
      setTimeout(() => {
        setShowAlert(null);
      }, 2000);
    }
  }
  // if (redirect) {
  //   return <Navigate to={"/login"} />;
  // }

  const validatePassword = (password) => {
    // Use a regular expression to check for the required criteria
    if (!password) return true;

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    return regex.test(password);
  };

  const onChangePassword = (password) => {
    console.log(password);
    setPassword(password);

    validatePassword(password)
      ? setError("")
      : setError(
          "Password must contain at least one uppercase letter, one lowercase letter, and one numerical character."
        );
  };
  const onChangeConfirmPassword = (confirmedPassword) => {
    setConfirmPassword(confirmedPassword);

    confirmedPassword === password || confirmedPassword === ""
      ? setErrorConfirm("")
      : setErrorConfirm("Entered Password are not matched");
  };

  return (
    <>
      {redirect ? (
        <div style={{ display: "flex", marginTop: "8rem", padding: "0 5rem" }}>
          {showAlert && (
            <div
              class={`alert alert-success d-inline-block p-4`}
              style={{ position: "absolute", right: "20px", bottom: 0 }}
              role="alert"
            >
              <div>Successfully Added User</div>
            </div>
          )}

          <img src={successImg} style={{ width: "40%" }} />
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div>
              <h3>Welcome</h3>
              <h3 style={{ opacity: "0.8", marginBottom: "1rem" }}>
                Ready to start ?
              </h3>
              <Link to={"/login"}>
                <button type="button" class="btn btn-primary">
                  Login
                </button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={register}>
          {showAlert && (
            <div
              class={`alert alert-${
                showAlert.status === "ok" ? "success" : "danger"
              } d-inline-block p-4`}
              style={{ position: "absolute", right: "20px", bottom: 0 }}
              role="alert"
            >
              <div>
                {showAlert.status === "ok"
                  ? "Successfully Added User"
                  : showAlert.message}
              </div>
            </div>
          )}
          <MDBContainer fluid>
            <MDBCard
              className="mx-5 mb-5 p-3 shadow-5"
              style={{
                background: "hsla(0, 0%, 100%, 0.8)",
                backdropFilter: "blur(30px)",
              }}
            >
              <MDBCardBody className="p-5 text-center">
                <h2 className="fw-bold mb-5">Join The Blog</h2>

                <MDBRow>
                  <MDBCol col="6">
                    <MDBInput
                      wrapperClass="mb-4"
                      label="First name"
                      id="form1"
                      type="text"
                      value={firstname}
                      onChange={(ev) => setFirstname(ev.target.value)}
                      required
                    />
                  </MDBCol>

                  <MDBCol col="6">
                    <MDBInput
                      wrapperClass="mb-4"
                      label="Last name"
                      id="form1"
                      type="text"
                      value={lastname}
                      onChange={(ev) => setLastname(ev.target.value)}
                      required
                    />
                  </MDBCol>
                </MDBRow>

                <MDBInput
                  wrapperClass="mb-4"
                  label="Email"
                  id="form1"
                  type="email"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  required
                />
                <MDBInput
                  wrapperClass="mb-4"
                  label="Username"
                  id="form1"
                  type="text"
                  value={username}
                  onChange={(ev) => setUsername(ev.target.value)}
                  required
                />
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
                        <i
                          className="far fa-eye"
                          style={{ opacity: "0.5" }}
                        ></i>
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
                <div className="password-input-container">
                  <MDBInput
                    wrapperClass={`mb-${errorConfirm ? "1" : "4"}`}
                    label="Confirm Password"
                    id="form1"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(ev) => onChangeConfirmPassword(ev.target.value)}
                    required
                  >
                    <span
                      className="password-toggle-icon"
                      onClick={() => togglePasswordVisibility("confirm")}
                    >
                      {showConfirmPassword ? (
                        <i className="far fa-eye-slash"></i>
                      ) : (
                        <i
                          className="far fa-eye"
                          style={{ opacity: "0.5" }}
                        ></i>
                      )}
                    </span>
                  </MDBInput>
                  {errorConfirm && (
                    <div
                      className="error-message text-start mb-2"
                      style={{ fontSize: "12px", color: "red", opacity: 0.7 }}
                    >
                      {errorConfirm}
                    </div>
                  )}
                </div>

                <MDBBtn className="w-100 mb-4" size="md" type="submit">
                  sign up
                </MDBBtn>

                {/* <div className="text-center">
            <p>or sign up with:</p>

            <MDBBtn
              tag="a"
              color="none"
              className="mx-3"
              style={{ color: "#1266f1" }}
            >
              <MDBIcon fab icon="facebook-f" size="sm" />
            </MDBBtn>

            <MDBBtn
              tag="a"
              color="none"
              className="mx-3"
              style={{ color: "#1266f1" }}
            >
              <MDBIcon fab icon="twitter" size="sm" />
            </MDBBtn>

            <MDBBtn
              tag="a"
              color="none"
              className="mx-3"
              style={{ color: "#1266f1" }}
            >
              <MDBIcon fab icon="google" size="sm" />
            </MDBBtn>

            <MDBBtn
              tag="a"
              color="none"
              className="mx-3"
              style={{ color: "#1266f1" }}
            >
              <MDBIcon fab icon="github" size="sm" />
            </MDBBtn>
          </div> */}
              </MDBCardBody>
            </MDBCard>
          </MDBContainer>
        </form>
      )}
    </>
  );
}

export default RegisterPage;
