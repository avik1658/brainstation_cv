import { education } from "./dummyData";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FaCirclePlus } from "react-icons/fa6";
import { Button } from "../ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

function EducationModal({ modalType }: { modalType: string }) {
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{modalType === "add" ? "Add Education" : "Edit Education"}</DialogTitle>
            </DialogHeader>
            <div className="mt-2 flex flex-col gap-y-4">
                <div>
                    <Label>Degree</Label>
                    <Input />
                </div>
                <div>
                    <Label>Department</Label>
                    <Input />
                </div>
                <div>
                    <Label>PassingYear</Label>
                    <Input type="Number"/>
                </div>
                <div>
                    <Label>University/Institute</Label>
                    <Input/>
                </div>
            </div>
            <DialogFooter>
                <Button type="submit">{modalType === "add" ? "Add Education" : "Save Changes"}</Button>
            </DialogFooter>
        </DialogContent>
    );
}


export default function Education() {
    const [modalType, setModalType] = useState("");
    return (
        <div className="bg-gray-100 rounded-2xl w-full max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex-1 text-center">Education</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <button onClick={() => setModalType("add")}><FaCirclePlus className="text-2xl hover:text-sky-600"/></button>
                    </DialogTrigger>
                    <EducationModal modalType={modalType} />
                </Dialog>
            </div>
            <div className="grid grid-cols-1 gap-6">
                {education.map((edu, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 flex flex-col min-h-[120px]">
                        <div className="flex justify-between content-center">
                            <h2 className="text-xl font-semibold text-gray-700">{edu.degree} in {edu.department}</h2>

                            <div className="flex flex-row gap-2">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button 
                                            className="text-blue-500 hover:text-blue-700"
                                            onClick={() => setModalType("edit")}
                                        >
                                            <FaEdit className="text-sky-600" size={20} />
                                        </button>
                                    </DialogTrigger>
                                    <EducationModal modalType={modalType} />
                                </Dialog>
                                <button className="text-red-500 hover:text-red-700">
                                    <MdDelete size={20} />
                                </button>
                            </div>
                        </div>
                        <h4 className="text-sm text-gray-400 mt-auto">{edu.passingYear}</h4>
                        <h4 className="text-sm text-gray-400">{edu.university_Institute}</h4>
                    </div>
                ))}
            </div>
        </div>
    );
}