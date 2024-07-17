import {Toaster} from "../components/ui/toaster"
import {CustomDataTable} from "../components/ui/customDataTable";
import React, {useEffect, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import {Button} from "../components/ui/button";
import {ArrowUpDown, MoreHorizontal} from "lucide-react";
import {ToastAction} from "../components/ui/toast";
import {useToast} from "../components/ui/use-toast"
import {ACCESSTYPES, APIURL, ROLES} from "../Data/Globals";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog"
import {Textarea} from "../components/ui/textarea";
import {useNavigate} from "react-router-dom";
function ListApprovalRequests() {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [userId, setUserId] = useState(localStorage.getItem("userId") || 'None')
    const [role, setRole] = useState(localStorage.getItem("role") || 'None')
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [approvalRequests, setApprovalRequests] = useState([
        {id: "", approver: "", approverFullName: "", leaveRequest: "", comment: "", status: ""}
    ])
    const {toast} = useToast();
    const navigate = useNavigate();

    type Columns = {
        id: string,
        approver: string,
        approverFullName: string,
        leaveRequest: string,
        status: string,
        comment: string
    }

    const approveRequest = async (id: string) => {
        try {
            var approvalRequest = approvalRequests.find(e => e.id === id)
            if(approvalRequest?.status !== "New") {
                throw new Error("Cannot approve other requests than 'New'")
            }
            const response = await fetch(`${APIURL}/ApprovalRequest/approveRequest?approvalRequestId=${id}&approverId=${userId}`)

            if(response.status === 404) {
                toast({
                    description: `Employee or request haven't been found`,
                    action: <ToastAction altText="Close">Close</ToastAction>
                })
            }
            else if(!response.ok)
                throw new Error(await response.text())

            window.location.reload()
        }catch (error) {
            toast({
                variant: "destructive",
                title: "Error!",
                description: `Cannot approve request. ${error}`,
                action: <ToastAction altText="Close">Close</ToastAction>
            })
        }
    }

    const rejectRequest = async (id: string, comment: string)=> {
        try {
            setIsDialogOpen(false)
            var approvalRequest = approvalRequests.find(e => e.id === id)
            if(approvalRequest?.status !== "New") {
                throw new Error("Cannot reject other requests than 'New'")
            }
            const response = await fetch(`${APIURL}/ApprovalRequest/rejectRequest?approvalRequestId=${id}&approverId=${userId}&comment=${comment}`)

            if(response.status === 404) {
                toast({
                    description: `Employee or request haven't been found`,
                    action: <ToastAction altText="Close">Close</ToastAction>
                })
            }
            else if(!response.ok)
                throw new Error(await response.text())

            window.location.reload()
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error!",
                description: `Cannot approve request. ${error}`,
                action: <ToastAction altText="Close">Close</ToastAction>
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
                        Approval Number
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "approverFullName",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Approver Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "leaveRequest",
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
            cell: ({row}) => {
                const approvalRequest = row.original
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const [comment, setComment] = useState<string>("")
                return (
                    <>
                        {role !== ROLES.Employee &&
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem onClick={() => approveRequest(approvalRequest.id)}> Approve Request </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsDialogOpen(true)}> Reject Request </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate('/Lists/ApprovalRequests/Form', {state: {id: approvalRequest.id, accesstype: ACCESSTYPES.ReadOnly}})}> Open Request </DropdownMenuItem>
                            </DropdownMenuContent>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Reject request</DialogTitle>
                                        <DialogDescription>
                                            Write a comment explaining reason of rejection
                                        </DialogDescription>
                                        <Textarea minLength={10} value={comment} onChange={
                                            (value) => setComment(value.target.value)}
                                        />
                                        <Button onClick={() => rejectRequest(approvalRequest.id, comment)}>Confirm</Button>
                                    </DialogHeader>
                                </DialogContent>
                            </Dialog>
                        </DropdownMenu>
                        }
                    </>
                )
            },
        }
    ]

    const loadApprovalRequests = async ()=> {
        setIsLoading(true)
        try {
            let response: Response
            if(role === ROLES.Employee)
                response = await fetch(`${APIURL}/ApprovalRequest/getEmployeeApprovalRequests?employeeId=${userId}`)
            else if(role === ROLES.Administrator)
                response = await fetch(`${APIURL}/ApprovalRequest/getApprovalRequests`)
            else
                response = await fetch(`${APIURL}/ApprovalRequest/getAssignedApprovalRequests?approverId=${userId}`)

            if(response.status === 404) {
                setIsLoading(false)
                setApprovalRequests([])
                toast({
                    description: `You have no assigned projects!`,
                    action: <ToastAction altText="Close">Close</ToastAction>
                })
            }
            else if(!response.ok)
                throw new Error(`Failed to fetch data`)
            else {
                const data = await response.json()
                setApprovalRequests(data)
                setIsLoading(false)
            }
        }catch (error) {
            toast({
                variant: "destructive",
                title: "Error!",
                description: `Cannot load approval requests. ${error}`,
                action: <ToastAction altText="Close">Close</ToastAction>
            })
            setIsLoading(true)
        }
    }

    useEffect(() => {
        loadApprovalRequests()
    }, []);

    return (
        <>
            <Toaster/>
            {isLoading ? (
                <p className="text-center w-auto font-semibold text-4xl mt-5"> Loading ...</p>
            ) : (
                <div className="m-2 mt-4">
                    <CustomDataTable columns={columns} data={approvalRequests} filterColumn="leaveRequest"/>
                </div>
            )}
        </>
    )
}
export default ListApprovalRequests;