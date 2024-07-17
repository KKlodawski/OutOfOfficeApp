import {useLocation, useNavigate} from "react-router-dom";
import {useToast} from "../components/ui/use-toast";
import React, {useEffect, useState} from "react";
import { Toaster } from "../components/ui/toaster"
import {Label} from "../components/ui/label";
import {ACCESSTYPES, APIURL} from "../Data/Globals";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../components/ui/select";
import {Popover, PopoverContent, PopoverTrigger} from "../components/ui/popover";
import {Button} from "../components/ui/button";
import {cn} from "../lib/utils";
import {Calendar as CalendarIcon} from "lucide-react";
import {format} from "date-fns";
import {Calendar} from "../components/ui/calendar";
import {Textarea} from "../components/ui/textarea";
import { Input } from "../components/ui/input"
import {ToastAction} from "../components/ui/toast";

function LeaveRequestForm() {
    const location = useLocation();
    const { id, accesstype } = location.state || { id: null, name: null };
    const navigate = useNavigate();
    const {toast} = useToast();
    const [loading, setLoading] =  useState<boolean>(false);
    const [leaveRequest, setLeaveRequest] = useState(
    {id: 0, employeeId: 0, employeeFullName: "", absenceReason: "", startDate: undefined as Date | undefined, endDate: undefined as Date | undefined, comment: null as string | null, status: ""}
    )

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>)=> {
        event.preventDefault()
        try {
            if (leaveRequest.absenceReason === "")
                throw new Error("Please select absence reason")
            if(leaveRequest.startDate === undefined)
                throw new Error("Please select project start date")
            if(leaveRequest.endDate !== undefined ? leaveRequest.startDate > leaveRequest.endDate : true)
                throw new Error("Project cannot end before it's start or end date it not selected")
            let leaveRequestToSend = {
                ...leaveRequest,
                employeeId: localStorage.getItem("userId"),
                endDate: format(leaveRequest.endDate as Date, 'yyyy-MM-dd'),
                startDate: format(leaveRequest.startDate, 'yyyy-MM-dd'),
            }
            if(ACCESSTYPES.Add === accesstype) {
                leaveRequestToSend = {
                    ...leaveRequestToSend,
                    status: "New"
                }
                const response = await fetch(`${APIURL}/LeaveRequest/addLeaveRequest`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(leaveRequestToSend)
                })
                if(!response.ok)
                    throw new Error(`Failed to add leave request`)

                toast({
                    description: "Leave Request has been added successfully",
                    action: <ToastAction altText="Close">Close</ToastAction>
                })
                navigate("/Lists/LeaveRequests")
            }
            if(ACCESSTYPES.Edit === accesstype) {
                const response = await fetch(`${APIURL}/LeaveRequest/editLeaveRequest`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(leaveRequestToSend)
                })
                if(!response.ok)
                    throw new Error(`Failed to edit leave request`)

                toast({
                    description: "Leave request has been modified successfully",
                    action: <ToastAction altText="Close">Close</ToastAction>
                })
                navigate("/Lists/LeaveRequests")
            }


        } catch (error) {
            toast({
                description: `${error}`,
                action: <ToastAction altText="Close">Close</ToastAction>,
            })
        }
    }

    function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
        const { name, value } = event.target;
        setLeaveRequest((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }

    const loadLeaveRequest = async () => {
        setLoading(true)
        try {
            const response = await fetch(`${APIURL}/LeaveRequest/getLeaveRequestById?id=${id}`)
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            setLeaveRequest(data)
            setLoading(false)
        } catch (error) {
            setLoading(true)
            toast({
                variant: "destructive",
                title: "Error!",
                description: "Cannot load employee.",
                action: <ToastAction altText="Close">Close</ToastAction>,
            })
        }
    }

    useEffect(() => {
        if(ACCESSTYPES.ReadOnly === accesstype || ACCESSTYPES.Edit === accesstype) {
            loadLeaveRequest()
        }
    }, []);

    return (
        <>
            <Toaster/>
            {accesstype == null ? (
                    <p className="text-center w-auto font-semibold text-4xl mt-5">Unknown access!</p>
                ) :
                loading ? (
                    <p className="text-center w-auto font-semibold text-4xl mt-5">Loading ... </p>
                ) : (
                    <>
                        <div className="ml-auto mr-auto mt-5 border-4 p-2 rounded-sm w-1/2">
                            <form onSubmit={onSubmit}>
                                {ACCESSTYPES.ReadOnly === accesstype && <Label className="mb-1 font-semibold">Employee</Label>}
                                {ACCESSTYPES.ReadOnly === accesstype && <Input type="text" disabled={true} value={leaveRequest.employeeFullName}></Input>}

                                <Label className="mb-1 font-semibold">Absence Reason</Label>
                                <Select disabled={ACCESSTYPES.ReadOnly === accesstype} value={leaveRequest.absenceReason} name="absenceReason" onValueChange={(value: string) =>
                                    setLeaveRequest((prevData) => ({
                                        ...prevData,
                                        absenceReason: value,
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an absence reason"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SickLeave">Sick Leave</SelectItem>
                                        <SelectItem value="PersonalLeave">Personal Leave</SelectItem>
                                        <SelectItem value="Vacation">Vacation</SelectItem>
                                        <SelectItem value="MaternityLeave">Maternity Leave</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Label className="mb-1 font-semibold">Start Date</Label>
                                <Popover >
                                    <PopoverTrigger asChild disabled={ACCESSTYPES.ReadOnly === accesstype} className="w-full">
                                        <Button variant="outline" className={cn("justify-start text-left", !leaveRequest.startDate && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {leaveRequest.startDate ? format(leaveRequest.startDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <Calendar
                                            mode="single"
                                            selected={leaveRequest.startDate ? leaveRequest.startDate : undefined}
                                            onSelect={(value: Date | undefined) => {
                                                if (value)
                                                    setLeaveRequest((prevData) => ({
                                                        ...prevData,
                                                        startDate: value,
                                                    }))
                                                else
                                                    setLeaveRequest((prevData) => ({
                                                        ...prevData,
                                                        startDate: undefined,
                                                    }))
                                            }
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>

                                <Label className="mb-1 font-semibold">End Date</Label>
                                <Popover >
                                    <PopoverTrigger asChild disabled={ACCESSTYPES.ReadOnly === accesstype} className="w-full">
                                        <Button variant="outline" className={cn("justify-start text-left", !leaveRequest.endDate && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {leaveRequest.endDate ? format(leaveRequest.endDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <Calendar
                                            mode="single"
                                            selected={leaveRequest.endDate ? leaveRequest.endDate : undefined}
                                            onSelect={(value: Date | undefined) => {
                                                if (value)
                                                    setLeaveRequest((prevData) => ({
                                                        ...prevData,
                                                        endDate: value,
                                                    }))
                                                else
                                                    setLeaveRequest((prevData) => ({
                                                        ...prevData,
                                                        endDate: undefined,
                                                    }))
                                            }
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>

                                <Label className="mb-1 font-semibold">Comment</Label>
                                <Textarea disabled={ACCESSTYPES.ReadOnly === accesstype} placeholder="Enter a comment here" minLength={30} value={leaveRequest.comment ? leaveRequest.comment : undefined} name="comment" onChange={handleChange}/>

                                <Label className="mb-1 font-semibold">Status</Label>
                                <Select disabled={true} value={leaveRequest.status} name="status" onValueChange={(value: string) =>
                                    setLeaveRequest((prevData) => ({
                                        ...prevData,
                                        status: value,
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a status"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="New">New</SelectItem>
                                        <SelectItem value="Submitted">Submitted</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                    <br/>
                                    {ACCESSTYPES.ReadOnly !== accesstype ? <Button type="submit">Submit</Button> : <></>}
                                </Select>

                            </form>
                        </div>
                    </>
            )}
        </>
    )
}

export default LeaveRequestForm;