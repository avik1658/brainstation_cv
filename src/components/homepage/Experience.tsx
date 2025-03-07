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
import {useAxios} from "@/axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import { AxiosError } from "axios";
import { ToastMessage } from "@/utils/ToastMessage";


interface ExperienceFormData {
  company_name: string;
  designation: string;
  start: string;
  end: string;
  priority: number;
}

interface Experience extends ExperienceFormData {
  id: number;
}

interface ExperienceModalProps {
  modalType: string;
  experienceData?: Experience | null;
  handleExperience: (data: ExperienceFormData, id?: number) => void;
  closeModal: () => void;
}

const formSchema = z.object({
  company_name: z.string().min(2, "Minimum character is 2").max(30, "Maximum character is 30"),
  designation: z.string().min(2, "Minimum character is 2").max(30, "Maximum character is 30"),
  start: z.string().min(4, "Minimum character is 4").max(20, "Maximum character is 20"),
  end: z.string().min(4, "Minimum character is 4").max(20, "Maximum character is 20"),
  priority: z.number().min(1, "Minimum priority is 1").max(100, "Maximum priority is 100"),
});

function ExperienceModal({ modalType, experienceData, handleExperience, closeModal }: ExperienceModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: experienceData || { company_name: "", designation: "", start: "", end: "", priority:1 },
  });

  useEffect(() => {
    reset(experienceData || { company_name: "", designation: "", start: "", end: "", priority:1 });
  }, [experienceData, reset]);


  const onSubmit = (data: ExperienceFormData) => {
    handleExperience(data, experienceData?.id);
    reset();
    closeModal();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{modalType === "add" ? "Add Experience" : "Edit Experience"}</DialogTitle>
        <DialogDescription/>
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
        <div>
          <Label>Priority</Label>
          <Input type="number" {...register("priority", { valueAsNumber: true })} />
          {errors.priority && <p className="text-red-500">{errors.priority.message}</p>}
        </div>

        <DialogFooter>
          <Button type="submit"className="bg-sky-600 text-white hover:text-white hover:bg-sky-700">
            {modalType === "add" ? "Add Experience" : "Save Changes"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default function Experience() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [modalType, setModalType] = useState<string>("");
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const axiosInstance = useAxios();

  const fetchExperiences = async () => {
    try {
      const response = await axiosInstance.get<Experience[]>("/api/v1/experiences/");
      setExperiences(response.data);
    } catch (error) {
      const err = error as AxiosError;
      if (err.response?.status === 404) {
        setExperiences([]);
        ToastMessage("Experience", err.response?.status || 500);
      } else {
        console.error(err);
        ToastMessage("Experience", err.response?.status || 500);
      }
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const handleExperience = async (data: ExperienceFormData, id?: number) => {
    try {
      const response = id
        ? await axiosInstance.put(`/api/v1/experiences/${id}/`, data)
        : await axiosInstance.post("/api/v1/experiences/", data);

      fetchExperiences();
      ToastMessage("Experience", response.status || 500);
    } catch (error) {
      const err = error as AxiosError;
      console.error(err);
      ToastMessage("Experience", err.response?.status || 500);
    }
  };


  const deleteExperience = async (id: number) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/experiences/${id}/`);
      fetchExperiences();
      ToastMessage("Experience", response.status || 500);
    } catch (error) {
      const err = error as AxiosError;
      console.error(err);
      ToastMessage("Experience", err.response?.status || 500);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setExperiences((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        const updatedItems = newItems.map((item, index) => ({
          id : item.id,
          priority: index + 1
        }));

        axiosInstance
          .patch(`/api/v1/priority/`, {
            object: "Experience",
            data: updatedItems,
          })
          .then((response) => {
            ToastMessage("Experience", response.status || 500);
            fetchExperiences();
          })
          .catch((error) => {
            const err = error as AxiosError;
            console.error(err);
            ToastMessage("Experience", err.response?.status || 500);
            fetchExperiences();
          });

        return newItems;
      });
    }
  };


  return (
    <div className="bg-gray-100 rounded-2xl w-full max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex-1 text-center">Experience</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <button onClick={() => { 
              setModalType("add"); 
              setSelectedExperience(null);
              setIsModalOpen(true); 
            }}>
              <FaCirclePlus className="text-2xl hover:text-sky-600" />
            </button>
          </DialogTrigger>
          <ExperienceModal
            modalType={modalType}
            experienceData={selectedExperience}
            handleExperience={handleExperience}
            closeModal={() => setIsModalOpen(false)}
          />
        </Dialog>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={experiences} strategy={verticalListSortingStrategy}>
        <div className="grid grid-cols-1 gap-6">
            {experiences.map((exp) => (
              <SortableItem key={exp.id} id={exp.id}>
                <div key={exp.id} className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 flex flex-col min-h-[120px]">
                  <div className="flex justify-between content-center">
                    <h2 className="text-xl font-semibold text-gray-700">{exp.designation}</h2>
                    <div className="flex flex-row gap-2">
                      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                          <button 
                            className="text-blue-500 hover:text-blue-700"
                            onClick={() => {
                              setModalType("edit");
                              setSelectedExperience(exp);
                              setIsModalOpen(true);
                            }}
                          >
                            <FaEdit className="text-sky-500 hover:text-sky-600 transition cursor-pointer" size={20} />
                          </button>
                        </DialogTrigger>
                      </Dialog>
                      <button className="text-red-500 hover:text-red-700" onClick={() => deleteExperience(exp.id)}>
                        <MdDelete size={20} />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-xl text-gray-500">{exp.company_name}</h3>
                  <h4 className="text-sm text-gray-400 mt-auto">{exp.start} - {exp.end}</h4>
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
