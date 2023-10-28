import React, { useState, useEffect, useContext } from "react";
import { Navigate, useParams } from "react-router-dom";
import NotFound from "../assets/undraw_page_not_found_re_e9o6.svg";
import {
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBCard,
  MDBCardText,
  MDBCardBody,
  MDBCardImage,
  MDBBtn,
} from "mdb-react-ui-kit";
import { UserContext } from "../UserContext";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const { setUserInfo, userInfo } = useContext(UserContext);
  const { id } = useParams();

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
          <MDBRow style={{ display: "flex", alignItems: "center" }}>
            <MDBCol lg="4">
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
                  <div className="d-flex justify-content-center mb-2">
                    <MDBBtn>Follow</MDBBtn>
                    <MDBBtn outline className="ms-1">
                      Message
                    </MDBBtn>
                  </div>
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
                    <MDBCol sm="9">
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
                <MDBBtn style={{ backgroundColor: "#E8CC00" }}>
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
