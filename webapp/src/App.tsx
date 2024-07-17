import React, {useEffect, useState} from 'react';
import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Navbar from "./Pages/Navbar";
import MainPage from "./Pages/MainPage";
import {ROLES} from "./Data/Globals";
import ListEmployees from "./Pages/ListEmployees";
import EmployeeForm from "./Pages/EmployeeForm";
import NotFound from "./Pages/NotFound";
import ListProjects from "./Pages/ListProjects"
import ProjectForm from "./Pages/ProjectForm";
import EmployeeToProjectForm from "./Pages/EmployeeToProjectForm";
import ListLeaveRequests from "./Pages/ListLeaveRequests";
import LeaveRequestForm from "./Pages/LeaveRequestForm";
import ListApprovalRequests from "./Pages/ListApprovalRequests";
import ApprovalRequestForm from "./Pages/ApprovalRequestForm";

const routes = [
    {path: "/", element: <MainPage/>, roles: [ROLES.Administrator, ROLES.Employee, ROLES.ProjectManager, ROLES.HRManager, "None"]},
    {path: "/Lists/Employees", element: <ListEmployees/>, roles: [ROLES.Administrator, ROLES.ProjectManager, ROLES.HRManager]},
    {path: "/Lists/Employees/Form", element: <EmployeeForm/>, roles: [ROLES.Administrator, ROLES.ProjectManager, ROLES.HRManager]},
    {path: "/Lists/Projects", element: <ListProjects/>, roles: [ROLES.Administrator, ROLES.ProjectManager, ROLES.HRManager, ROLES.Employee]},
    {path: "/Lists/Projects/Form", element: <ProjectForm/>, roles: [ROLES.Administrator, ROLES.ProjectManager, ROLES.HRManager]},
    {path: "/Lists/Employees/AssignToProject", element: <EmployeeToProjectForm/>, roles: [ROLES.Administrator, ROLES.ProjectManager]},
    {path: "/Lists/LeaveRequests", element: <ListLeaveRequests/>, roles: [ROLES.Administrator, ROLES.ProjectManager, ROLES.HRManager, ROLES.Employee]},
    {path: "/Lists/LeaveRequests/form", element: <LeaveRequestForm/>, roles: [ROLES.Administrator, ROLES.ProjectManager, ROLES.HRManager, ROLES.Employee]},
    {path: "/Lists/ApprovalRequests", element: <ListApprovalRequests/>, roles: [ROLES.Administrator, ROLES.ProjectManager, ROLES.HRManager, ROLES.Employee]},
    {path: "/Lists/ApprovalRequests/Form", element: <ApprovalRequestForm/>, roles: [ROLES.Administrator, ROLES.ProjectManager, ROLES.HRManager]},
    {path: "*", element: <NotFound/>, roles: [ROLES.Administrator, ROLES.Employee, ROLES.ProjectManager, ROLES.HRManager, "None"]}
]

function App() {
    const [role, setRole] = useState(localStorage.getItem("role") || 'None')

    useEffect(() => {
        function handleStorageChange() {
            setRole(localStorage.getItem("role") || "None")
        }

        window.addEventListener('storage', handleStorageChange)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
        };
    }, []);

    return (
        <BrowserRouter>
            <Navbar/>
            <Routes>
                <Route>
                    {routes.map((route) => (
                        route.roles.includes(role as ROLES) && (
                            <Route path={route.path} element={route.element}/>
                        )
                    ))}
                </Route>
            </Routes>
        </BrowserRouter>
  );
}

export default App;
