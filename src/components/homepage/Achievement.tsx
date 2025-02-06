import { acheivements } from "./dummyData";
import { FaEdit } from "react-icons/fa";
import { FaCirclePlus } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { Button } from "../ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

function AcheivementModal({ modalType }: { modalType: string }) {
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{modalType === "add" ? "Add Acheivement" : "Edit Acheivement"}</DialogTitle>
                <DialogDescription/>
            </DialogHeader>
            <div className="mt-2 flex flex-col gap-y-4">
                <div>
                    <Label>Acheivement</Label>
                    <Input />
                </div>
            </div>
            <DialogFooter>
                <Button type="submit">{modalType === "add" ? "Add Acheivement" : "Save Changes"}</Button>
            </DialogFooter>
        </DialogContent>
    );
}
export default function Acheivement() {
    const [modalType, setModalType] = useState("");

    return (
        <div className="bg-gray-100 rounded-2xl w-full max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex-1 text-center">Acheivement</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <button onClick={() => setModalType("add")}><FaCirclePlus className="text-2xl hover:text-sky-600"/></button>
                    </DialogTrigger>
                    <AcheivementModal modalType={modalType} />
                </Dialog>
            </div>
            
            <ul className="list-disc text-lg text-gray-700 space-y-3">
                {acheivements.map((element, index) => (
                    <li 
                        key={index} 
                        className="flex items-center justify-between gap-x-3 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-gray-700 border-2 rounded-lg p-2 shadow-md hover:shadow-xl transition-all duration-300"
                    >
                        <h2 className="text-base font-normal text-gray-700">{element}</h2>

                        <div className="flex items-center gap-x-4">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button 
                                        className="text-blue-500 hover:text-blue-700"
                                        onClick={() => setModalType("edit")}
                                    >
                                        <FaEdit size={20} />
                                    </button>
                                </DialogTrigger>
                                <AcheivementModal modalType={modalType} />
                            </Dialog>
                            <button className="text-red-500 hover:text-red-700">
                                <MdDelete size={20} />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
