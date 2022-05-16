import React from "react";
import { Container } from "react-bootstrap";

const auth_url = "https://accounts.spotify.com/authorize";
const client_id = "1b92d625825c465aa3f2ec73e22162b5";
const response_type = "code";
const redirect_uri = "http://localhost:3000";
const scope =
  "streaming user-read-email user-read-private user-library-read user-library-modify user-read-playback-state user-modify-playback-state";

const full_auth_url =
  auth_url +
  "?client_id=" +
  client_id +
  "&response_type=" +
  response_type +
  "&redirect_uri=" +
  redirect_uri +
  "&scope=" +
  scope;

export default function Login() {
  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <a className="btn btn-success btn-lg" href={full_auth_url}>
        Login with spotify
      </a>
    </Container>
  );
}
