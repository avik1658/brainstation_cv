import { useEffect, useState } from "react";
import axiosInstance from "@/axios";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FaCirclePlus } from "react-icons/fa6";
import { Button } from "../ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
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


interface EducationFormData {
  passing_year: number;
  priority: number;
  degree: number;
  university: number;
  department: number;
}

interface Education extends EducationFormData {
  id: number;
}

interface EducationModalProps {
  modalType: string;
  educationData?: Education | null;
  handleEducation: (data: EducationFormData, id?: number) => void;
  getDegreeName: (id:number) => string;
  getDepartmentName: (id:number) => string;
  getUniversityName: (id:number) => string;
  closeModal: () => void;
  degrees: Degree[];
  departments: Department[];
  universities: University[];
}

const formSchema = z.object({
  passing_year: z.number().min(1950, "Minimum passing year is 1950").max(2100, "Maximum passing year is 2100"),
  priority: z.number().min(1, "Minimum priority is 1").max(100, "Maximum priority is 100"),
  degree: z.number().min(1, "Please select a degree"),
  university: z.number().min(1, "Please select a university"),
  department: z.number().min(1, "Please select a department")
});

interface Degree {
  id: number;
  name: string;
  full_form: string;
}

interface University {
  id: number;
  name: string;
  type: string;
  acronyms: string;
}

interface Department {
  id: number;
  name: string;
  full_form: string;
}

