import "./App.css";
import { Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import LoginPage from "./pages/LoginPage";
import IndexPage from "./pages/IndexPage";
import PostPage from "./pages/PostPage";
import EditPost from "./pages/EditPost";
import { UserContextProvider } from "./UserContext";
import CreatePost from "./pages/CreatePost";
import RegisterPage from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forget" element={<ForgotPassword />} />
          <Route path="/reset" element={<ResetPassword />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/post/:id" element={<PostPage />} />
          <Route path="/edit/:id" element={<EditPost />} />
        </Route>
      </Routes>
    </UserContextProvider>
  );
}

export default App;
