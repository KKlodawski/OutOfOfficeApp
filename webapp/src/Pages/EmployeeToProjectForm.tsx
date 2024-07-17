import {useLocation, useNavigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {Button} from "../components/ui/button";
import {APIURL} from "../Data/Globals";
import {ToastAction} from "../components/ui/toast";
import {Toaster} from "../components/ui/toaster"
import {useToast} from "../components/ui/use-toast"
import {Label} from "../components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../components/ui/select";

function EmployeeToProjectForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const {toast} = useToast();
    const { id } = location.state || { id: null};
    const [projects, setProjects ] = useState([
        { id: 0, projectType: "", startDate: undefined as Date | undefined, endDate: undefined as Date | undefined, projectManager: 0, comment: null as string | null, status: ""}
    ]);
    const [selectedProject,setSelectedProject] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true)
    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        try {
            if(selectedProject === 0)
                throw new Error("Please select project to assign")

            const response = await fetch(`${APIURL}/Employee/assignToProject?projectId=${selectedProject}&employeeId=${id}`)
            if(!response.ok)
                throw new Error(`Failed to edit project ${await response.text()}`)

            toast({
                description: "Assigned employee to project",
                action: <ToastAction altText="Close">Close</ToastAction>
            })
            navigate("/Lists/Projects")
        } catch (error) {
            toast({
                description: `${error}`,
                action: <ToastAction altText="Close">Close</ToastAction>,
            })
        }
    }

    const loadProjects = async () => {
        setLoading(true)
        try{
            const response = await fetch(`${APIURL}/Project/getProjects`);
            if(!response.ok)
                throw new Error(`Failed to fetch data`)

            const data = await response.json()
            setProjects(data)
            setLoading(false)
        }catch (error) {
            toast({
                variant: "destructive",
                title: "Error!",
                description: `Cannot load projects. ${error}`,
                action: <ToastAction altText="Close">Close</ToastAction>
            })
            setLoading(true)
        }
    }

    useEffect(() => {
        loadProjects()
    }, []);

    return (
        <>
            <Toaster/>
            {id == null ? (
                <p className="text-center w-auto font-semibold text-4xl mt-5">Unknown access!</p>
            ) : (
                loading ? (
                        <p className="text-center w-auto font-semibold text-4xl mt-5">Loading ... </p>
                    ) : (
                    <div className="ml-auto mr-auto mt-5 border-4 p-2 rounded-sm w-1/2">
                        <form onSubmit={onSubmit}>
                            <Label className="mb-1 font-semibold">Project Manager</Label>
                            <Select value={selectedProject.toString()} name="project" onValueChange={(value: string) =>
                                setSelectedProject((prevData) => (parseInt(value)))
                            }>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select employee partner" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((project, index) => (
                                        <SelectItem value={project.id.toString()}>
                                            {`${project.projectType} | ${project.startDate} ${project.endDate ? "| " + project.endDate : ""} | ${project.status}` }
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <br/>
                            <Button type="submit">Assign</Button>
                        </form>
                    </div>
                )
            )}
        </>
    )
}

export default EmployeeToProjectForm;