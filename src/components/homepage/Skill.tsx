import { skill } from "./dummyData";
import { FaEdit } from "react-icons/fa";
import { FaCirclePlus } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { Button } from "../ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

function SkillModal({ modalType }: { modalType: string }) {
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{modalType === "add" ? "Add Skill" : "Edit Skill"}</DialogTitle>
                <DialogDescription/>
            </DialogHeader>
            <div className="mt-2 flex flex-col gap-y-4">
                <div>
                    <Label>Skill</Label>
                    <Input />
                </div>
                <div>
                    <Label>Rating</Label>
                    <Input type="number" min={1} max={10} />
                </div>
            </div>
            <DialogFooter>
                <Button type="submit">{modalType === "add" ? "Add Skill" : "Save Changes"}</Button>
            </DialogFooter>
        </DialogContent>
    );
}

export default function Skill() {
    const [modalType, setModalType] = useState("");

    return (
        <div className="p-12 bg-gray-100 rounded-2xl shadow-lg max-w-6xl mx-auto my-5">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex-1 text-center">Technical Skills</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <button onClick={() => setModalType("add")}><FaCirclePlus className="text-2xl hover:text-sky-600"/></button>
                    </DialogTrigger>
                    <SkillModal modalType={modalType} />
                </Dialog>
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {skill.map((element, index) => (
                    <div 
                        key={index} 
                        className="bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-xl transition"
                    >
                        <div className="flex justify-between content-center">
                            <p className="text-lg font-normal">{element.skillName}</p>

                            <div className="flex flex-row gap-2 items-center">
                                <p className="text-lg font-normal">{element.rating}/10</p>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button 
                                            className="text-blue-500 hover:text-blue-700"
                                            onClick={() => setModalType("edit")}
                                        >
                                            <FaEdit className="text-sky-600" size={20} />
                                        </button>
                                    </DialogTrigger>
                                    <SkillModal modalType={modalType} />
                                </Dialog>
                                <button className="text-red-500 hover:text-red-700">
                                    <MdDelete size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="w-full bg-gray-300 h-4 rounded-full mt-2">
                            <div 
                                className="bg-sky-600 h-4 rounded-full transition-all duration-500" 
                                style={{ width: `${element.rating * 10}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
