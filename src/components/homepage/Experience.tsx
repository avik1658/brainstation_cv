import { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { FaCirclePlus } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import axiosInstance from "@/axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface ExperienceFormData {
  company_name: string;
  designation: string;
  start: string;
  end: string;
}

interface Experience extends ExperienceFormData {
    id: number;
}

interface ExperienceModalProps {
    modalType: string;
    postExperience: (data: ExperienceFormData) => void;
    closeModal: () => void;
  }


const formSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  designation: z.string().min(1, "Designation is required"),
  start: z.string().min(1, "Start date is required"),
  end: z.string().min(1, "End date is required"),
});

function ExperienceModal({ modalType, postExperience, closeModal }: ExperienceModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { company_name: "", designation: "", start: "", end: "" },
  });

  const onSubmit = (data: ExperienceFormData) => {
    postExperience(data);
    reset();
    closeModal();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{modalType === "add" ? "Add Experience" : "Edit Experience"}</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
        <div>
          <Label>Company Name</Label>
          <Input {...register("company_name")} />
          {errors.company_name && <p className="text-red-500">{errors.company_name.message}</p>}
        </div>
        <div>
          <Label>Designation</Label>
          <Input {...register("designation")} />
          {errors.designation && <p className="text-red-500">{errors.designation.message}</p>}
        </div>
        <div>
          <Label>Start Date</Label>
          <Input {...register("start")} />
          {errors.start && <p className="text-red-500">{errors.start.message}</p>}
        </div>
        <div>
          <Label>End Date</Label>
          <Input {...register("end")} />
          {errors.end && <p className="text-red-500">{errors.end.message}</p>}
        </div>
        <DialogFooter>
          <Button type="submit">{modalType === "add" ? "Add Experience" : "Save Changes"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default function Experience() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [modalType, setModalType] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchExperiences = async () => {
    try {
      const response = await axiosInstance.get<Experience[]>("/api/v1/experiences/");
      setExperiences(response.data);
    } catch (error) {
      console.error("Error fetching experiences:", error);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const postExperience = async (data: ExperienceFormData) => {
    try {
      await axiosInstance.post("/api/v1/experiences/", data);
      fetchExperiences();
    } catch (error) {
      console.error("Error posting experience:", error);
    }
  };

  const deleteExperience = async (id: number) => {
    try {
      await axiosInstance.delete(`/api/v1/experiences/${id}/`);
      fetchExperiences();
    } catch (error) {
      console.error("Error deleting experience:", error);
    }
  };

  return (
    <div className="bg-gray-100 rounded-2xl w-full max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex-1 text-center">Experience</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <button onClick={() => { setModalType("add"); setIsModalOpen(true); }}>
              <FaCirclePlus className="text-2xl hover:text-sky-600" />
            </button>
          </DialogTrigger>
          <ExperienceModal modalType={modalType} postExperience={postExperience} closeModal={() => setIsModalOpen(false)} />
        </Dialog>
      </div>
      <div className="grid grid-cols-1 gap-6">
                {experiences.map((exp, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 flex flex-col min-h-[120px]" >
                        <div className="flex justify-between content-center">
                            <h2 className="text-xl font-semibold text-gray-700">{exp.designation}</h2>

                            <div className="flex flex-row gap-2">
                            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                                    <DialogTrigger asChild>
                                        <button 
                                            className="text-blue-500 hover:text-blue-700"
                                            onClick={() => setModalType("edit")}
                                        >
                                            <FaEdit className="text-sky-600" size={20} />
                                        </button>
                                    </DialogTrigger>
                                </Dialog>
                                <button className="text-red-500 hover:text-red-700">
                                    <MdDelete size={20} onClick={() => deleteExperience(exp.id)} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-xl text-gray-500">{exp.company_name}</h3>
                        <h4 className="text-sm text-gray-400 mt-auto">{exp.start} - {exp.end}</h4>
                    </div>
                ))}
        </div>
    </div>
  );
}
