import { experience } from "./dummyData";
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

function ExperienceModal({ modalType }: { modalType: string }) {
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{modalType === "add" ? "Add Experience" : "Edit Experience"}</DialogTitle>
            </DialogHeader>
            <div className="mt-2 flex flex-col gap-y-4">
                <div>
                    <Label>Designation</Label>
                    <Input />
                </div>
                <div>
                    <Label>Company</Label>
                    <Input />
                </div>
                <div>
                    <Label>From</Label>
                    <Input/>
                </div>
                <div>
                    <Label>To</Label>
                    <Input/>
                </div>
            </div>
            <DialogFooter>
                <Button type="submit">{modalType === "add" ? "Add Experience" : "Save Changes"}</Button>
            </DialogFooter>
        </DialogContent>
    );
}

export default function Experience() {
    const [modalType, setModalType] = useState("");
    return (
        <div className="bg-gray-100 rounded-2xl w-full max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex-1 text-center">Experience</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <button onClick={() => setModalType("add")}><FaCirclePlus className="text-2xl hover:text-sky-600"/></button>
                    </DialogTrigger>
                    <ExperienceModal modalType={modalType} />
                </Dialog>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {experience.map((exp, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 flex flex-col min-h-[120px]" >
                        <div className="flex justify-between content-center">
                            <h2 className="text-xl font-semibold text-gray-700">{exp.designation}</h2>

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
                                    <ExperienceModal modalType={modalType} />
                                </Dialog>
                                <button className="text-red-500 hover:text-red-700">
                                    <MdDelete size={20} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-xl text-gray-500">{exp.company}</h3>
                        <h4 className="text-sm text-gray-400 mt-auto">{exp.from} - {exp.to}</h4>
                    </div>
                ))}
            </div>
        </div>
    );
}