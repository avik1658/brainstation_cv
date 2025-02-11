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


interface TrainingFormData {
  name: string;
  priority: number;
}

interface Training extends TrainingFormData {
  id: number;
}

interface TrainingModalProps {
  modalType: string;
  trainingData?: Training | null;
  handleTraining: (data: TrainingFormData, id?: number) => void;
  closeModal: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Training name is required"),
  priority: z.number().min(1, "Minimum priority is 1").max(100, "Maximum priority is 100"),
});

function TrainingModal({ modalType, trainingData, handleTraining, closeModal }: TrainingModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TrainingFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: trainingData || { name: "", priority: 1 },
  });

  useEffect(() => {
    reset(trainingData || { name: "", priority: 1 });
  }, [trainingData, reset]);

  const onSubmit = (data: TrainingFormData) => {
    handleTraining(data, trainingData?.id);
    reset();
    closeModal();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{modalType === "add" ? "Add Training" : "Edit Training"}</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-2 flex flex-col gap-y-4">
        <div>
          <Label>Training</Label>
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
            {modalType === "add" ? "Add Training" : "Save Changes"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default function Training() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [modalType, setModalType] = useState<string>("");
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const fetchTrainings = async () => {
    try {
      const response = await axiosInstance.get<Training[]>("/api/v1/trainings/");
      setTrainings(response.data);
    } catch (error) {
      console.error("Error fetching trainings:", error);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleTraining = async (data: TrainingFormData, id?: number) => {
    try {
      if (id) {
        await axiosInstance.put(`/api/v1/trainings/${id}/`, data);
      } else {
        await axiosInstance.post("/api/v1/trainings/", data);
      }
      fetchTrainings();
    } catch (error) {
      console.error("Error saving training:", error);
    }
  };

  const deleteTraining = async (id: number) => {
    try {
      await axiosInstance.delete(`/api/v1/trainings/${id}/`);
      fetchTrainings();
    } catch (error) {
      console.error("Error deleting training:", error);
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
      setTrainings((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update priorities based on new order
        newItems.forEach(async (item, index) => {
          console.log("Drag and drop event")
          await axiosInstance.put(`/api/v1/trainings/${item.id}/`, { ...item, priority: index + 1 });
          await fetchTrainings();
        });

        return newItems;
      });
    }
  };

  return (
    <div className="bg-gray-100 rounded-2xl w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex-1 text-center">Training</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <button
              onClick={() => {
                setModalType("add");
                setSelectedTraining(null);
                setIsModalOpen(true);
              }}
            >
              <FaCirclePlus className="text-2xl hover:text-sky-600" />
            </button>
          </DialogTrigger>
          <TrainingModal
            modalType={modalType}
            trainingData={selectedTraining}
            handleTraining={handleTraining}
            closeModal={() => setIsModalOpen(false)}
          />
        </Dialog>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={trainings} strategy={verticalListSortingStrategy}>
          <ul className="list-disc text-lg text-gray-700 space-y-3">
            {trainings.map((training) => (
              <SortableItem key={training.id} id={training.id}>
                <div
                  className="flex items-center justify-between gap-x-3 font-semibold pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-gray-700 border-2 rounded-lg p-2 shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <h2 className="text-base font-normal text-gray-700">{training.name}</h2>
                  <div className="flex items-center gap-x-4">
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => {
                        setModalType("edit");
                        setSelectedTraining(training);
                        setIsModalOpen(true);
                      }}
                    >
                      <FaEdit className="text-sky-600" size={20} />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteTraining(training.id)}
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