function EducationModal({
  modalType,
  educationData,
  handleEducation,
  getDegreeName,
  getDepartmentName,
  getUniversityName,
  closeModal,
  degrees,
  departments,
  universities
}: EducationModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EducationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: educationData || educationData || { passing_year: 0, priority: 1, degree: 0, university: 0, department: 0 },
  });

  useEffect(() => {
    reset(educationData || { passing_year: 0, priority: 1, degree: 0, university: 0, department: 0 });
  }, [educationData, reset]);

  const onSubmit = (data: EducationFormData) => {
    handleEducation(data, educationData?.id);
    reset();
    closeModal();
  };


 return (
    <DialogContent className="max-w-xl ">
      <DialogHeader>
        <DialogTitle>{modalType === "add" ? "Add Education" : "Edit Education"}</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-2 flex flex-col gap-y-4">
          <div>
            <Label>Degree</Label>
            <Select
              onValueChange={(value) => setValue("degree", Number(value))}
              defaultValue={educationData ? String(educationData.degree) : ""}
            >
              <SelectTrigger>
                <SelectValue placeholder={educationData ? getDegreeName(educationData.degree) : "Select degree"} />
              </SelectTrigger>
              <SelectContent>
                {degrees.map((degree) => (
                  <SelectItem key={degree.id} value={String(degree.id)}>
                    {degree.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.degree && <p className="text-red-500">{errors.degree.message}</p>}
          </div>
          <div>
            <Label>Department</Label>
            <Select
              onValueChange={(value) => setValue("department", Number(value))}
              defaultValue={educationData ? String(educationData.department) : ""}
            >
              <SelectTrigger>
                <SelectValue placeholder={educationData ? getDepartmentName(educationData.department) : "Select department"} />
              </SelectTrigger>
              <SelectContent>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={String(department.id)}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.department && <p className="text-red-500">{errors.department.message}</p>}
          </div>
          <div>
            <Label>Passing Year</Label>
            <Input type="number" {...register("passing_year",{ valueAsNumber: true })} />
            {errors.passing_year && <p className="text-red-500">{errors.passing_year.message}</p>}
          </div>
          <div>
            <Label>University/Institute</Label>
            <Select
              onValueChange={(value) => setValue("university", Number(value))}
              defaultValue={educationData ? String(educationData.university) : ""}
            >
              <SelectTrigger>
                <SelectValue placeholder={educationData ? getUniversityName(educationData.university) : "Select university"} />
              </SelectTrigger>
              <SelectContent>
                {universities.map((university) => (
                  <SelectItem key={university.id} value={String(university.id)}>
                    {university.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.university && <p className="text-red-500">{errors.university.message}</p>}
          </div>
          <div>
            <Label>Priority</Label>
            <Input type="number" {...register("priority",{ valueAsNumber: true })} />
            {errors.priority && <p className="text-red-500">{errors.priority.message}</p>}
          </div>
        </div>
        <div className="mt-4">
          <DialogFooter>
            <Button type="submit" className="bg-sky-600 text-white hover:text-white hover:bg-sky-700">{modalType === "add" ? "Add Education" : "Save Changes"}</Button>
          </DialogFooter>
        </div>
      </form>
    </DialogContent>
  );
}


export default function Education() {
  const [educations, setEducations] = useState<Education[]>([]);
  const [modalType, setModalType] = useState<string>("");
  const [selectedEducation, setSelectedEducation] = useState<Education | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);


  const fetchEducation = async () => {
    try {
      const response = await axiosInstance.get<Education[]>("/api/v1/educations/");
      setEducations(response.data);
    } catch (error) {
      console.error("Error fetching education:", error);
    }
  };

  const fetchDegree = async () => {
    try {
      const response = await axiosInstance.get<Degree[]>("/api/v1/degrees/");
      setDegrees(response.data);
    } catch (error) {
      console.error("Error fetching degrees", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axiosInstance.get<Department[]>("/api/v1/departments/");
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments", error);
    }
  };

  const fetchUniversities = async () => {
    try {
      const response = await axiosInstance.get<University[]>("/api/v1/universities/");
      setUniversities(response.data);
    } catch (error) {
      console.error("Error fetching universities", error);
    }
  };

  useEffect(() => {
    fetchEducation()
    fetchDegree()
    fetchDepartments()
    fetchUniversities()
  }, []);

  const handleEducation = async (data: EducationFormData, id?: number) => {
    try {
      if (id) {
        await axiosInstance.put(`/api/v1/educations/${id}/`, data);
      } else {
        await axiosInstance.post("/api/v1/educations/", data);
      }
      fetchEducation();
    } catch (error) {
      console.error("Error saving education", error);
    }
  };

  const deleteEducation = async (id: number) => {
    try {
      await axiosInstance.delete(`/api/v1/educations/${id}/`);
      fetchEducation();
    } catch (error) {
      console.error("Error deleting education", error);
    }
  };


  const getDegreeName = (id: number): string => {
    return degrees.find(degree => degree.id === id)?.name || "Unknown";
  };

  const getDepartmentName = (id: number): string => {
    return departments.find(dep => dep.id === id)?.name || "Unknown";
  };

  const getUniversityName = (id: number): string => {
    return universities.find(uni => uni.id === id)?.name || "Unknown";
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
      setEducations((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update priorities based on new order
        newItems.forEach(async (item, index) => {
          await axiosInstance.put(`/api/v1/educations/${item.id}/`, { ...item, priority: index + 1 });
          await fetchEducation();
        });

        return newItems;
      });
    }
  };



  return (
    <div className="bg-gray-100 rounded-2xl w-full max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex-1 text-center">Education</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <button onClick={() => { setModalType("add"); setSelectedEducation(null); setIsModalOpen(true); }}>
              <FaCirclePlus className="text-2xl hover:text-sky-600" />
            </button>
          </DialogTrigger>
            <EducationModal
            modalType={modalType}
            educationData={selectedEducation}
            handleEducation={handleEducation}
            getDegreeName = {getDegreeName}
            getDepartmentName = {getDepartmentName}
            getUniversityName = {getUniversityName}
            closeModal={() => setIsModalOpen(false)}
            degrees={degrees}
            departments={departments}
            universities={universities}
            />
        </Dialog>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
         <SortableContext items={educations} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 gap-6">
              {educations.map((edu, index) => (
                <SortableItem key={edu.id} id={edu.id}>
                  <div key={index} className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 flex flex-col min-h-[120px]">
                    <div className="flex justify-between content-center">
                      <h2 className="text-xl font-semibold text-gray-700">
                        {getDegreeName(edu.degree)} in {getDepartmentName(edu.department)}
                      </h2>
                      <div className="flex flex-row gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              className="text-blue-500 hover:text-blue-700"
                              onClick={() => {
                                setModalType("edit");
                                setSelectedEducation(edu);
                                setIsModalOpen(true);
                              }}
                            >
                              <FaEdit className="text-sky-600" size={20} />
                            </button>
                          </DialogTrigger>
                        </Dialog>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteEducation(edu.id)}
                        >
                          <MdDelete size={20} />
                        </button>
                      </div>
                    </div>
                    <h1 className="text-sm text-gray-400 mt-auto">{edu.passing_year}</h1>
                    <h1 className="text-lg text-gray-500">{getUniversityName(edu.university)}</h1>
                  </div>
                  </SortableItem>
                ))}
              </div> 
              </SortableContext>
         </DndContext>            
    </div>
  );
}