import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { url, useAxios}  from "@/axios";
import { FaEdit } from "react-icons/fa";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { AxiosError } from "axios";
import { ToastMessage } from "@/utils/ToastMessage";


interface Profile {
  name: string;
  designation: number;
  sub_project: number;
  biography: string;
  tags: string[];
}

interface Designation {
  id: number;
  name: string;
}

interface Sbu {
  id: number;
  name: string;
  sub_head_email: string;
}

interface ProfileModalProps {
  profileData?: Profile | null;
  updateProfile: (data: Profile) => void;
  closeModal: () => void;
  getDesignationName: (id: number) => string;
  getSbuName: (id: number) => string;
  designation: Designation[];
  sbu: Sbu[];
}

const formSchema = z.object({
  name: z.string().min(6, "Minimum 6 letters required").max(60, "Maximum 60 letters"),
  designation: z.number().min(1, "Please select a designation"),
  sub_project: z.number().min(1, "Please select an SBU"),
  biography: z.string().min(6, "Minimum 6 letters required").max(1000, "Maximum 1000 letters"),
  tags: z.array(z.string()).optional()
});

function ProfileModal({ profileData, updateProfile, closeModal, getDesignationName, getSbuName, designation, sbu }: ProfileModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors },
    watch,
  } = useForm<Profile>({
    resolver: zodResolver(formSchema),
    defaultValues: profileData || {
      name: "",
      designation: 0,
      sub_project: 0,
      biography: "",
    },
  });

  useEffect(() => {
    reset(profileData || {
      name: "",
      designation: 0,
      sub_project: 0,
      biography: "",
    });
    setTags(profileData?.tags || []);  // Setting tag value
  }, [profileData, reset]);

  useEffect(() => {
    setTags(profileData?.tags || []);
  }, [closeModal]);

  const [openDesignation, setOpenDesignation] = useState(false);
  const [openSbu, setOpenSbu] = useState(false);

  const handleSelectDesignation = (designationId: number) => {
    setValue("designation", designationId);
    trigger("designation"); 
    setOpenDesignation(false);
  };

  const handleSelectSbu = (sbuId: number) => {
    setValue("sub_project", sbuId);
    trigger("sub_project"); 
    setOpenSbu(false);
  };

  const selectedDesignation = watch("designation");
  const selectedSbu = watch("sub_project");



  const [tags, setTags] = useState<string[]>(profileData?.tags || []);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const addTag = () => {
    const value = tagInputRef.current?.value.trim();
    if (value && !tags.includes(value)) {
      setTags((prevTags) => [...prevTags, value]);
      if (tagInputRef.current) tagInputRef.current.value = ""; // Clear input without triggering state change
    }
  };


  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const onSubmit = (data: Profile) => {
    updateProfile({ ...data, tags });
    reset();
    closeModal();
  };

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label>Name</Label>
          <Input type="text" {...register("name")} />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Designation</label>
          <Popover open={openDesignation} onOpenChange={setOpenDesignation}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="font-normal w-full justify-between">
                {selectedDesignation ? getDesignationName(selectedDesignation) : "Select designation"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="align-start w-96 p-0" onWheel={(e) => e.stopPropagation()} >
              <Command>
                <CommandInput placeholder="Search designation..." />
                <CommandList className="max-h-48">
                  {designation.map((des) => (
                    <CommandItem
                      key={des.id}
                      onSelect={() => handleSelectDesignation(des.id)}
                    >
                      {des.name}
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.designation && <p className="text-red-500">{errors.designation.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Sbu</label>
          <Popover open={openSbu} onOpenChange={setOpenSbu}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="font-normal w-full justify-between">
                {selectedSbu ? getSbuName(selectedSbu) : "Select sbu"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="align-start w-96 p-0" onWheel={(e) => e.stopPropagation()} >
              <Command>
                <CommandInput placeholder="Search sbu..." />
                <CommandList className="max-h-48">
                  {sbu.map((sb) => (
                    <CommandItem
                      key={sb.id}
                      onSelect={() => handleSelectSbu(sb.id)}
                    >
                      {sb.name}
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.sub_project && <p className="text-red-500">{errors.sub_project.message}</p>}
        </div>

        <div className="mt-2">
          <Label>Biography</Label>
          <Textarea {...register("biography")} />
          {errors.biography && <p className="text-red-500">{errors.biography.message}</p>}
        </div>

        <div className="mt-2">
          <Label>Enthusiast At</Label>
          <div className="flex flex-wrap gap-2 mb-2 max-h-24 overflow-auto">
            {tags.map((tag, index) => (
              <span key={index} className="bg-sky-500 px-2 text-white text-base text-center rounded-lg flex items-center">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-black">
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input type="text" ref={tagInputRef} />
            <Button type="button" onClick={addTag} className="bg-sky-600 text-white hover:bg-sky-700">
              Add
            </Button>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button type="submit" className="bg-sky-600 text-white hover:bg-sky-700">
            Update Profile
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

interface ProfilePicModalProps {
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onUpload: () => void
}

function ProfilePicModal({ onFileChange, onUpload }: ProfilePicModalProps) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Change Profile Pic</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <Label htmlFor="picture">Picture</Label>
      <Input id="picture" type="file" onChange={onFileChange} />
      <DialogFooter>
        <Button onClick={onUpload} className="bg-sky-600 text-white hover:text-white hover:bg-sky-700">Update Profile Picture</Button>
      </DialogFooter>
    </DialogContent>
  );
}



export default function Biography() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [designation, setDesignation] = useState<Designation[]>([]);
  const [sbu, setSbu] = useState<Sbu[]>([]);
  const [profilePicture, setProfilePicture] = useState<string>("/images/profile.png");
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
  const [isProfilePicModalOpen, setIsProfilePicModalOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const axiosInstance = useAxios();

  const fetchEmployee = async () => {
    try {
      const response = await axiosInstance.get<Profile>("/api/v1/employees/");
      setProfile(response.data);
    } catch (error) {
      const err = error as AxiosError;
      ToastMessage("Employee", err.response?.status || 500);
    }
  };

  const fetchProfilePicture = async () => {
    try {
      const response = await axiosInstance.get<{ profile_picture: string }>("/api/v1/employee/profile-picture/");
      if (response.data.profile_picture) {
        setProfilePicture(response.data.profile_picture);
      }
    } catch (error) {
      const err = error as AxiosError;
      ToastMessage("Profile Pic", err.response?.status || 500);
    }
  };

  const fetchDesignation = async () => {
    try {
      const response = await axiosInstance.get<Designation[]>(`/api/v1/designations/`);
      setDesignation(response.data);
    } catch (error) {
      const err = error as AxiosError;
      ToastMessage("Designation", err.response?.status || 500);
    }
  };

  const fetchSbu = async () => {
    try {
      const response = await axiosInstance.get<Sbu[]>(`/api/v1/sbu-projects/`);
      setSbu(response.data);
    } catch (error) {
      const err = error as AxiosError;
      ToastMessage("Sbu", err.response?.status || 500);
    }
  };

  useEffect(() => {
    fetchEmployee();
    fetchProfilePicture();
    fetchDesignation();
    fetchSbu();
  }, []);

  const getDesignationName = (id: number): string => {
    return designation.find(designation => designation.id === id)?.name || "Unknown";
  };

  const getSbuName = (id: number): string => {
    return sbu.find(sbu => sbu.id === id)?.name || "Unknown";
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setNewProfilePicture(event.target.files[0]);
    }
  };

  const updateProfilePicture = async () => {
    if (!newProfilePicture) return;

    const formData = new FormData();
    formData.append("profile_picture", newProfilePicture);

    try {
      const response = await axiosInstance.patch("/api/v1/employee/profile-picture/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setProfilePicture(response.data.profile_picture);
      setIsProfilePicModalOpen(false);
      ToastMessage("Profile Pic", response.status || 500);
    } catch (error) {
      const err = error as AxiosError;
      ToastMessage("Profile Pic", err.response?.status || 500);
    }
  };
  
  const updateProfile = async (data: Profile) => {
    try{
      const response = await axiosInstance.patch("/api/v1/employees/", data);
      fetchEmployee();
      ToastMessage("Profile", response.status || 500);
    } catch (error) {
      const err = error as AxiosError;
      ToastMessage("Profile", err.response?.status || 500);
    }
  };

  return (
    <div className="flex flex-col md:flex-row p-12 bg-gray-100 rounded-2xl shadow-lg max-w-6xl mx-auto my-5 gap-4">
      <div className="mr-10 w-full md:w-1/3 flex flex-col items-center">
        <Dialog open={isProfilePicModalOpen} onOpenChange={setIsProfilePicModalOpen}>
          <DialogTrigger asChild>
            <img
              src={`${url}/${profilePicture}`}
              alt="profile"
              className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-md cursor-pointer hover:brightness-50 transition"
            />
          </DialogTrigger>
          <ProfilePicModal onFileChange={handleProfilePictureChange} onUpload={updateProfilePicture} />
        </Dialog>
        {profile ? (
          <>
            <h1 className="text-2xl text-center font-bold mt-4 text-gray-900">{profile.name}</h1>
            <p className="text-base text-center font-normal">Designation : <span className="text-base font-normal text-gray-700 mr-2">{getDesignationName(profile.designation)}</span></p>
            <p className="text-base text-center font-normal">SBU : <span className="text-base font-normal text-gray-700 mr-2">{getSbuName(profile.sub_project)}</span></p>
            <div className="flex flex-wrap flex-row justify-center gap-2 mt-2">
              {profile.tags.map((tag,index)=>{
                return <span key={index} className="text-white text-base text-center font-normal bg-sky-500 rounded-xl px-2">{tag}</span>
              })}
            </div>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <div className="w-full md:w-2/3 bg-white p-8 rounded-lg shadow-md">
        <div className="text-right">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <button onClick={() => { setIsModalOpen(true) }}>
                <FaEdit className="text-sky-500 hover:text-sky-600 transition cursor-pointer" size={20}/>
              </button>
            </DialogTrigger>
            <ProfileModal
              profileData={profile}
              updateProfile={updateProfile}
              closeModal={() => setIsModalOpen(false)}
              getDesignationName={getDesignationName}
              getSbuName={getSbuName}
              designation={designation}
              sbu={sbu}
            />
          </Dialog>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Biography</h1>
        <p className="text-xl text-gray-700 mt-4 leading-relaxed">{profile?.biography || "No biography available."}</p>
      </div>
    </div>
  );
}