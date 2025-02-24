import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {useAxios}  from "@/axios";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


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
    formState: { errors },
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

        <div className="mt-2">
          <Label>Designation</Label>
          <Select onValueChange={(value) => setValue("designation", Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder={profileData ? getDesignationName(profileData.designation) : "Select Designation"} />
            </SelectTrigger>
            <SelectContent>
              {designation.map((des) => (
                <SelectItem key={des.id} value={String(des.id)}>
                  {des.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-2">
          <Label>SBU</Label>
          <Select onValueChange={(value) => setValue("sub_project", Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder={profileData ? getSbuName(profileData.sub_project) : "Select SBU"} />
            </SelectTrigger>
            <SelectContent>
              {sbu.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-2">
          <Label>Biography</Label>
          <Textarea {...register("biography")} />
          {errors.biography && <p className="text-red-500">{errors.biography.message}</p>}
        </div>

        <div className="mt-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mb-2 max-h-24 overflow-auto">
            {tags.map((tag, index) => (
              <span key={index} className="bg-sky-500 px-2 text-white rounded-lg flex items-center">
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
      console.error("Error fetching employee data:", error);
    }
  };

  const fetchProfilePicture = async () => {
    try {
      const response = await axiosInstance.get<{ profile_picture: string }>("/api/v1/employee/profile-picture/");
      if (response.data.profile_picture) {
        setProfilePicture(response.data.profile_picture);
      }
    } catch (error) {
      console.error("Error fetching profile picture:", error);
    }
  };

  const fetchDesignation = async () => {
    try {
      const response = await axiosInstance.get<Designation[]>(`/api/v1/designations/`);
      setDesignation(response.data);
    } catch (error) {
      console.error("Error fetching designation:", error);
    }
  };

  const fetchSbu = async () => {
    try {
      const response = await axiosInstance.get<Sbu[]>(`/api/v1/sbu-projects/`);
      setSbu(response.data);
    } catch (error) {
      console.error("Error fetching sbu:", error);
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
    } catch (error) {
      console.error("Error updating profile picture:", error);
    }
  };

  const updateProfile = async (data: Profile) => {
    await axiosInstance.patch("/api/v1/employees/", data);
    await fetchEmployee();
  };

  return (
    <div className="flex flex-col md:flex-row p-12 bg-gray-100 rounded-2xl shadow-lg max-w-6xl mx-auto my-5 gap-4">
      <div className="mr-10 w-full md:w-1/3 flex flex-col items-center">
        <Dialog open={isProfilePicModalOpen} onOpenChange={setIsProfilePicModalOpen}>
          <DialogTrigger asChild>
            <img
              src={`http://localhost:8000/${profilePicture}`}
              alt="profile"
              className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-md cursor-pointer hover:brightness-50 transition"
            />
          </DialogTrigger>
          <ProfilePicModal onFileChange={handleProfilePictureChange} onUpload={updateProfilePicture} />
        </Dialog>
        {profile ? (
          <>
            <h1 className="text-2xl text-center font-bold mt-4 text-gray-900">{profile.name}</h1>
            <p className="text-base font-normal">Designation : <span className="text-base font-normal text-gray-700 mr-2">{getDesignationName(profile.designation)}</span></p>
            <p className="text-base font-normal">SBU : <span className="text-base font-normal text-gray-700 mr-2">{getSbuName(profile.sub_project)}</span></p>
            <div className="flex flex-wrap flex-row justify-center gap-2 mt-2">
              {profile.tags.map((tag,index)=>{
                return <span key={index} className="text-base font-normal bg-sky-500 rounded-xl px-2">{tag}</span>
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
                <FaEdit className="text-sky-600" size={20}/>
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