import "react-quill/dist/quill.snow.css";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import Editor from "../Editor";
import Switch from "@mui/material/Switch";
import PublicIcon from "@mui/icons-material/Public";
import LockPersonIcon from "@mui/icons-material/LockPerson";

const label = { inputProps: { "aria-label": "Switch demo" } };

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState("");
  const [publicPost, setPublicPost] = useState(true);
  const [redirect, setRedirect] = useState(false);
  async function createNewPost(ev) {
    const data = new FormData();
    data.set("title", title);
    data.set("summary", summary);
    data.set("content", content);
    data.set("file", files[0]);
    data.set("public", publicPost);
    ev.preventDefault();
    const response = await fetch("http://localhost:4000/post", {
      method: "POST",
      body: data,
      credentials: "include",
    });
    if (response.ok) {
      setRedirect(true);
    }
  }

  if (redirect) {
    return <Navigate to={"/"} />;
  }
  return (
    <form onSubmit={createNewPost}>
      <input
        type="title"
        placeholder={"Title"}
        value={title}
        onChange={(ev) => setTitle(ev.target.value)}
      />
      <input
        type="summary"
        placeholder={"Summary"}
        value={summary}
        onChange={(ev) => setSummary(ev.target.value)}
      />
      <input type="file" onChange={(ev) => setFiles(ev.target.files)} />
      <Editor value={content} onChange={setContent} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        <Switch
          {...label}
          checked={publicPost}
          onChange={() => setPublicPost((prev) => !prev)}
        />
        {publicPost ? (
          <div>
            Public <PublicIcon sx={{ ml: "0.5rem" }} />
          </div>
        ) : (
          <div>
            Private <LockPersonIcon sx={{ ml: "0.5rem" }} />
          </div>
        )}
      </div>

      <button style={{ marginTop: "1rem" }}>Create post</button>
    </form>
  );
}
