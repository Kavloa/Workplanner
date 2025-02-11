import { createBrowserRouter } from "react-router-dom";
import { Employee } from "./Pages/Employee";
import { Subs } from "./Pages/Subs";
import { Layout } from "./Pages/Layout";
import { Hostgram } from "./Pages/Hostgram";
import  Login  from "./Pages/login page/Login";
import OperativesAllo from "./Pages/operatives_allocation";
import DataInputPopup from "./Pages/importemployess";


const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "userAvailability",
                element: <Employee />,
            },            {
                path: "import",
                element: <DataInputPopup />,
            },
            {
                path: "OperativesAllocation",
                element: <OperativesAllo />,
            },
            {
                path: "ProjectDataEntry",
                element: <Subs />,
            },
            {
                path: "ResourceHistogram",
                element: <Hostgram />,
            },            {
                path: "Login",
                element: <Login />,
            },
        ]
    },
]);

export default router;