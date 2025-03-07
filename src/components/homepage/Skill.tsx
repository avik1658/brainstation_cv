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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {useAxios}  from "@/axios";
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
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import { AxiosError } from "axios";
import { ToastMessage } from "@/utils/ToastMessage";

interface SkillFormData {
  skill: string;
  level: number;
  priority: number;
  specialized_cv : number | null;
}

interface Specialized {
  id: number;
  name: string;
}

interface Skill extends SkillFormData {
  id: number;
}

interface SkillModalProps {
  modalType: string;
  skillData?: Skill | null;
  handleSkill: (data: SkillFormData, id?: number) => void;
  getSpecializedName: (id:number) => string;
  closeModal: () => void;
  specialized: Specialized[];
}

const formSchema = z.object({
  skill: z.string().min(1, "Minimum character is 1").max(15, "Maximum character is 15"),
  level: z.number().min(1, "Minimum level is 1").max(10, "Maximum level is 10"),
  priority: z.number().min(1, "Minimum priority is 1").max(100, "Maximum priority is 100"),
  specialized_cv: z.union([z.number(), z.null()]),
});

function SkillModal({ modalType, skillData, handleSkill, getSpecializedName, closeModal, specialized}: SkillModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SkillFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: skillData || { skill: "", level: 1, priority: 1, specialized_cv: null },
  });

  useEffect(() => {
    reset(skillData || { skill: "", level: 1, priority: 1, specialized_cv: null });
  }, [skillData, reset]);

  const onSubmit = (data: SkillFormData) => {
    handleSkill(data, skillData?.id);
    reset();
    closeModal();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{modalType === "add" ? "Add Skill" : "Edit Skill"}</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
        <div>
          <Label>Skill</Label>
          <Input {...register("skill")} />
          {errors.skill && <p className="text-red-500">{errors.skill.message}</p>}
        </div>
        <div>
          <Label>Level</Label>
          <Input type="number" {...register("level", { valueAsNumber: true })} />
          {errors.level && <p className="text-red-500">{errors.level.message}</p>}
        </div>
        <div>
          <Label>Priority</Label>
          <Input type="number" {...register("priority", { valueAsNumber: true })} />
          {errors.priority && <p className="text-red-500">{errors.priority.message}</p>}
        </div>

        <div>
            <Label>Specialization</Label>
            <Select
              onValueChange={(value) => setValue("specialized_cv", value === "null" ? null : Number(value))}
              defaultValue={skillData?.specialized_cv !== null && skillData?.specialized_cv !== undefined 
                ? String(skillData.specialized_cv) 
                : "null"}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    skillData?.specialized_cv != null 
                      ? getSpecializedName(skillData.specialized_cv) 
                      : "Select specialization"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">Default</SelectItem>
                {specialized.map((element) => (
                  <SelectItem key={element.id} value={String(element.id)}>
                    {element.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.specialized_cv && <p className="text-red-500">{errors.specialized_cv.message}</p>}
        </div>

        <DialogFooter>
          <Button type="submit" className="bg-sky-600 text-white hover:text-white hover:bg-sky-700">
            {modalType === "add" ? "Add Skill" : "Save Changes"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default function Skill() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [modalType, setModalType] = useState<string>("");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [specialized, setSpecialized] = useState<Specialized[]>([]);
  const axiosInstance = useAxios();

  const fetchSkills = async () => {
    try {
      const response = await axiosInstance.get<Skill[]>("/api/v1/technical-skills/");
      setSkills(response.data);
    } catch (error) {
      const err = error as AxiosError;
      if (err.response?.status === 404) {
        setSkills([]);
        ToastMessage("Skill", err.response?.status || 500);
      } else {
        console.error(err);
        ToastMessage("Skill", err.response?.status || 500);
      }
    }
  };

  const fetchSpecailized = async () => {
    try {
      const response = await axiosInstance.get<Specialized[]>("/api/v1/specialized-cvs/");
      setSpecialized(response.data);
    } catch (error) {
      const err = error as AxiosError;
      ToastMessage("Specailized", err.response?.status || 500);
    }
  };

  useEffect(() => {
    fetchSkills();
    fetchSpecailized();
  }, []);

  const handleSkill = async (data: SkillFormData, id?: number) => {
    try {
      const response = id
        ? await axiosInstance.put(`/api/v1/technical-skills/${id}/`, data)
        : await axiosInstance.post("/api/v1/technical-skills/", data);
      
      fetchSkills();
      ToastMessage("Skill", response.status || 500);
    } catch (error) {
      const err = error as AxiosError;
      console.error(err);
      ToastMessage("Skill", err.response?.status || 500);
    }
  };

  const deleteSkill = async (id: number) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/technical-skills/${id}/`);
      fetchSkills();
      ToastMessage("Skill", response.status || 500);
    } catch (error) {
      const err = error as AxiosError;
      console.error(err);
      ToastMessage("Skill", err.response?.status || 500);
    }
  };

  const getSpecializedName = (id: number): string => {
    return specialized.find(specialized => specialized.id === id)?.name || "Unknown";
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
      setSkills((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          priority: index + 1
        }));

        console.log(updatedItems)

        Promise.all(
          newItems.map((item, index) =>
            axiosInstance.put(`/api/v1/technical-skills/${item.id}/`, { ...item, priority: index + 1 })
          )
        ).then(fetchSkills);

        return newItems;
      });
    }
  };

  return (
    <div className="p-12 bg-gray-100 rounded-2xl shadow-lg max-w-6xl mx-auto my-5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex-1 text-center">Technical Skills</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <button
              onClick={() => {
                setModalType("add");
                setSelectedSkill(null);
                setIsModalOpen(true);
              }}
            >
              <FaCirclePlus className="text-2xl hover:text-sky-600" />
            </button>
          </DialogTrigger>
          <SkillModal
            modalType={modalType}
            skillData={selectedSkill}
            handleSkill={handleSkill}
            closeModal={() => setIsModalOpen(false)}
            getSpecializedName={getSpecializedName}
            specialized={specialized}
          />
        </Dialog>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={skills} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {skills.map((skill: Skill) => (
              <SortableItem key={skill.id} id={skill.id}>
                <div
                  className="bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-xl transition"
                >
                  <div className="flex justify-between content-center">
                    <p className="text-lg font-normal">{skill.skill}</p>
                    <div className="flex flex-row gap-2 items-center">
                      <p className="text-lg font-normal">{skill.level}/10</p>
                      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                          <button
                            className="text-blue-500 hover:text-blue-700"
                            onClick={() => {
                              setModalType("edit");
                              setSelectedSkill(skill);
                              setIsModalOpen(true);
                            }}
                          >
                            <FaEdit className="text-sky-500 hover:text-sky-600 transition cursor-pointer" size={20} />
                          </button>
                        </DialogTrigger>
                      </Dialog>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => deleteSkill(skill.id)}
                      >
                        <MdDelete size={20} />
                      </button>
                    </div>
                  </div>
                  {skill.specialized_cv !== null ?
                      <p><span className="text-base text-white font-normal bg-blue-600 rounded-lg px-2" >{getSpecializedName(skill.specialized_cv)}</span></p> : 
                      <p><span className="text-base text-white font-normal bg-green-600 rounded-lg px-2" >Default</span></p>
                  }
                  <div className="w-full bg-gray-300 h-4 rounded-full mt-2">
                    <div
                      className="bg-sky-600 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${skill.level * 10}%` }}
                    ></div>
                  </div>
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
