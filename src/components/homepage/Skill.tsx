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

interface SkillFormData {
  skill: string;
  level: number;
  priority: number;
}

interface Skill extends SkillFormData {
  id: number;
}

interface SkillModalProps {
  modalType: string;
  skillData?: Skill | null;
  handleSkill: (data: SkillFormData, id?: number) => void;
  closeModal: () => void;
}

const formSchema = z.object({
  skill: z.string().min(1, "Skill is required"),
  level: z.number().min(1, "Minimum level is 1").max(10, "Maximum level is 10"),
  priority: z.number().min(1, "Minimum priority is 1").max(100, "Maximum priority is 100"),
});

function SkillModal({ modalType, skillData, handleSkill, closeModal }: SkillModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SkillFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: skillData || { skill: "", level: 1, priority: 1 },
  });

  useEffect(() => {
    reset(skillData || { skill: "", level: 1, priority: 1 });
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

  const fetchSkills = async () => {
    try {
      const response = await axiosInstance.get<Skill[]>("/api/v1/technical-skills/");
      setSkills(response.data);
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleSkill = async (data: SkillFormData, id?: number) => {
    try {
      if (id) {
        await axiosInstance.put(`/api/v1/technical-skills/${id}/`, data);
      } else {
        await axiosInstance.post("/api/v1/technical-skills/", data);
      }
      fetchSkills();
    } catch (error) {
      console.error("Error saving skill:", error);
    }
  };

  const deleteSkill = async (id: number) => {
    try {
      await axiosInstance.delete(`/api/v1/technical-skills/${id}/`);
      fetchSkills();
    } catch (error) {
      console.error("Error deleting skill:", error);
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
      setSkills((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update priorities based on new order
        newItems.forEach(async (item, index) => {
          await axiosInstance.put(`/api/v1/technical-skills/${item.id}/`, { ...item, priority: index + 1 });
          await fetchSkills();
        });

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
                            <FaEdit className="text-sky-600" size={20} />
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
