import {useLocation, useNavigate} from "react-router-dom";
import {ToastAction} from "../components/ui/toast";
import { useToast} from "../components/ui/use-toast"
import { Toaster } from "../components/ui/toaster"
import { Button } from "../components/ui/button"
import { Textarea } from "../components/ui/textarea"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "../lib/utils"
import { format } from "date-fns"
import { Calendar } from "../components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select"
import {Label } from "../components/ui/label"
import {ACCESSTYPES, APIURL} from "../Data/Globals";
import React, {useEffect, useState} from "react";
function ProjectForm() {
    const location = useLocation();
    const { id, accesstype } = location.state || { id: null, name: null };
    const navigate = useNavigate();
    const [loading, setLoading] =  useState<boolean>(true);
    const [loadingPM, setLoadingPM] =  useState<boolean>(false);
    const {toast} = useToast();
    const [project, setProject ] = useState(
        { id: 0, projectType: "", startDate: undefined as Date | undefined, endDate: undefined as Date | undefined, projectManager: 0, comment: null as string | null, status: ""}
    );
    const [projectManagers, setProjectManagers ] = useState([
        { id: 0, fullName: "", subdivision: "", position: "", peoplePartner: 0, outOfOfficeBalance: 0, photo: "", status: ""}
    ]);

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        try {
            if(project.projectType === "")
                throw new Error("Please select project type")
            if(project.startDate === undefined)
                throw new Error("Please select project start date")
            if(project.endDate ? project.startDate > project.endDate : false)
                throw new Error("Project cannot end before it's start")
            if(project.projectManager === 0)
                throw new Error("Please select project manager")
            if(project.status === "")
                throw new Error("Please select status")
            const projectToSend = {
                ...project,
                endDate: project.endDate ? format(project.endDate, 'yyyy-MM-dd') : null,
                startDate: format(project.startDate, 'yyyy-MM-dd')
            }

            if(ACCESSTYPES.Edit === accesstype) {
                const response = await fetch(`${APIURL}/Project/editProject`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(projectToSend)
                })
                if(!response.ok)
                    throw new Error(`Failed to edit project`)

                toast({
                    description: "Project has been modified",
                    action: <ToastAction altText="Close">Close</ToastAction>
                })
                navigate("/Lists/Projects")
            }
            if(ACCESSTYPES.Add === accesstype) {
                const response = await fetch(`${APIURL}/Project/addProject`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(projectToSend)
                })
                if(!response.ok)
                    throw new Error(`Failed to add project ${await response.text()}`)

                toast({
                    description: "Project has been added successfully",
                    action: <ToastAction altText="Close">Close</ToastAction>
                })
                navigate("/Lists/Projects")
            }
        } catch (error) {
            toast({
                description: `${error}`,
                action: <ToastAction altText="Close">Close</ToastAction>,
            })
        }
    }

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setProject((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
    const loadProjectManagers = async () => {
        setLoadingPM(true)
        try {
            const response = await fetch(`${APIURL}/Employee/getEmployeesByPosition?position=ProjectManager`)
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            setProjectManagers(data)
            setLoadingPM(false)
        } catch (error) {
            setLoadingPM(true)
            toast({
                variant: "destructive",
                title: "Error!",
                description: "Cannot load project managers.",
                action: <ToastAction altText="Close">Close</ToastAction>,
            })

        }
    }

    const loadProjectsData = async () => {
        setLoading(true)
        try {
            const response = await fetch(`${APIURL}/Project/getProjectById?id=${id}`)
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            setProject(data)
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
        loadProjectManagers()
        if(ACCESSTYPES.ReadOnly === accesstype || ACCESSTYPES.Edit === accesstype) {
            loadProjectsData()
        }
    }, [])

    return (
        <>
            <Toaster/>
            {accesstype == null ? (
                    <p className="text-center w-auto font-semibold text-4xl mt-5">Unknown access!</p>
            ) :
                loading && loadingPM ? (
                    <p className="text-center w-auto font-semibold text-4xl mt-5">Loading ... </p>
                ) : (
                    <div className="ml-auto mr-auto mt-5 border-4 p-2 rounded-sm w-1/2">
                        <form onSubmit={onSubmit}>
                            <Label className="mb-1 font-semibold">Project Type</Label>
                            <Select disabled={ACCESSTYPES.ReadOnly === accesstype} value={project.projectType} name="projectType" onValueChange={(value: string) =>
                                setProject((prevData) => ({
                                    ...prevData,
                                    projectType: value,
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a project type"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SoftwareDevelopment">Software Development</SelectItem>
                                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                                    <SelectItem value="Data">Data</SelectItem>
                                    <SelectItem value="Security">Security</SelectItem>
                                    <SelectItem value="Integration">Integration</SelectItem>
                                </SelectContent>
                            </Select>

                            <Label className="mb-1 font-semibold">Start Date</Label><br/>
                            <Popover >
                                <PopoverTrigger asChild disabled={ACCESSTYPES.ReadOnly === accesstype} className="w-full">
                                    <Button variant="outline" className={cn("justify-start text-left", !project.startDate && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {project.startDate ? format(project.startDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <Calendar
                                        mode="single"
                                        selected={project.startDate ? project.startDate : undefined}
                                        onSelect={(value: Date | undefined) => {
                                            if (value)
                                                setProject((prevData) => ({
                                                    ...prevData,
                                                    startDate: value,
                                                }))
                                            else
                                                setProject((prevData) => ({
                                                    ...prevData,
                                                    startDate: undefined,
                                                }))
                                            }
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>

                            <Label className="mb-1 font-semibold">End Date</Label> <br/>
                            <Popover >
                                <PopoverTrigger asChild disabled={ACCESSTYPES.ReadOnly === accesstype} className="w-full">
                                    <Button variant="outline" className={cn("justify-start text-left", !project.endDate && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {project.endDate ? format(project.endDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <Calendar
                                        mode="single"
                                        selected={project.endDate ? project.endDate : undefined}
                                        onSelect={(value: Date | undefined) => {
                                            if(value)
                                                setProject((prevData) => ({
                                                    ...prevData,
                                                    endDate: value,
                                                }))
                                            else
                                                setProject((prevData) => ({
                                                    ...prevData,
                                                    endDate: undefined,
                                                }))
                                            }
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>

                            <Label className="mb-1 font-semibold">Project Manager</Label>
                            <Select disabled={ACCESSTYPES.ReadOnly === accesstype} value={project.projectManager.toString()} name="projectManager" onValueChange={(value: string) =>
                                setProject((prevData) => ({
                                    ...prevData,
                                    projectManager: parseInt(value),
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select employee partner" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projectManagers.map((pm, index) => (
                                        <SelectItem value={pm.id.toString()}>
                                            {pm.fullName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Label className="mb-1 font-semibold">Comment</Label>
                            <Textarea disabled={ACCESSTYPES.ReadOnly === accesstype} placeholder="Enter a comment here" minLength={30} value={project.comment ? project.comment : undefined} name="comment" onChange={handleChange}/>

                            <Label className="mb-1 font-semibold">Status</Label>
                            <Select disabled={ACCESSTYPES.ReadOnly === accesstype || ACCESSTYPES.Edit === accesstype} value={project.status} name="status" onValueChange={(value: string) =>
                                setProject((prevData) => ({
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
                            <br/>
                            {ACCESSTYPES.ReadOnly !== accesstype ? <Button type="submit">Submit</Button> : <></>}
                        </form>
                    </div>
                )}
        </>
    )
}

export default ProjectForm;