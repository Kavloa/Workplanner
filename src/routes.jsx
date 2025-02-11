import { createBrowserRouter } from "react-router-dom";
import { User_Availabilty } from "./Pages/User_Data_Entry/User_Availability/User_Availabilty";
import { Project_Data_Entry } from "./Pages/Work_Planning_Data/Project_Data_Entry/Project_Data_Entry";
import { Layout } from "./Pages/Layout";
import  Login  from "./Pages/Admin/Login/Login";
// import AvailabilityImport from "./Pages/importemployess";
import { Hostgram } from "./Pages/Views/Resource_Histogram/Hostgram";
import { MainApp } from "./Pages/apitest";
import Operatives_Allocation from "./Pages/Work_Planning_Data/Operative_Allocation/Operatives_Allocation";
import { useEffect } from "react";
const RouteWithTitle = ({ title, element }) => {
    useEffect(() => {
        document.title = title; // Update document title
    }, [title]);

    return element;
};

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "userAvailability",
                element: (
                    <RouteWithTitle
                        title="User Availability"
                        element={<User_Availabilty />}
                    />
                ),
            },
            {
                path: "OperativesAllocation",
                element: (
                    <RouteWithTitle
                        title="Operatives Allocation"
                        element={<Operatives_Allocation />}
                    />
                ),
            },
            {
                path: "ProjectDataEntry",
                element: (
                    <RouteWithTitle
                        title="Project Data Entry"
                        element={<Project_Data_Entry />}
                    />
                ),
            },
            {
                path: "ResourceHistogram",
                element: (
                    <RouteWithTitle
                        title="Resource Histogram"
                        element={<Hostgram style={{ overflow: "hidden" }} />}
                    />
                ),
            },
            {
                path: "MainApp",
                element: (
                    <RouteWithTitle
                        title="Main Application"
                        element={<MainApp />}
                    />
                ),
            },
            {
                // path: "Login",
                // element: (
                //     <RouteWithTitle
                //         title="Login"
                //         // element={< />}
                //     />
                // ),
            },
        ],
    },
]);

export default router;
