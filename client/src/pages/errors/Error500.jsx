import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark, fa5 } from '@fortawesome/free-solid-svg-icons';
import { usePageTitle } from "../../hooks";
import { ErrorTemplate } from "./ErrorTemplate";

const Error500 = ({ pageTitle }) => {
  usePageTitle(pageTitle);
  return (
    <ErrorTemplate
      heading="INTERNAL SERVER ERROR"
      content="Oops, some things went wrong. Try to refresh this page or feel free to contact us if the problem persists."
    >
      <FontAwesomeIcon icon={fa5} />
      <FontAwesomeIcon
        icon={faCircleXmark}
        style={{ animation: "3s ease-in-out infinite reverse spinner-border" }}
        className="mx-1 mx-md-3 text-danger"
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="90px"
        height="90px"
        fill="currentColor"
        viewBox="0 0 16 16"
        className="mx-1 me-md-3 text-danger"
        style={{ animation: "2s ease-in-out infinite spinner-border", marginBottom: "22px" }}
      >
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
      </svg>
    </ErrorTemplate>
  );
};

export { Error500 };
