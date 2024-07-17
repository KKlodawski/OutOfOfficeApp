import {Toaster} from "../components/ui/toaster"
import {useToast} from "../components/ui/use-toast"
import React, {useEffect, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import {CustomDataTable} from "../components/ui/customDataTable";
import {ToastAction} from "../components/ui/toast"
import {ACCESSTYPES, APIURL, ROLES} from "../Data/Globals";
import {Button} from "../components/ui/button";
import {ArrowUpDown, MoreHorizontal} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"

function ListProjects() {
    const [role, setRole] = useState(localStorage.getItem("role") || 'None')
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [projects, setProjects ] = useState([
        { id: "", projectType: "", startDate: new Date(), endDate: new Date(), projectManager: "", comment: "", status: ""}
    ]);
    const {toast} = useToast();
    const navigate = useNavigate();

    type Columns = {
        id: string,
        projectType: string,
        startDate: Date,
        endDate: Date,
        projectManager: string,
        comment: string,
        status: string
    }

    function moveToEmployeeForm(accesstype: ACCESSTYPES, id?: string) {
        if(accesstype === ACCESSTYPES.ReadOnly || accesstype === ACCESSTYPES.Edit)
            navigate('/Lists/Projects/Form', {state: {id: id, accesstype: accesstype}})
        if(accesstype === ACCESSTYPES.Add)
            navigate('/Lists/Projects/Form', {state: {id: null, accesstype: accesstype}})
    }

    const changeStatus = async (id: string)=> {
        try {
            const response = await fetch(`${APIURL}/Project/changeProjectStatusById?id=${id}`)
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            else
                window.location.reload();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error!",
                description: "Failed to change status.",
                action: <ToastAction altText="Close">Close</ToastAction>,
            })
        }
    }

    const columns: ColumnDef<Columns>[] = [
        {
            accessorKey: "projectType",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Project Types
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "startDate",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Start Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "endDate",
            header: "End Date"
        },
        {
            accessorKey: "comment",
            header: "Comment"
        },
        {
            accessorKey: "status",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Status
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            id: "actions",
            header: () => {
                return (
                    <>
                        {(role === ROLES.Administrator || role === ROLES.ProjectManager) &&
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem onClick={() => moveToEmployeeForm(ACCESSTYPES.Add)}>Add Project</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        }
                    </>
                )
            },
            cell: ({row}) => {
                const project = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                                {(role === ROLES.HRManager || role === ROLES.Administrator || role === ROLES.ProjectManager) && <DropdownMenuItem onClick={() => moveToEmployeeForm(ACCESSTYPES.ReadOnly, project.id)}>Open Project</DropdownMenuItem>}
                                {(role === ROLES.Administrator || role === ROLES.ProjectManager) && <DropdownMenuItem onClick={() => moveToEmployeeForm(ACCESSTYPES.Add)}>Add Project</DropdownMenuItem>}
                                {(role === ROLES.Administrator || role === ROLES.ProjectManager) && <DropdownMenuItem onClick={() => moveToEmployeeForm(ACCESSTYPES.Edit, project.id)}>Edit Project</DropdownMenuItem>}
                                {(role === ROLES.Administrator || role === ROLES.ProjectManager) && <DropdownMenuItem onClick={() => changeStatus(project.id)}>Change Status</DropdownMenuItem>}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    const loadProjects = async ()=> {
        setIsLoading(true)
        try{
            let response: Response
            if(role === ROLES.Employee) {
                var empId = localStorage.getItem("userId")
                response = await fetch(`${APIURL}/Project/getProjectsByEmployee?employeeId=${empId}`)
            }
            else
                response = await fetch(`${APIURL}/Project/getProjects`);
            if(response.status === 404) {
                setIsLoading(false)
                setProjects([])
                toast({
                    description: `You have no assigned projects!`,
                    action: <ToastAction altText="Close">Close</ToastAction>
                })
            }
            else if(!response.ok)
                throw new Error(`Failed to fetch data`)
            else {
                const data = await response.json()
                setProjects(data)
                setIsLoading(false)
            }
        }catch (error) {
            toast({
                variant: "destructive",
                title: "Error!",
                description: `Cannot load projects. ${error}`,
                action: <ToastAction altText="Close">Close</ToastAction>
            })
            setIsLoading(true)
        }
    }

    useEffect(() => {

        loadProjects()

    }, []);

    return (
        <>
            <Toaster/>
            {isLoading ? (
                <p className="text-center w-auto font-semibold text-4xl mt-5"> Loading ...</p>
            ) : (
                <div className="m-2 mt-4">
                    <CustomDataTable columns={columns} data={projects} filterColumn="projectType"/>
                </div>
            )}
        </>
    )
}

export default ListProjects