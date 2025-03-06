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
import { Textarea } from "../ui/textarea";
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


interface ProjectFormData {
  name: string;
  priority: number;
  technology: string;
  responsibility: string;
  link: string;
  duration: string;
  description: string;
  specialized_cv : number | null;
}

interface Specialized {
  id: number;
  name: string;
}


interface Project extends ProjectFormData {
  id: number;
}

interface ProjectModalProps {
  modalType: string;
  projectData?: Project | null;
  handleProject: (data: ProjectFormData, id?: number) => void;
  getSpecializedName: (id:number) => string;
  closeModal: () => void;
  specialized: Specialized[];
}

const formSchema = z.object({
  name: z.string().min(3, "Minimum character is 3").max(50, "Maximum character is 50"),
  priority: z.number().min(1, "Minimum priority is 1").max(100, "Maximum priority is 100"),
  technology: z.string().min(3, "Minimum character is 3").max(100, "Maximum character is 100"),
  responsibility: z.string().min(10, "Minimum character is 10").max(250, "Maximum character is 250"),
  link: z.string().url("Invalid URL"),
  duration: z.string().min(4, "Minimum character is 4").max(20, "Maximum character is 20"),
  description: z.string().min(50, "Minimum character is 50").max(1000, "Maximum character is 1000"),
  specialized_cv: z.union([z.number(), z.null()]),
});


function ProjectModal({ modalType, projectData, handleProject, getSpecializedName, closeModal, specialized}: ProjectModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: projectData || { name: "", priority: 1, technology: "", responsibility: "", link: "", duration: "", description: "",specialized_cv: null },
  });

  useEffect(() => {
    reset(projectData || { name: "", priority: 1, technology: "", responsibility: "", link: "", duration: "", description: "",specialized_cv: null });
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
            <div>
              <Label>Specialization</Label>
              <Select
                onValueChange={(value) => setValue("specialized_cv", value === "null" ? null : Number(value))}
                defaultValue={projectData?.specialized_cv !== null && projectData?.specialized_cv !== undefined 
                  ? String(projectData.specialized_cv) 
                  : "null"}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      projectData?.specialized_cv != null 
                        ? getSpecializedName(projectData.specialized_cv) 
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
  const [specialized, setSpecialized] = useState<Specialized[]>([]);
  const axiosInstance = useAxios();
  
  const fetchProjects = async () => {
    try {
      const response = await axiosInstance.get<Project[]>("/api/v1/projects/");
      setProjects(response.data);
    } catch (error) {
      const err = error as AxiosError;
      if (err.response?.status === 404) {
        setProjects([]);
        ToastMessage("Project", err.response?.status || 500);
      } else {
        console.error(err);
        ToastMessage("Project", err.response?.status || 500);
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
    fetchProjects();
    fetchSpecailized();
  }, []);

  const handleProject = async (data: ProjectFormData, id?: number) => {
    try {
      const response = id
        ? await axiosInstance.put(`/api/v1/projects/${id}/`, data)
        : await axiosInstance.post("/api/v1/projects/", data);

      fetchProjects();
      ToastMessage("Project", response.status || 500);
    } catch (error) {
      const err = error as AxiosError;
      console.error(err);
      ToastMessage("Project", err.response?.status || 500);
    }
  };


  const deleteProject = async (id: number) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/projects/${id}/`);
      fetchProjects();
      ToastMessage("Project", response.status || 500);
    } catch (error) {
      const err = error as AxiosError;
      console.error(err);
      ToastMessage("Project", err.response?.status || 500);
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
      setProjects((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        Promise.all(
          newItems.map((item, index) =>
            axiosInstance.put(`/api/v1/projects/${item.id}/`, { ...item, priority: index + 1 })
          )
        ).then(fetchProjects);

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
            getSpecializedName={getSpecializedName}
            specialized={specialized}
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
                                    <FaEdit className="text-sky-500 hover:text-sky-600 transition cursor-pointer" size={20} />
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
                      
                      {project.specialized_cv !== null ?
                          <p><span className="text-base text-white font-normal bg-blue-600 rounded-lg px-2" >{getSpecializedName(project.specialized_cv)}</span></p> : 
                          <p><span className="text-base text-white font-normal bg-green-600 rounded-lg px-2" >Default</span></p>
                      }

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
