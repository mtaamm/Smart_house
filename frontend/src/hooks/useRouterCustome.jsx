import { useRoutes } from "react-router-dom";
import HomeTemplate from "../template/HomeTemplate/HomeTemplate.jsx";
import HomePage from "../pages/HomePage/homepage.jsx";
import LoginRegister from "../pages/LoginRegister/loginRegister.jsx";

const useRouterCustome = () => {
  const router = useRoutes([
    {
      path: "/",
      element: <HomeTemplate />,
      children: [
        {
          index: true,
          element: <HomePage/>,
        },
      ],
    },
    {
      path: "/login",
      element: <LoginRegister />,
      children: [
        {
          index: true,
          // element: <CoursePage/>,
        },
      ],
    },

  ]);
  return router;
};

export default useRouterCustome;