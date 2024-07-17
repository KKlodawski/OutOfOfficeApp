import "../Styles/MainPage.css";
import React, {useState} from "react";
import { Button } from "../components/ui/button"
import { useToast} from "../components/ui/use-toast"
import { ToastAction } from "../components/ui/toast"
import { ROLES } from "../Data/Globals"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "../components/ui/sheet";
import { APIURL } from "../Data/Globals";
import { Toaster } from "../components/ui/toaster"

function MainPage() {

    const [selectedRole, setSelectedRole] = useState<string>('');
    const [sheetDisabled, setSheetDisabled] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [employees, setEmployees ] = useState([
        { id: "", fullName: "", subdivision: "", position: "", proplePartner: "", outOfOfficeBalance: "", photo: ""}
    ]);
    const {toast} = useToast();
    const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRole(event.target.value);
    };

    function changeStoredUser(id: string, fullname: string) {
        localStorage.setItem("role", selectedRole)
        localStorage.setItem("userId", id)
        localStorage.setItem("userFullName", fullname)
        window.dispatchEvent(new Event('storage'))
        console.log(`Role ${selectedRole} and User ${id}, ${fullname} saved to storage!`)
    }

    const loadEmployeesData = async () => {
        if(selectedRole === '') {
            toast({
                description: "You have to select role!",
                action: <ToastAction altText="Close">Close</ToastAction>,
            })
            setSheetDisabled(true);
        } else {
            setIsLoading(true);
            try {
                const response = await fetch(`${APIURL}/Employee/getEmployeesByPosition?position=${selectedRole}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.json();
                setEmployees(data)
                setIsLoading(false)
                setSheetDisabled(false)
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error!",
                    description: "Cannot load employees.",
                    action: <ToastAction altText="Close">Close</ToastAction>,
                })
                setIsLoading(true)
                setSheetDisabled(true)

            }

        }
    }

    return (
        <div className="mainContainer text-6xl font-medium mt-7 ">
            <h1>Main Page!</h1>
            <div className="combobox-container" style={{ width: 200 }}>
                <select value={selectedRole} onChange={handleRoleChange} className="combobox">
                    <option value="" disabled>Select role...</option>
                    {Object.values(ROLES).map(role => (
                        <option key={role} value={role}>
                            {role}
                        </option>
                    ))}
                </select>
            </div>
            <Toaster />
            <Sheet open={!sheetDisabled} onOpenChange={() => setSheetDisabled(!sheetDisabled)}>
                <Button variant="outline" onClick={() => {loadEmployeesData()}}>
                    <SheetTrigger>
                        Open
                    </SheetTrigger>
                </Button>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle className="text-2xl font-bold italic">Choose employee</SheetTitle>
                        <div className="flex flex-col h-screen p-2">
                            {isLoading ? (
                                    <p className="text-center w-auto font-semibold text-xl mt-5"> Loading... </p>
                                ):(
                                employees.map(employee => (
                                <Button className="m-1" onClick={() => {
                                    changeStoredUser(employee.id, employee.fullName)
                                    setSheetDisabled(!sheetDisabled)
                                }}>{employee.fullName}</Button>
                                ))
                            )}
                        </div>
                    </SheetHeader>
                </SheetContent>
            </Sheet>
        </div>
    );
}

export default MainPage;