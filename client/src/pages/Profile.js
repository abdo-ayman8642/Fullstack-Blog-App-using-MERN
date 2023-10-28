import React, { useState, useEffect, useContext } from "react";
import { Navigate, useParams } from "react-router-dom";
import NotFound from "../assets/undraw_page_not_found_re_e9o6.svg";
import Switch from "@mui/material/Switch";
import {
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBCard,
  MDBCardText,
  MDBCardBody,
  MDBInput,
  MDBCardImage,
  MDBBtn,
} from "mdb-react-ui-kit";
import { UserContext } from "../UserContext";

const label = { inputProps: { "aria-label": "Switch demo" } };

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const { setUserInfo, userInfo } = useContext(UserContext);
  const [changePassword, setChangePassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState(userInfo.firstname);
  const [lastName, setLastName] = useState(userInfo.lastname);
  const [email, setEmail] = useState(userInfo.email);
  const [phone, setPhone] = useState(userInfo.phone);
  const [address, setAddress] = useState(userInfo.address);
  const [title, setTitle] = useState(userInfo.title);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [editMode, setEditMode] = useState(false);
  const { id } = useParams();
  const [errorConfirm, setErrorConfirm] = useState("");

  const togglePasswordVisibility = (field) => {
    field === "password"
      ? setShowPassword(!showPassword)
      : field === "current"
      ? setShowCurrentPassword(!showCurrentPassword)
      : setShowConfirmPassword(!showConfirmPassword);
  };
  const editPassword = async (ev) => {
    ev.preventDefault();
    if (error || errorConfirm) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/profile/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          password,
          firstName,
          lastName,
          email,
          phone,
          address,
          changePassword,
          currentPassword,
        }),
        credentials: "include",
      });
      const returned = await response.json();
      setLoading(false);
      setUserInfo(returned?.user);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
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
    if (confirmPassword) {
      confirmPassword === password
        ? setErrorConfirm("")
        : setErrorConfirm("Entered Password are not matched");
    }
  };

  const onChangeConfirmPassword = (confirmedPassword) => {
    setConfirmPassword(confirmedPassword);

    confirmedPassword === password || confirmedPassword === ""
      ? setErrorConfirm("")
      : setErrorConfirm("Entered Password are not matched");
  };

  const deleteProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/profile/${id}`, {
        credentials: "include",
        method: "DELETE",
      });
      await response.json();
      setRedirect(true);
      setLoading(false);
      setUserInfo(null);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const getProfile = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:4000/profile/${id}`, {
          credentials: "include",
        });
        const data = await response.json();
        setUserInfo(data);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  if (loading)
    return (
      <div class="text-center ">
        <div class="spinner-border" role="status" style={{ marginTop: "5rem" }}>
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  if (redirect) {
    return <Navigate to={"/"} />;
  }
  return (
    <section style={{ backgroundColor: "#eee" }}>
      {userInfo ? (
        <MDBContainer className="py-4">
          {editMode ? (
            <>
              <form onSubmit={editPassword}>
                <MDBRow style={{ display: "flex", alignItems: "center" }}>
                  <MDBCol
                    lg="4"
                    style={{ marginBottom: "1rem", alignSelf: "start" }}
                  >
                    <MDBCard>
                      <MDBCardBody className="text-center">
                        <MDBCardImage
                          src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp"
                          alt="avatar"
                          className="rounded-circle"
                          style={{ width: "150px", marginBottom: "1rem" }}
                          fluid
                        />
                        {/* <p className="text-muted mb-1">{userInfo?.title}</p> */}
                        <MDBInput
                          id="form1"
                          type="text"
                          label="Title"
                          className="text-muted mb-1"
                          value={title}
                          onChange={(ev) => setTitle(ev.target.value)}
                          required
                        />
                        {/* <div className="d-flex justify-content-center mb-2">
                    <MDBBtn>Follow</MDBBtn>
                    <MDBBtn outline className="ms-1">
                      Message
                    </MDBBtn>
                  </div> */}
                      </MDBCardBody>
                    </MDBCard>
                  </MDBCol>
                  <MDBCol lg="8">
                    <MDBCard className="mb-4">
                      <MDBCardBody>
                        <MDBRow>
                          <MDBCol sm="3" style={{ marginBottom: "1rem" }}>
                            <MDBCardText>Full Name</MDBCardText>
                          </MDBCol>
                          <MDBCol
                            sm="9"
                            style={{ display: "flex", gap: "1rem" }}
                          >
                            {/* <MDBCardText className="text-muted">
                        {userInfo?.firstname + " " + userInfo?.lastname}
                      </MDBCardText> */}
                            <MDBInput
                              id="form1"
                              type="text"
                              label="First Name"
                              value={firstName}
                              onChange={(ev) => setFirstName(ev.target.value)}
                              style={{ paddingTop: "10px" }}
                              required
                            />
                            <MDBInput
                              id="form1"
                              type="text"
                              label="Last Name"
                              value={lastName}
                              onChange={(ev) => setLastName(ev.target.value)}
                              style={{ paddingTop: "10px" }}
                              required
                            />
                          </MDBCol>
                        </MDBRow>
                        <hr />
                        <MDBRow>
                          <MDBCol sm="3">
                            <MDBCardText>Email</MDBCardText>
                          </MDBCol>
                          <MDBCol sm="9">
                            {/* <MDBCardText className="text-muted">
                        {userInfo?.email}
                      </MDBCardText> */}
                            <MDBInput
                              id="form1"
                              type="email"
                              value={email}
                              onChange={(ev) => setEmail(ev.target.value)}
                              required
                            />
                          </MDBCol>
                        </MDBRow>
                        <hr />
                        <MDBRow>
                          <MDBCol sm="3">
                            <MDBCardText>Phone</MDBCardText>
                          </MDBCol>
                          <MDBCol sm="9">
                            {/* <MDBCardText className="text-muted">
                        {userInfo?.phone || "Not Found"}
                      </MDBCardText> */}
                            <MDBInput
                              id="form1"
                              type="number"
                              value={phone}
                              onChange={(ev) => setPhone(ev.target.value)}
                              required
                            />
                          </MDBCol>
                        </MDBRow>
                        <hr />

                        <MDBRow>
                          <MDBCol sm="3">
                            <MDBCardText>Address</MDBCardText>
                          </MDBCol>
                          <MDBCol sm="9">
                            {/* <MDBCardText className="text-muted">
                        {userInfo?.address || "Not Found"}
                      </MDBCardText> */}
                            <MDBInput
                              id="form1"
                              type="text"
                              value={address}
                              onChange={(ev) => setAddress(ev.target.value)}
                              required
                            />
                          </MDBCol>
                        </MDBRow>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            margin: "1rem 0",
                          }}
                        >
                          Change Password
                          <Switch
                            {...label}
                            checked={changePassword}
                            onChange={() => setChangePassword((prev) => !prev)}
                          />
                        </div>
                        {changePassword ? (
                          <>
                            <MDBRow>
                              <MDBCol sm="3">
                                <MDBCardText>
                                  <span style={{ fontSize: "0.7rem" }}>
                                    Current
                                  </span>{" "}
                                  Password
                                </MDBCardText>
                              </MDBCol>
                              <MDBCol sm="9">
                                <div className="password-input-container">
                                  <MDBInput
                                    wrapperClass={`mb-3`}
                                    id="form1"
                                    type={
                                      showCurrentPassword ? "text" : "password"
                                    }
                                    value={currentPassword}
                                    onChange={(ev) =>
                                      setCurrentPassword(ev.target.value)
                                    }
                                    required
                                  >
                                    <span
                                      className="password-toggle-icon"
                                      onClick={() =>
                                        togglePasswordVisibility("current")
                                      }
                                    >
                                      {showCurrentPassword ? (
                                        <i className="far fa-eye-slash"></i>
                                      ) : (
                                        <i
                                          className="far fa-eye"
                                          style={{ opacity: "0.5" }}
                                        ></i>
                                      )}
                                    </span>
                                  </MDBInput>
                                </div>
                              </MDBCol>
                            </MDBRow>
                            <MDBRow>
                              <MDBCol sm="3">
                                <MDBCardText>
                                  <span style={{ fontSize: "0.7rem" }}>
                                    New
                                  </span>{" "}
                                  Password
                                </MDBCardText>
                              </MDBCol>
                              <MDBCol sm="9">
                                <div className="password-input-container">
                                  <MDBInput
                                    wrapperClass={`mb-${error ? "1" : "3"}`}
                                    id="form1"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(ev) =>
                                      onChangePassword(ev.target.value)
                                    }
                                    required
                                  >
                                    <span
                                      className="password-toggle-icon"
                                      onClick={() =>
                                        togglePasswordVisibility("password")
                                      }
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
                                      style={{
                                        fontSize: "12px",
                                        color: "red",
                                        opacity: 0.7,
                                      }}
                                    >
                                      {error}
                                    </div>
                                  )}
                                </div>
                              </MDBCol>
                            </MDBRow>
                            <MDBRow>
                              <MDBCol sm="3">
                                <MDBCardText>
                                  <span style={{ fontSize: "0.7rem" }}>
                                    Confirm
                                  </span>{" "}
                                  Password
                                </MDBCardText>
                              </MDBCol>
                              <MDBCol sm="9">
                                <div className="password-input-container">
                                  <MDBInput
                                    wrapperClass={`mb-${
                                      errorConfirm ? "1" : "4"
                                    }`}
                                    id="form1"
                                    type={
                                      showConfirmPassword ? "text" : "password"
                                    }
                                    value={confirmPassword}
                                    onChange={(ev) =>
                                      onChangeConfirmPassword(ev.target.value)
                                    }
                                    required
                                  >
                                    <span
                                      className="password-toggle-icon"
                                      onClick={() =>
                                        togglePasswordVisibility("confirm")
                                      }
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
                                      style={{
                                        fontSize: "12px",
                                        color: "red",
                                        opacity: 0.7,
                                      }}
                                    >
                                      {errorConfirm}
                                    </div>
                                  )}
                                </div>
                              </MDBCol>
                            </MDBRow>
                          </>
                        ) : null}
                      </MDBCardBody>
                    </MDBCard>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "start",
                        margin: "0 3rem",
                        gap: "3rem",
                      }}
                    >
                      <MDBBtn
                        style={{ backgroundColor: "#ADADAD" }}
                        onClick={() => {
                          setEditMode(false);
                          setChangePassword(false);
                        }}
                      >
                        Close
                      </MDBBtn>
                      <MDBBtn
                        style={{ backgroundColor: "#12C400" }}
                        type="submit"
                      >
                        Submit
                      </MDBBtn>
                    </div>
                  </MDBCol>
                </MDBRow>
              </form>
            </>
          ) : (
            <>
              <MDBRow style={{ display: "flex", alignItems: "center" }}>
                <MDBCol
                  lg="4"
                  style={{ marginBottom: "1rem", alignSelf: "start" }}
                >
                  <MDBCard>
                    <MDBCardBody className="text-center">
                      <MDBCardImage
                        src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp"
                        alt="avatar"
                        className="rounded-circle"
                        style={{ width: "150px", marginBottom: "1rem" }}
                        fluid
                      />
                      <p className="text-muted mb-1">{userInfo?.title}</p>

                      {/* <div className="d-flex justify-content-center mb-2">
                    <MDBBtn>Follow</MDBBtn>
                    <MDBBtn outline className="ms-1">
                      Message
                    </MDBBtn>
                  </div> */}
                    </MDBCardBody>
                  </MDBCard>
                </MDBCol>
                <MDBCol lg="8">
                  <MDBCard className="mb-4">
                    <MDBCardBody>
                      <MDBRow>
                        <MDBCol sm="3">
                          <MDBCardText>Full Name</MDBCardText>
                        </MDBCol>
                        <MDBCol sm="9" style={{ display: "flex", gap: "1rem" }}>
                          <MDBCardText className="text-muted">
                            {userInfo?.firstname + " " + userInfo?.lastname}
                          </MDBCardText>
                        </MDBCol>
                      </MDBRow>
                      <hr />
                      <MDBRow>
                        <MDBCol sm="3">
                          <MDBCardText>Email</MDBCardText>
                        </MDBCol>
                        <MDBCol sm="9">
                          <MDBCardText className="text-muted">
                            {userInfo?.email}
                          </MDBCardText>
                        </MDBCol>
                      </MDBRow>
                      <hr />
                      <MDBRow>
                        <MDBCol sm="3">
                          <MDBCardText>Phone</MDBCardText>
                        </MDBCol>
                        <MDBCol sm="9">
                          <MDBCardText className="text-muted">
                            {userInfo?.phone || "Not Found"}
                          </MDBCardText>
                        </MDBCol>
                      </MDBRow>
                      <hr />

                      <MDBRow>
                        <MDBCol sm="3">
                          <MDBCardText>Address</MDBCardText>
                        </MDBCol>
                        <MDBCol sm="9">
                          <MDBCardText className="text-muted">
                            {userInfo?.address || "Not Found"}
                          </MDBCardText>
                        </MDBCol>
                      </MDBRow>
                    </MDBCardBody>
                  </MDBCard>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "start",
                      margin: "0 3rem",
                      gap: "3rem",
                    }}
                  >
                    <MDBBtn
                      style={{ backgroundColor: "#E8CC00" }}
                      onClick={() => {
                        setEditMode(true);
                      }}
                    >
                      Edit Information
                    </MDBBtn>
                    <MDBBtn
                      style={{ backgroundColor: "#D60000" }}
                      onClick={deleteProfile}
                    >
                      Delete Profile
                    </MDBBtn>
                  </div>
                </MDBCol>
              </MDBRow>
            </>
          )}
        </MDBContainer>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <img
            src={NotFound}
            style={{
              width: "40%",
              padding: "4rem 0",
            }}
          />
          <p>User Not Found...</p>
        </div>
      )}
    </section>
  );
}
