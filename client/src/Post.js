import { formatISO9075 } from "date-fns";
import { Link } from "react-router-dom";
import LockPersonIcon from "@mui/icons-material/LockPerson";
import { Tooltip } from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import { UserContext } from "./UserContext";
import { useContext } from "react";

export default function Post({
  _id,
  title,
  summary,
  cover,
  content,
  createdAt,
  author,
  public: global,
}) {
  const { userInfo } = useContext(UserContext);
  const authorTrue =
    (userInfo?._id || userInfo?.id) === (author._id || author.id);
  return (
    <div className="post">
      <div className="image">
        <Link to={`/post/${_id}`}>
          <img src={"http://localhost:4000/" + cover} alt="" />
        </Link>
      </div>
      <div className="texts">
        <h2
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            justifyContent: "end",
          }}
        >
          <Link
            to={`/post/${_id}`}
            style={{ marginRight: "auto", width: "fit" }}
          >
            <span>{title}</span>
          </Link>
          {global ? (
            <span
              class="badge  text-bg-primary "
              style={{ fontSize: "1rem", padding: "0.25em 0.5em" }}
            >
              Public
            </span>
          ) : (
            <Tooltip title="Only You" placement="bottom">
              <LockPersonIcon />
            </Tooltip>
          )}
          {authorTrue && (
            <Tooltip
              title="Author"
              placement="right"
              style={{
                fontSize: "1.8rem",
                color: "green",
              }}
            >
              <CampaignIcon />
            </Tooltip>
          )}
        </h2>

        <p className="info">
          <a className="author">{author.username}</a>
          <time>{formatISO9075(new Date(createdAt))}</time>
        </p>
        <p className="summary">{summary}</p>
      </div>
    </div>
  );
}
