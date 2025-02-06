import { training as trainingData } from "./dummyData";
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

// dnd-kit imports
import { DndContext, DragEndEvent, useSensor, PointerSensor } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

function SortableItem(props: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {props.children}
    </div>
  );
}

function TrainingModal({ modalType, trainingItem }: { modalType: string, trainingItem: string }) {
  console.log(`The training modal type is ${modalType}`)
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{modalType === "add" ? "Add Training" : "Edit Training"}</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <div className="mt-2 flex flex-col gap-y-4">
        <div>
          <Label>Training</Label>
          <Input defaultValue={trainingItem} />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">
          {modalType === "add" ? "Add Training" : "Save Changes"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default function Training() {
  const [modalType, setModalType] = useState("");
  const [training, setTraining] = useState(trainingData);
  const [activeTrainingItem, setActiveTrainingItem] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sensors = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = training.findIndex((item) => item === active.id);
      const newIndex = training.findIndex((item) => item === over?.id);
      const newTrainingList = arrayMove(training, oldIndex, newIndex);
      setTraining(newTrainingList);
    }
  };

  const openDialog = (type: string, item: string) => {
    setModalType(type);
    setActiveTrainingItem(item);
    setIsDialogOpen(true);
  };

  console.log(training);

  return (
    <div className="bg-gray-100 rounded-2xl w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex-1 text-center">Training</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button onClick={() => openDialog("add", "")}>
              <FaCirclePlus className="text-2xl hover:text-sky-600" />
            </button>
          </DialogTrigger>
          <TrainingModal modalType={modalType} trainingItem={activeTrainingItem} />
        </Dialog>
      </div>
      <DndContext sensors={[sensors]} onDragEnd={handleDragEnd}>
        <SortableContext items={training} strategy={verticalListSortingStrategy}>
          <ul className="list-disc text-lg text-gray-700 space-y-3">
            {training.map((element) => (
              <SortableItem key={element} id={element}>
                <div className="flex items-center justify-between gap-x-3 font-semibold pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-gray-700 border-2 rounded-lg p-2 shadow-md hover:shadow-xl transition-all duration-300">
                  <h2 className="text-base font-normal text-gray-700">{element}</h2>

                  <div className="flex items-center gap-x-4">
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => openDialog("edit", element)}
                    >
                      <FaEdit className="text-sky-600" size={20} />
                    </button>
                    <button className="text-red-500 hover:text-red-700">
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