import { Routes, Route, Navigate } from "react-router-dom";
import {
  Error404,
  Error500,
  Error503,
  Home,
} from "../pages";

const MainRoutes = () => {
  return (
    <Routes >
      <Route path="/">
        <Route index element={<Home pageTitle="Home"/>} />
        <Route path="home" element={<Navigate to="home" replace />} />

        {/* for error routes */}
        <Route path="*" element={<Error404 pageTitle="Not found" />} />
        <Route path="error-500" element={<Error500 pageTitle="Internal server error" />} />
        <Route path="error-503" element={<Error503 pageTitle="Server has been disconnected" />} />
      </Route>
    </Routes>
  );
};

export default MainRoutes;
