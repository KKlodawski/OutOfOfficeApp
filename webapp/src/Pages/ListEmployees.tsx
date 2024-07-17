import React, {useEffect, useState} from "react";
import {ACCESSTYPES, APIURL, ROLES} from "../Data/Globals";
import {Toaster} from "../components/ui/toaster"
import {useToast} from "../components/ui/use-toast"
import {ToastAction} from "../components/ui/toast"
import {CustomDataTable} from "../components/ui/customDataTable";
import {ColumnDef} from "@tanstack/react-table";
import {Button} from "../components/ui/button"
import {ArrowUpDown, MoreHorizontal} from "lucide-react";
import {useNavigate} from "react-router-dom";
import profilePlaceholder from "../render/profile.png"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import {Avatar, AvatarImage,} from "../components/ui/avatar"
import {Popover, PopoverContent, PopoverTrigger} from "../components/ui/popover";

function ListEmployees() {
    //const [imageUrl, setImageUrl] = useState<string>();
    const [role, setRole] = useState(localStorage.getItem("role") || 'None')
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [employees, setEmployees ] = useState([
        { id: "", fullName: "", subdivision: "", position: "", peoplePartner: "", outOfOfficeBalance: "", photo: "", status: ""}
    ]);
    const {toast} = useToast();
    const navigate = useNavigate();

    type Columns = {
        id: string,
        fullName: string,
        subdivision: string,
        position: string,
        status: string,
        peoplePartner: string,
        outOfOfficeBalance: string,
        photo: string
    }

    const changeStatus = async (id: string) => {
        try {
            const response = await fetch(`${APIURL}/Employee/changeEmployeeStatusById?id=${id}`)
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

    function moveToEmployeeForm(accesstype: ACCESSTYPES, id?: string) {
        if(accesstype === ACCESSTYPES.ReadOnly || accesstype === ACCESSTYPES.Edit)
            navigate('/Lists/Employees/Form', {state: {id: id, accesstype: accesstype}})
        if(accesstype === ACCESSTYPES.Add)
            navigate('/Lists/Employees/Form', {state: {id: null, accesstype: accesstype}})
    }



    const columns: ColumnDef<Columns>[] = [
        {
            accessorKey: "fullName",
            header: "FullName",
            cell: ({ row }) => {
                const employee = row.original
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const [imageUrl, setImageUrl] = useState<string>();


                const loadImage = async (photoPath: string) => {
                    try {
                        const response = await fetch(`${APIURL}/Employee/getPhoto?filename=${photoPath}`)
                        if (!response.ok) {
                            throw new Error('Failed to fetch data' + await response.text());
                        }
                        const blob = await response.blob();
                        setImageUrl(URL.createObjectURL(blob));
                    } catch (error) {
                        console.log("Error while loading image: ", error)
                        toast({
                            variant: "destructive",
                            title: "Error!",
                            description: "Cannot load image.",
                            action: <ToastAction altText="Close">Close</ToastAction>,
                        })
                    }
                }
                const handlePopoverOpen = () => {
                    if (employee.photo && !imageUrl) {
                        loadImage(employee.photo);
                    }
                }
                return (
                    <Popover onOpenChange={handlePopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="link">{employee.fullName}</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto" >
                            <div>
                                <Avatar>
                                    <AvatarImage src={imageUrl || profilePlaceholder}/>
                                </Avatar>
                            </div>
                        </PopoverContent>
                    </Popover>
                )
            }
        },
        {
            accessorKey: "subdivision",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Subdivision
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "position",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Position
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
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
            accessorKey: "outOfOfficeBalance",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        OutOfOffice Balance
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
                        {(role === ROLES.HRManager || role === ROLES.Administrator) &&
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
                                    <DropdownMenuItem onClick={() => moveToEmployeeForm(ACCESSTYPES.Add)}>Add employee</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        }
                    </>
                )
            },
            cell: ({ row }) => {
                const employee = row.original

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
                            {(role === ROLES.HRManager || role === ROLES.Administrator) && <DropdownMenuItem onClick={() => moveToEmployeeForm(ACCESSTYPES.Add)}>Add employee</DropdownMenuItem>}
                            {(role === ROLES.ProjectManager || role === ROLES.Administrator) && <DropdownMenuItem onClick={() => moveToEmployeeForm(ACCESSTYPES.ReadOnly, employee.id)}>Open employee</DropdownMenuItem>}
                            {(role === ROLES.HRManager || role === ROLES.Administrator) && <DropdownMenuItem onClick={() => moveToEmployeeForm(ACCESSTYPES.Edit, employee.id)}>Update employee</DropdownMenuItem>}
                            {(role === ROLES.ProjectManager || role === ROLES.Administrator) && <DropdownMenuItem onClick={() => navigate("/Lists/Employees/AssignToProject", {state: {id: employee.id}})}>Assign to projects</DropdownMenuItem>}
                            {(role === ROLES.HRManager || role === ROLES.Administrator) && <DropdownMenuItem onClick={() => changeStatus(employee.id)}>Change Status</DropdownMenuItem>}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]



    const loadEmployees = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${APIURL}/Employee/getEmployees`)
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            setEmployees(data)
            setIsLoading(false)
        } catch (error) {
            console.log("Error while loading Employees: ", error)
            toast({
                variant: "destructive",
                title: "Error!",
                description: "Cannot load employees.",
                action: <ToastAction altText="Close">Close</ToastAction>,
            })
            setIsLoading(true)
        }

    }


    useEffect(() => {
        function handleStorageChange() {
            setRole(localStorage.getItem("role") || "None")
        }

        window.addEventListener('storage', handleStorageChange)
        loadEmployees()

        return () => {
            window.removeEventListener('storage', handleStorageChange)
        };
    }, []);

    return (
        <>
            <Toaster/>
            {isLoading ? (
                <p className="text-center w-auto font-semibold text-4xl mt-5"> Loading ...</p>
            ) : (
                <div className="m-2 mt-4">
                    <CustomDataTable columns={columns} data={employees} filterColumn="fullName"/>
                </div>
            )}
        </>
    )
}

export default ListEmployees