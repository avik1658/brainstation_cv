import { projects } from "./dummyData";
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
import { Textarea } from "../ui/textarea";


function ProjectModal({ modalType }: { modalType: string }) {
    return (
        <DialogContent className="max-w-4xl w-full">
            <DialogHeader>
                <DialogTitle>{modalType === "add" ? "Add Project" : "Edit Project"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mt-2 flex flex-col gap-y-4">
                    <div>
                        <Label>Name</Label>
                        <Input />
                    </div>
                    <div>
                        <Label>Techlogy Used</Label>
                        <Input />
                    </div>
                    <div>
                        <Label>Responsibilities</Label>
                        <Input/>
                    </div>
                </div>
                <div className="mt-2 flex flex-col gap-y-4">
                    <div>
                        <Label>Link</Label>
                        <Input/>
                    </div>
                    <div>
                        <Label>Duration</Label>
                        <Input/>
                    </div>
                    <div>
                        <Label>Description</Label>
                        <Textarea/>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button type="submit">{modalType === "add" ? "Add Project" : "Save Changes"}</Button>
            </DialogFooter>
        </DialogContent>
    );
}

export default function Project() {
    const [modalType, setModalType] = useState("");
    return (
        <div className="p-12 bg-gray-100 rounded-2xl shadow-lg max-w-6xl mx-auto my-5">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex-1 text-center">Projects</h1>
                <Dialog>
                    <DialogTrigger asChild>
                    <button onClick={() => setModalType("add")}><FaCirclePlus className="text-2xl hover:text-sky-600"/></button>
                    </DialogTrigger>
                    <ProjectModal modalType={modalType} />
                </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((element, index) => (
                    <div key={index} className="flex flex-col gap-2 bg-white p-6 border-l-4 border-red-500 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                        <div className="flex justify-between content-center">
                            <h2 className="text-xl font-semibold text-gray-700">{element.name}</h2>

                            <div className="flex flex-row gap-2">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button 
                                            className="text-blue-500 hover:text-blue-700"
                                            onClick={() => setModalType("edit")}
                                        >
                                            <FaEdit size={20} />
                                        </button>
                                    </DialogTrigger>
                                    <ProjectModal modalType={modalType} />
                                </Dialog>
                                <button className="text-red-500 hover:text-red-700">
                                    <MdDelete size={20} />
                                </button>
                            </div>
                        </div>
                        <p className="text-gray-600 font-medium mt-2">
                            <span className="font-bold text-gray-800">Tech Stack : </span> {element.tech}
                        </p>
                        <p className="text-gray-600 font-medium">
                            <span className="font-bold text-gray-800">Responsibilities : </span> {element.responsibilities}
                        </p>
                        <p className="text-gray-600 font-medium">
                            <span className="font-bold text-gray-800">Github Link : </span> {element.link}
                        </p>
                        <p className="text-gray-600 font-medium">
                            <span className="font-bold text-gray-800">Duration : </span> {element.duration}
                        </p>
                        <p className="text-gray-700 mt-3 leading-relaxed">{element.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
