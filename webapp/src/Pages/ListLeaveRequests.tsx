import {Toaster} from "../components/ui/toaster";
import {CustomDataTable} from "../components/ui/customDataTable";
import React, {useEffect, useState} from "react";
import {useToast} from "../components/ui/use-toast";
import {useNavigate} from "react-router-dom";
import {ColumnDef} from "@tanstack/react-table";
import {Button} from "../components/ui/button";
import {ArrowUpDown, MoreHorizontal} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../components/ui/dropdown-menu";
import {ACCESSTYPES, APIURL, ROLES} from "../Data/Globals";
import {ToastAction} from "../components/ui/toast";


function ListLeaveRequests() {
    const [role, setRole] = useState(localStorage.getItem("role") || 'None')
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const {toast} = useToast();
    const navigate = useNavigate();
    const [leaveRequests, setLeaveRequests] = useState([
        {id: "", employeeId: "", employeeFullName: "", absenceReason: "", startDate: new Date(), endDate: new Date(), comment: "", status: ""}
    ])

    type Columns = {
        id: string,
        employeeId: string,
        employeeFullName: string,
        absenceReason: string,
        startDate: Date,
        endDate: Date,
        comment: string,
        status: string
    }

    function moveToEmployeeForm(accesstype: ACCESSTYPES, id?: string) {
        if(accesstype === ACCESSTYPES.ReadOnly || accesstype === ACCESSTYPES.Edit)
            navigate('/Lists/LeaveRequests/Form', {state: {id: id, accesstype: accesstype}})
        if(accesstype === ACCESSTYPES.Add)
            navigate('/Lists/LeaveRequests/Form', {state: {id: null, accesstype: accesstype}})
    }

    const submitRequest = async (id: string)=> {
        try {
            const response = await fetch(`${APIURL}/LeaveRequest/submitRequest?leaveRequestId=${id}`)
            if(!response.ok)
                if(response.status === 409)
                    throw new Error("Leave request is already submitted or cancelled")
                else
                    throw new Error(`Failed to submit project ${response.status} ${response.statusText}`)

            toast({
                description: "Leave Request has been submitted",
                action: <ToastAction altText="Close">Close</ToastAction>
            })
            window.location.reload()
        } catch (error) {
            toast({
                description: `${error}`,
                action: <ToastAction altText="Close">Close</ToastAction>,
            })
        }
    }

    const canacelRequest = async (id: string)=> {
        try {
            const response = await fetch(`${APIURL}/LeaveRequest/cancelRequest?leaveRequestId=${id}`)
            if(!response.ok)
                throw new Error(`Failed to cancel project`)
            toast({
                description: "Leave Request has been cancelled",
                action: <ToastAction altText="Close">Close</ToastAction>
            })
            window.location.reload()
        } catch (error) {
            toast({
                description: `${error}`,
                action: <ToastAction altText="Close">Close</ToastAction>,
            })
        }
    }

    const columns: ColumnDef<Columns>[] = [
        {
            accessorKey: "id",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Request Number
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "employeeFullName",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Employee
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "absenceReason",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Absence Reason
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
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        End Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
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
                      {(role === ROLES.Administrator || role === ROLES.Employee) &&
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
                                  <DropdownMenuItem onClick={() => moveToEmployeeForm(ACCESSTYPES.Add)}>Add Leave Request</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => navigate("/Lists/ApprovalRequests")}>List Approval</DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                      }
                  </>
              )
            },
            cell: ({row}) => {
                const leaveRequest = row.original

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
                            {(role === ROLES.HRManager || role === ROLES.Administrator || role === ROLES.ProjectManager) && <DropdownMenuItem onClick={() => moveToEmployeeForm(ACCESSTYPES.ReadOnly, leaveRequest.id)}>Open Leave Request</DropdownMenuItem>}
                            {(role === ROLES.Administrator || role === ROLES.Employee) && <DropdownMenuItem onClick={() => moveToEmployeeForm(ACCESSTYPES.Edit, leaveRequest.id)}>Edit Leave Request</DropdownMenuItem>}
                            {(role === ROLES.Administrator || role === ROLES.Employee) && <DropdownMenuItem onClick={() => moveToEmployeeForm(ACCESSTYPES.Add)}>Add Leave Request</DropdownMenuItem>}
                            {(role === ROLES.Administrator || role === ROLES.Employee) && <DropdownMenuItem onClick={() => submitRequest(leaveRequest.id)}>Submit Request</DropdownMenuItem>}
                            {(role === ROLES.Administrator || role === ROLES.Employee) && <DropdownMenuItem onClick={() => canacelRequest(leaveRequest.id)}>Cancel Request</DropdownMenuItem>}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    const loadLeaveRequestsData = async () => {
        setIsLoading(true)
        try {
            let response: Response
            if(role === ROLES.Employee) {
                var empId = localStorage.getItem("userId")
                response = await fetch(`${APIURL}/LeaveRequest/getLeaveRequestByEmployee?employeeId=${empId}`)
            }
            else
                response = await fetch(`${APIURL}/LeaveRequest/getLeaveRequests`)
            if(response.status === 404) {
                setIsLoading(false)
                setLeaveRequests([])
                toast({
                    description: `You have no assigned projects!`,
                    action: <ToastAction altText="Close">Close</ToastAction>
                })
            }
            else if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            else {
                const data = await response.json();
                setLeaveRequests(data)
                setIsLoading(false)
            }
        } catch (error) {
            console.log("Error while loading Leave Requests: ", error)
            toast({
                variant: "destructive",
                title: "Error!",
                description: `Cannot load employees. ${error}`,
                action: <ToastAction altText="Close">Close</ToastAction>,
            })
            setIsLoading(true)
        }
    }

    useEffect(() => {
        loadLeaveRequestsData()
    }, []);

    return (
        <>
            <Toaster/>
            {isLoading ? (
                <p className="text-center w-auto font-semibold text-4xl mt-5"> Loading ...</p>
            ) : (
                <div className="m-2 mt-4">
                    <CustomDataTable columns={columns} data={leaveRequests} filterColumn="id"/>
                </div>
            )}
        </>
    )
}

export default ListLeaveRequests;