import { useNavigate } from "react-router-dom";

const ErrorTemplate = ({ children, heading, content }) => {
  const navigate = useNavigate();
  return (
    <div className="container">
      <div className="text-center">
        <span style={{ fontSize: "90px" }}>
          {children}
        </span>

        <h1 className="text-danger my-3">
          <strong>
            {heading}
          </strong>
        </h1>

        <h5 className="container fw-normal" style={{ maxWidth: "500px" }}>
          {content}
        </h5>

        <button type="button" className="btn btn-outline-primary my-3" onClick={() => navigate("/")}>
          Back to home page
        </button>
      </div>
    </div>
  );
};

export { ErrorTemplate };
