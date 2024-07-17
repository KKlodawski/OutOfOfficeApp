import { useLocation } from 'react-router-dom';
import {ACCESSTYPES, APIURL} from "../Data/Globals";
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select"
import React, {useEffect, useState} from "react";
import {ToastAction} from "../components/ui/toast";
import { useToast} from "../components/ui/use-toast"
import { Toaster } from "../components/ui/toaster"
import {Label } from "../components/ui/label"
import {useNavigate} from "react-router-dom";

function EmployeeForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const { id, accesstype } = location.state || { id: null, name: null };
    const [employeeData, setEmployeeData ] = useState(
        { id: 0, fullName: "", subdivision: "", position: "", peoplePartner: 0, outOfOfficeBalance: 0, photo: "", status: ""}
    );
    const {toast} = useToast();
    const [hrEmployees, setHREmployees ] = useState([
        { id: 0, fullName: "", subdivision: "", position: "", peoplePartner: 0, outOfOfficeBalance: 0, photo: "", status: ""}
    ]);
    const [loading, setLoading] = useState(true);
    const [loadingData, setLoadingData] = useState(true);
    const [photo, setPhoto] = useState<File | null>(null);

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            if(!employeeData.fullName.match("^[a-zA-Z]{3,} [a-zA-Z]{3,}$"))
                throw new Error("Invalid Full Name")
            if(employeeData.subdivision === '')
                throw new Error("Please select a subdivision")
            if(employeeData.position === '')
                throw new Error("Please select a position")
            if(employeeData.status === '')
                throw new Error("Please select status")
            if(employeeData.peoplePartner === 0)
                throw new Error("Please select a partner for employee")
            const formData = new FormData();
            if (photo) {
                formData.append('photoFile', photo);
            }
            formData.append('fullName', employeeData.fullName);
            formData.append('id', employeeData.id.toString());
            formData.append('subdivision', employeeData.subdivision);
            formData.append('outOfOfficeBalance', employeeData.outOfOfficeBalance.toString());
            formData.append('peoplePartner', employeeData.peoplePartner.toString());
            formData.append('position', employeeData.position);
            formData.append('status', employeeData.status);
            formData.append('photo', employeeData.photo);

            if(ACCESSTYPES.Add === accesstype) {
                const response = await fetch(`${APIURL}/Employee/addEmployee`, {
                    method: 'POST',
                    body: formData,
                })
                if (!response.ok) {
                    throw new Error('Failed to add employee');
                }
                toast({
                    description: "Employee has been added",
                    action: <ToastAction altText="Close">Close</ToastAction>,
                })
                navigate("/Lists/Employees")
            }
            if(ACCESSTYPES.Edit === accesstype) {
                const response = await fetch(`${APIURL}/Employee/editEmployee`, {
                    method: 'POST',
                    body: formData,
                })
                if (!response.ok) {
                    throw new Error('Failed to modify employee');
                }
                toast({
                    description: "Employee has been modified",
                    action: <ToastAction altText="Close">Close</ToastAction>,
                })
                navigate("/Lists/Employees")
            }
        } catch (error) {
            toast({
                description: `${error}`,
                action: <ToastAction altText="Close">Close</ToastAction>,
            })
        }
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setEmployeeData((prevData) => ({
            ...prevData,
            [name]: name === "outOfOfficeBalance" ? parseInt(value) : value,
        }));
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setPhoto(event.target.files[0]);
        }
    };

    const loadEmployeeData = async ()=> {
        setLoadingData(true)
        try {
            const response = await fetch(`${APIURL}/Employee/getEmployeesById?id=${id}`)
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            setEmployeeData(data)
            setLoadingData(false)
        } catch (error) {
            setLoadingData(true)
            toast({
                variant: "destructive",
                title: "Error!",
                description: `Cannot load employee ${error}`,
                action: <ToastAction altText="Close">Close</ToastAction>,
            })

        }
    }

    useEffect(() => {
        loadHREmployee()
        if(ACCESSTYPES.ReadOnly === accesstype || ACCESSTYPES.Edit === accesstype) {
            loadEmployeeData()
        }

    }, [])
    const loadHREmployee = async () => {
        setLoading(true)
        try {
            const response = await fetch(`${APIURL}/Employee/getEmployeesByPosition?position=HRManager`)
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            setHREmployees(data)
            setLoading(false)
        } catch (error) {
            setLoading(true)
            toast({
                variant: "destructive",
                title: "Error!",
                description: `Cannot load employees. ${error}`,
                action: <ToastAction altText="Close">Close</ToastAction>,
            })

        }
    }
    return (
        <>
            <Toaster/>
            {accesstype == null ? (
                <p className="text-center w-auto font-semibold text-4xl mt-5">Unknown access!</p>
            ) :
                loading && loadingData ? (
                    <p className="text-center w-auto font-semibold text-4xl mt-5">Loading ... </p>
                ) : (

                <div className="ml-auto mr-auto mt-5 border-4 p-2 rounded-sm w-1/2">
                    <form onSubmit={onSubmit}>
                        <Label className="mb-1 font-semibold">Full Name</Label>
                        <Input disabled={ACCESSTYPES.ReadOnly === accesstype} type="text" minLength={8} placeholder="Enter full name" name="fullName" onChange={handleChange} value={employeeData.fullName}></Input>

                        <Label className="mb-1 font-semibold">Subdivision</Label>
                        <Select disabled={ACCESSTYPES.ReadOnly === accesstype} value={employeeData.subdivision} name="subdivision" onValueChange={(value: string) =>
                            setEmployeeData((prevData) => ({
                                ...prevData,
                                subdivision: value,
                            }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a subdivision"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SoftwareDevelopment">Software Development</SelectItem>
                                <SelectItem value="QualityAssurance">Quality Assurance</SelectItem>
                                <SelectItem value="Helpdesk">Helpdesk</SelectItem>
                                <SelectItem value="ProjectManagement">Project Management</SelectItem>
                                <SelectItem value="NetworkAdministration">Network Administration</SelectItem>
                                <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                                <SelectItem value="ProductManagement">Product Management</SelectItem>
                                <SelectItem value="HumanResources">Human Resources</SelectItem>
                            </SelectContent>
                        </Select>

                        <Label className="mb-1 font-semibold">Position</Label>
                        <Select disabled={ACCESSTYPES.ReadOnly === accesstype} value={employeeData.position} name="position" onValueChange={(value: string) =>
                            setEmployeeData((prevData) => ({
                                ...prevData,
                                position: value,
                            }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a position"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="HRManager">HR Manager</SelectItem>
                                <SelectItem value="ProjectManager">Project Manager</SelectItem>
                                <SelectItem value="Employee">Employee</SelectItem>
                                <SelectItem value="Administrator">Administrator</SelectItem>
                            </SelectContent>
                        </Select>

                        <Label className="mb-1 font-semibold">Status</Label>
                        <Select disabled={ACCESSTYPES.ReadOnly === accesstype} value={employeeData.status} name="status" onValueChange={(value: string) =>
                            setEmployeeData((prevData) => ({
                                ...prevData,
                                status: value,
                            }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a status"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>

                        <Label className="mb-1 font-semibold">People Partner</Label>
                        <Select disabled={ACCESSTYPES.ReadOnly === accesstype} value={employeeData.peoplePartner.toString()} name="peoplePartner" onValueChange={(value: string) =>
                            setEmployeeData((prevData) => ({
                                ...prevData,
                                peoplePartner: parseInt(value),
                            }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select employee partner" />
                            </SelectTrigger>
                            <SelectContent>
                                {hrEmployees.map((hr, index) => (
                                    <SelectItem value={hr.id.toString()}>
                                        {hr.fullName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Label className="mb-1 font-semibold">OutOfOffice Balance</Label>
                        <Input disabled={ACCESSTYPES.ReadOnly === accesstype} type="number" min="0" placeholder="Enter employee OutOfOffice balance" name="outOfOfficeBalance" onChange={handleChange} value={employeeData.outOfOfficeBalance}></Input>
                        {ACCESSTYPES.ReadOnly !== accesstype ? <Label className="mb-1 font-semibold">Photo</Label> : <></>}
                        {ACCESSTYPES.ReadOnly !== accesstype ? <Input type="file" onChange={handleFileChange}/> : <></>}
                        <br/>
                        {ACCESSTYPES.ReadOnly !== accesstype ? <Button type="submit">Submit</Button> : <></>}
                    </form>
                </div>
            )}

        </>
    )
}
export default EmployeeForm;