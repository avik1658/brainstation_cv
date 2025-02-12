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
import { Textarea } from "../ui/textarea";
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


interface ProjectFormData {
  name: string;
  priority: number;
  technology: string;
  responsibility: string;
  link: string;
  duration: string;
  description: string;
}

interface Project extends ProjectFormData {
  id: number;
}

interface ProjectModalProps {
  modalType: string;
  projectData?: Project | null;
  handleProject: (data: ProjectFormData, id?: number) => void;
  closeModal: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  priority: z.number().min(1, "Minimum priority is 1").max(100, "Maximum priority is 100"),
  technology: z.string().min(1, "Technology is required"),
  responsibility: z.string().min(1, "Responsibility is required"),
  link: z.string().url("Invalid URL"),
  duration: z.string().min(1, "Duration is required"),
  description: z.string().min(1, "Description is required"),
});


function ProjectModal({ modalType, projectData, handleProject, closeModal }: ProjectModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: projectData || { name: "", priority: 1, technology: "", responsibility: "", link: "", duration: "", description: "" },
  });

  useEffect(() => {
    reset(projectData || { name: "", priority: 1, technology: "", responsibility: "", link: "", duration: "", description: "" });
  }, [projectData, reset]);

  const onSubmit = (data: ProjectFormData) => {
    handleProject(data, projectData?.id);
    reset();
    closeModal();
  };

  return (
    <DialogContent className="max-w-4xl w-full">
      <DialogHeader>
        <DialogTitle>{modalType === "add" ? "Add Project" : "Edit Project"}</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mt-2 flex flex-col gap-y-4">
            <div>
              <Label>Name</Label>
              <Input {...register("name")} />
              {errors.name && <p className="text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <Label>Priority</Label>
              <Input type="number" {...register("priority", { valueAsNumber: true })} />
              {errors.priority && <p className="text-red-500">{errors.priority.message}</p>}
            </div>
            <div>
              <Label>Technology</Label>
              <Input {...register("technology")} />
              {errors.technology && <p className="text-red-500">{errors.technology.message}</p>}
            </div>
            <div>
              <Label>Responsibility</Label>
              <Textarea {...register("responsibility")} />
              {errors.responsibility && <p className="text-red-500">{errors.responsibility.message}</p>}
            </div>
          </div>
          <div className="mt-2 flex flex-col gap-y-4">
            <div>
              <Label>Link</Label>
              <Input {...register("link")} />
              {errors.link && <p className="text-red-500">{errors.link.message}</p>}
            </div>
            <div>
              <Label>Duration</Label>
              <Input {...register("duration")} />
              {errors.duration && <p className="text-red-500">{errors.duration.message}</p>}
            </div>
            <div>
              <Label>Description</Label>
              <Textarea {...register("description")} />
              {errors.description && <p className="text-red-500">{errors.description.message}</p>}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="submit" className="bg-sky-600 text-white hover:text-white hover:bg-sky-700">
            {modalType === "add" ? "Add Project" : "Save Changes"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default function Project() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [modalType, setModalType] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      const response = await axiosInstance.get<Project[]>("/api/v1/projects/");
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProject = async (data: ProjectFormData, id?: number) => {
    try {
      if (id) {
        await axiosInstance.put(`/api/v1/projects/${id}/`, data);
      } else {
        await axiosInstance.post("/api/v1/projects/", data);
      }
      fetchProjects();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const deleteProject = async (id: number) => {
    try {
      await axiosInstance.delete(`/api/v1/projects/${id}/`);
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
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
      setProjects((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update priorities based on new order
        newItems.forEach(async (item, index) => {
          await axiosInstance.put(`/api/v1/projects/${item.id}/`, { ...item, priority: index + 1 });
          await fetchProjects();
        });

        return newItems;
      });
    }
  };


  return (
    <div className="p-12 bg-gray-100 rounded-2xl shadow-lg max-w-6xl mx-auto my-5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex-1 text-center">Projects</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <button
              onClick={() => {
                setModalType("add");
                setSelectedProject(null);
                setIsModalOpen(true);
              }}
            >
              <FaCirclePlus className="text-2xl hover:text-sky-600" />
            </button>
          </DialogTrigger>
          <ProjectModal
            modalType={modalType}
            projectData={selectedProject}
            handleProject={handleProject}
            closeModal={() => setIsModalOpen(false)}
          />
        </Dialog>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={projects} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project: Project) => (
                <SortableItem key={project.id} id={project.id}>
                <div key={project.id} className="flex flex-col gap-2 h-[600px] overflow-hidden bg-white p-6 border-l-4 border-red-500 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                    <div className="flex justify-between content-center">
                    <h2 className="text-xl font-semibold text-gray-700">{project.name}</h2>
                    <div className="flex flex-row gap-2">
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <button
                            className="text-blue-500 hover:text-blue-700"
                            onClick={() => {
                                setModalType("edit");
                                setSelectedProject(project);
                                setIsModalOpen(true);
                            }}
                            >
                            <FaEdit className="text-sky-600" size={20} />
                            </button>
                        </DialogTrigger>
                        </Dialog>
                        <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => deleteProject(project.id)}
                        >
                        <MdDelete size={20} />
                        </button>
                    </div>
                    </div>
                    <p className="text-gray-600 font-medium mt-2">
                    <span className="font-bold text-gray-800">Tech Stack : </span> {project.technology}
                    </p>
                    <p className="text-gray-600 font-medium">
                    <span className="font-bold text-gray-800">Responsibilities : </span> {project.responsibility}
                    </p>
                    <p className="text-gray-600 font-medium">
                      <span className="font-bold text-gray-800">Link : </span>
                      <a href={project.link} className="text-blue-600 hover:underline" target="_blank">
                        {project.link}
                      </a>
                    </p>
                    <p className="text-gray-600 font-medium">
                    <span className="font-bold text-gray-800">Duration : </span> {project.duration}
                    </p>
                    <p className="text-gray-700 mt-3 leading-relaxed">{project.description}</p>
                </div>
                </SortableItem>
                ))}
            </div>
           </SortableContext>
       </DndContext>
    </div>
  );
}
