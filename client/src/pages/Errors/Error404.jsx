import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleQuestion, fa4 } from '@fortawesome/free-solid-svg-icons';
import { usePageTitle } from "../../hooks";
import ErrorTemplate from "./ErrorTemplate";

const Error404 = ({ pageTitle }) => {
  usePageTitle(pageTitle);
  return (
    <ErrorTemplate
      heading="KHÔNG TÌM THẤY TRANG"
      content="Tài nguyên mà bạn vừa yêu cầu đã bị chúng tôi xóa hoặc nó chưa từng tồn tại trên thế giới này."
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

export default Error404;
