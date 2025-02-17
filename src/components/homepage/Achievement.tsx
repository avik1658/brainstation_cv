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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";

interface AchievementFormData {
  name: string;
  priority: number;
}

interface Achievement extends AchievementFormData {
  id: number;
}

interface AchievementModalProps {
  modalType: string;
  achievementData?: Achievement | null;
  handleAchievement: (data: AchievementFormData, id?: number) => void;
  closeModal: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Achievement name is required"),
  priority: z.number().min(1, "Minimum priority is 1").max(100, "Maximum priority is 100"),
});

function AchievementModal({ modalType, achievementData, handleAchievement, closeModal }: AchievementModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AchievementFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: achievementData || { name: "", priority: 1 },
  });

  useEffect(() => {
    reset(achievementData || { name: "", priority: 1 });
  }, [achievementData, reset]);

  const onSubmit = (data: AchievementFormData) => {
    handleAchievement(data, achievementData?.id);
    reset();
    closeModal();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{modalType === "add" ? "Add Achievement" : "Edit Achievement"}</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-2 flex flex-col gap-y-4">
        <div>
          <Label>Achievement</Label>
          <Input {...register("name")} />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <Label>Priority</Label>
          <Input {...register("priority", { valueAsNumber: true })} />
          {errors.priority && <p className="text-red-500">{errors.priority.message}</p>}
        </div>
        <DialogFooter>
          <Button type="submit" className="bg-sky-600 text-white hover:text-white hover:bg-sky-700">
            {modalType === "add" ? "Add Achievement" : "Save Changes"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default function Achievement() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [modalType, setModalType] = useState<string>("");
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAchievements = async () => {
    try {
      const response = await axiosInstance.get<Achievement[]>("/api/v1/achievements/");
      setAchievements(response.data);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleAchievement = async (data: AchievementFormData, id?: number) => {
    try {
      if (id) {
        await axiosInstance.put(`/api/v1/achievements/${id}/`, data);
      } else {
        await axiosInstance.post("/api/v1/achievements/", data);
      }
      fetchAchievements();
    } catch (error) {
      console.error("Error saving achievement:", error);
    }
  };

  const deleteAchievement = async (id: number) => {
    try {
      await axiosInstance.delete(`/api/v1/achievements/${id}/`);
      fetchAchievements();
    } catch (error) {
      console.error("Error deleting achievement:", error);
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
      setAchievements((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        Promise.all(
          newItems.map((item, index) =>
            axiosInstance.put(`/api/v1/achievements/${item.id}/`, { ...item, priority: index + 1 })
          )
        ).then(fetchAchievements);

        return newItems;
      });
    }
  };

  return (
    <div className="bg-gray-100 rounded-2xl w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex-1 text-center">Achievement</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <button
              onClick={() => {
                setModalType("add");
                setSelectedAchievement(null);
                setIsModalOpen(true);
              }}
            >
              <FaCirclePlus className="text-2xl hover:text-sky-600" />
            </button>
          </DialogTrigger>
          <AchievementModal
            modalType={modalType}
            achievementData={selectedAchievement}
            handleAchievement={handleAchievement}
            closeModal={() => setIsModalOpen(false)}
          />
        </Dialog>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={achievements} strategy={verticalListSortingStrategy}>
          <ul className="list-disc text-lg text-gray-700 space-y-3">
            {achievements.map((achievement) => (
              <SortableItem key={achievement.id} id={achievement.id}>
                <div
                  className="flex items-center justify-between gap-x-3 font-semibold pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-gray-700 border-2 rounded-lg p-2 shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <h2 className="text-base font-normal text-gray-700">{achievement.name}</h2>
                  <div className="flex items-center gap-x-4">
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => {
                        setModalType("edit");
                        setSelectedAchievement(achievement);
                        setIsModalOpen(true);
                      }}
                    >
                      <FaEdit className="text-sky-600" size={20} />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteAchievement(achievement.id)}
                    >
                      <MdDelete size={20} />
                    </button>
                  </div>
                </div>
              </SortableItem>
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
