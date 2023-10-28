import Post from "../Post";
import { useEffect, useState } from "react";

export default function IndexPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:4000/post", { credentials: "include" }).then(
      (response) => {
        response.json().then((posts) => {
          setPosts(posts);
          setLoading(false);
        });
      }
    );
  }, []);
  if (loading)
    return (
      <div class="text-center ">
        <div class="spinner-border" role="status" style={{ marginTop: "5rem" }}>
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  return <>{posts.length > 0 && posts.map((post) => <Post {...post} />)}</>;
}
