import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleQuestion, fa4 } from '@fortawesome/free-solid-svg-icons';
import { usePageTitle } from "../../hooks";
import { ErrorTemplate } from "./ErrorTemplate";

const Error404 = ({ pageTitle }) => {
  usePageTitle(pageTitle);
  return (
    <ErrorTemplate
      heading="NOT FOUND"
      content="We looked all over, but that page seems to have gotten away from us. Try one of these links to get back on track"
    >
      <FontAwesomeIcon icon={fa4} />
      <FontAwesomeIcon
        icon={faCircleQuestion}
        className="px-1 px-md-3 text-danger"
        style={{ animation: "2.5s ease-in-out infinite spinner-border" }}
      />
      <FontAwesomeIcon icon={fa4} />

    </ErrorTemplate>
  );
};

export { Error404 };
