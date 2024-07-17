import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "../components/ui/navigation-menu"
import * as React from "react"
import {Link, Outlet} from "react-router-dom";
import {useEffect, useState} from "react";
import { ROLES } from "../Data/Globals";


const navs = [
    { link: "/", label: "Main Page", roles: [ROLES.HRManager, ROLES.ProjectManager, ROLES.Employee, ROLES.Administrator, "None"] },
    { link: "/Lists/Employees", label: "Employees", roles: [ROLES.HRManager, ROLES.ProjectManager, ROLES.Administrator] },
    { link: "/Lists/LeaveRequests", label: "Leave Requests", roles: [ROLES.HRManager, ROLES.ProjectManager, ROLES.Employee, ROLES.Administrator] },
    { link: "/Lists/Projects", label: "Projects", roles: [ROLES.HRManager, ROLES.ProjectManager, ROLES.Employee, ROLES.Administrator] },
    { link: "/Lists/ApprovalRequests", label: "Approval Requests", roles: [ROLES.HRManager, ROLES.ProjectManager, ROLES.Administrator] },
]
function Navbar() {
    const [role, setRole] = useState(localStorage.getItem("role") || 'None')
    const [userFullName, setUserFullName] = useState(localStorage.getItem("userFullName") || null)

    useEffect(() => {
        function handleStorageChange() {
            setRole(localStorage.getItem("role") || "None")
            setUserFullName(localStorage.getItem("userFullName") || null)
        }

        window.addEventListener('storage', handleStorageChange)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
        };
    }, []);

    return (
        <header className="bg-gray-700 p-2 flex items-center">
            <NavigationMenu>
                <NavigationMenuList>
                    {navs.map((nav) => (
                        nav.roles.includes(role as ROLES) && (
                        <NavigationMenuItem>
                            <Link to={nav.link}>
                                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                    {nav.label}
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                        )
                    ))}
                </NavigationMenuList>
            </NavigationMenu>
            <h1 className="text-white ml-auto mr-5 font-medium"> Logged as: {role} | {userFullName}</h1>
            <Outlet/>
        </header>
    )
}

export default Navbar;