import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { logoutUser } from "@/utils/auth";
import {useAxios} from "@/axios";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    SelectGroup
} from "@/components/ui/select"; 

interface DropdownProps {
    label: string;
    options: (string | number)[];
    selected: string | number;
    setSelected: (value: string | number) => void;  
}

function Dropdown({ label, options, selected, setSelected }: DropdownProps) {
    return (
        <div className="flex flex-row justify-between items-center">
            <Label className="w-2/3">{label}</Label>
            <Select
                value={selected.toString()} 
                onValueChange={(value) => {
                    const parsedValue = typeof options[0] === "number" ? Number(value) : value;
                    setSelected(parsedValue);
                }}
            >
                <SelectTrigger className="min-w-32 w-fit">
                    <SelectValue placeholder={selected.toString()} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {options.map((option) => (
                            <SelectItem key={option} value={option.toString()}> 
                                {option}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}

function NavModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [projectFirst, setProjectFirst] = useState<number>(2);
    const [projectSecond, setProjectSecond] = useState<number>(2);
    const [technicalSkill, setTechnicalSkill] = useState<number>(2);
    const [achievement, setAchievement] = useState<number>(2);
    const [training, setTraining] = useState<number>(2);
    const [nameType, setNameType] = useState<string>("Full Name");
    const [imageType, setImageType] = useState<string>("Image");
    const [education, setEducation] = useState<string>("Cv priority");
    const [reference, setReference] = useState<string>("Default");

    const handleSelected = <T extends string | number>(
        setter: React.Dispatch<React.SetStateAction<T>>
        ) => (value: string | number) => {
        setter(value as T);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl w-full">
                <DialogHeader>
                    <DialogTitle>Download CV in Custom Format</DialogTitle>
                    <DialogDescription>
                        Customize the format of your CV by selecting the options below.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <Dropdown label="Project in First Page" options={[1, 2, 3, 4]} selected={projectFirst} setSelected={handleSelected(setProjectFirst)} />
                        <Dropdown label="Project in Second Page" options={[1, 2, 3, 4]} selected={projectSecond} setSelected={handleSelected(setProjectSecond)} />
                        <Dropdown label="No. of Technical Skill" options={[1, 2, 3, 4, 5, 6, 7, 8]} selected={technicalSkill} setSelected={handleSelected(setTechnicalSkill)} />
                        <Dropdown label="No. of Achievement" options={[1, 2, 3, 4]} selected={achievement} setSelected={handleSelected(setAchievement)} />
                        <Dropdown label="No. of Training" options={[1, 2, 3, 4]} selected={training} setSelected={handleSelected(setTraining)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Dropdown label="Name Type" options={["Full Name", "Initials"]} selected={nameType} setSelected={handleSelected(setNameType)} />
                        <Dropdown label="Image Type" options={["Image", "Blank", "Initials"]} selected={imageType} setSelected={handleSelected(setImageType)} />
                        <Dropdown label="Education" options={["Cv priority", "B.sc"]} selected={education} setSelected={handleSelected(setEducation)} />
                        <Dropdown label="Reference in CV" options={["Default", "Bill Gates", "Mark Zuckerberg"]} selected={reference} setSelected={handleSelected(setReference)} />
                    </div>
                </div>

                <DialogFooter>
                    <Button type="submit">Download</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function Navbar() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const axiosInstance = useAxios();
    const userType = localStorage.getItem("role");

    const downloadCV = async () => {
        try {
            const response = await axiosInstance.get("/api/v1/generate-pdf/", {
                responseType: "blob",
                timeout: 10000,
                headers: {
                    'Accept': 'application/pdf',
                }
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "CV.pdf");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading CV:", error);
        }
    };


    return (
        <nav className="bg-indigo-950 text-white px-6 py-4 shadow-md flex flex-col gap-y-4 md:flex-row justify-between items-center">
            <div className="flex gap-4 items-center">
                <img src="/brain.png" alt="brainstation" className="w-12 h-12 rounded-full" />
                <p className="text-3xl font-bold text-sky-600">BrainStation23</p>
            </div>

            <div className="flex gap-4">
                {userType === "admin" && (
                    <Button variant="outline" className="bg-sky-600 text-white hover:text-white hover:bg-sky-700" onClick={() => window.location.href = "/admin"}>
                        Admin Page
                    </Button>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="bg-sky-600 text-white hover:text-white hover:bg-sky-700">
                            Download
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white shadow-lg rounded-lg mt-2 w-48 text-gray-800">
                        <DropdownMenuItem className="hover:bg-gray-100 px-4 py-2">
                            Download 3:2
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-gray-100 px-4 py-2">
                            Download 2:3
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-gray-100 px-4 py-2" onClick={downloadCV}>
                            Download Default
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-gray-100 px-4 py-2" onClick={() => setIsDialogOpen(true)}>
                            Download Custom
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="bg-sky-600 text-white hover:text-white hover:bg-sky-700">
                            Profile
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white shadow-lg rounded-lg mt-2 w-48 text-gray-800">
                        <DropdownMenuItem className="hover:bg-gray-100 px-4 py-2">My Profile</DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-gray-100 px-4 py-2">Profile Update</DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-gray-100 px-4 py-2" onClick={() => logoutUser()}>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <NavModal isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
        </nav>
    );
}