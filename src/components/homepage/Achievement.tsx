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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import { AxiosError } from "axios";
import { ToastMessage } from "@/utils/ToastMessage";
import { toast } from "sonner";

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
  name: z.string().min(3, "Maximum character is 3").max(100, "Maximum character is 100"),
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
          <Input type="number" {...register("priority", { valueAsNumber: true })} />
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
  const axiosInstance = useAxios();

  const fetchAchievements = async () => {
    try {
      const response = await axiosInstance.get<Achievement[]>("/api/v1/achievements/");
      setAchievements(response.data);
    } catch (error) {
      const err = error as AxiosError;
      if (err.response?.status === 404) {
        setAchievements([]);
        ToastMessage("Achievement", err.response?.status || 500);
      } else {
        console.error(err);
        ToastMessage("Achievement", err.response?.status || 500);
      }
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleAchievement = async (data: AchievementFormData, id?: number) => {
    try {
      const response = id
        ? await axiosInstance.put(`/api/v1/achievements/${id}/`, data)
        : await axiosInstance.post("/api/v1/achievements/", data);

      fetchAchievements();
      ToastMessage("Achievement", response.status || 500);
    } catch (error) {
      const err = error as AxiosError;
      console.error(err);
      ToastMessage("Achievement", err.response?.status || 500);
    }
  };


  const deleteAchievement = async (id: number) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/achievements/${id}/`);
      fetchAchievements();
      ToastMessage("Training", response.status || 500);
    } catch (error) {
      const err = error as AxiosError;
      console.error(err);
      ToastMessage("Achievement", err.response?.status || 500);
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
        const oldItems = items;
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        const updatedItems = newItems.map((item, index) => ({
          id : item.id,
          priority: index + 1
        }));

        const isSlowNetwork = (navigator.connection && 'effectiveType' in navigator.connection)
          ? navigator.connection.effectiveType === '2g' || navigator.connection.effectiveType === '3g'
          : false;

        let toastId: number | string;
        if (isSlowNetwork) {
          toastId = toast.loading("Updating achievement, please don't move items...");
        }

        const updatePriority = async() => {
          try {
            const response = await axiosInstance.patch(`/api/v1/priority/`, {
              object: "Achievement",
              data: updatedItems,
            });
            await fetchAchievements();
            toast.dismiss(toastId);
            ToastMessage("Achievement", response.status || 500);
          } catch (error) {
            toast.dismiss(toastId);
            const err = error as AxiosError;
            console.error(err);
            ToastMessage("Achievement", err.response?.status || 500);
            setAchievements(oldItems);
          }
        }

        updatePriority();
        
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
                      <FaEdit className="text-sky-500 hover:text-sky-600 transition cursor-pointer" size={20} />
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
