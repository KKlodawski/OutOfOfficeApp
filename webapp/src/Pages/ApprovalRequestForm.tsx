import {useLocation} from "react-router-dom";
import {APIURL} from "../Data/Globals";
import React, {useEffect, useState} from "react";
import {Label} from "../components/ui/label";
import {Input} from "../components/ui/input";
import {ToastAction} from "../components/ui/toast";
import { Toaster } from "../components/ui/toaster"
import { useToast } from "../components/ui/use-toast"
function ApprovalRequestForm() {
    const location = useLocation();
    const { id, accesstype } = location.state || { id: null, name: null };
    const [loading, setLoading] = useState(true);
    const [approvalRequest, setApprovalRequest] = useState(
        {id: "", approver: "", approverFullName: "", leaveRequest: "", comment: "", status: ""}
    )
    const {toast} = useToast();
    const loadApprovalRequestData = async()=> {
        setLoading(true)
        try {
            const response = await fetch(`${APIURL}/ApprovalRequest/getApprovalRequestById?approvalRequestId=${id}`)
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            setApprovalRequest(data)
            setLoading(false)
        } catch (error) {
            setLoading(true)
            toast({
                variant: "destructive",
                title: "Error!",
                description: `Cannot load approval request. ${error}`,
                action: <ToastAction altText="Close">Close</ToastAction>,
            })

        }
    }

    useEffect(() => {
        loadApprovalRequestData()
    }, []);

    return (
        <>
            <Toaster/>
            { loading ? (
                <p className="text-center w-auto font-semibold text-4xl mt-5">Loading ... </p>
            ) : (
                <div className="ml-auto mr-auto mt-5 border-4 p-2 rounded-sm w-1/2">
                    <form>
                        <Label className="mb-1 font-semibold">Approval Number</Label>
                        <Input disabled={true} type="text" name="approver" value={approvalRequest.id}></Input>

                        <Label className="mb-1 font-semibold">Approver Name</Label>
                        <Input disabled={true} type="text" name="approverFullName" value={approvalRequest.approverFullName}></Input>

                        <Label className="mb-1 font-semibold">Request Number</Label>
                        <Input disabled={true} type="text" name="leaveRequest" value={approvalRequest.leaveRequest}></Input>

                        <Label className="mb-1 font-semibold">Comment</Label>
                        <Input disabled={true} type="text" name="comment" value={approvalRequest.comment}></Input>

                        <Label className="mb-1 font-semibold">Status</Label>
                        <Input disabled={true} type="text" name="status" value={approvalRequest.status}></Input>

                    </form>
                </div>
                )
            }
        </>
    )
}

export default ApprovalRequestForm