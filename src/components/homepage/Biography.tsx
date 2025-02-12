import { useEffect, useState } from "react";
import axiosInstance from "@/axios";
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
import { Button } from "@/components/ui/button";

interface Employee  {
  name: string;
  designation: number;
  sub_project: number;
  biography: string;
};

interface Designation {
  id: number;
  name: string;
};

interface Sbu {
  id: number;
  name: string;
};

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
        <Button onClick={onUpload}>Update Profile Picture</Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default function Biography() {
  const [profile, setProfile] = useState<Employee | null>(null);
  const [designation, setDesignation] = useState<string>("");
  const [sbu, setSbu] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<string>("/images/profile.png");
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchEmployee = async () => {
        try {
        const response = await axiosInstance.get<Employee>("/api/v1/employees/");
        setProfile(response.data);
        fetchDesignation(response.data.designation);
        fetchSbu(response.data.sub_project)
        } catch (error) {
        console.error("Error fetching employee data:", error);
        }
    };

    fetchEmployee();
    fetchProfilePicture();
  }, []);



  const fetchDesignation = async (designationId: number) => {
    try {
      const response = await axiosInstance.get<Designation>(`/api/v1/designations/${designationId}/`);
      setDesignation(response.data.name);
    } catch (error) {
      console.error("Error fetching designation:", error);
    }
  };

  const fetchSbu = async (sbuId: number) => {
    try {
      const response = await axiosInstance.get<Sbu>(`/api/v1/sbu-projects/${sbuId}/`);
      setSbu(response.data.name);
    } catch (error) {
      console.error("Error fetching sbu:", error);
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
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating profile picture:", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row p-12 bg-gray-100 rounded-2xl shadow-lg max-w-6xl mx-auto my-5 gap-4">
      <div className="mr-10 w-full md:w-1/3 flex flex-col items-center">
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <img
              src={`http://localhost:8000/${profilePicture}`}
              alt="profile"
              className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-md cursor-pointer hover:brightness-50 transition"
            />
          </DialogTrigger>
          <ProfilePicModal onFileChange={handleProfilePictureChange} onUpload={updateProfilePicture} />
        </Dialog>
        <h1 className="text-xl font-bold mt-4 text-gray-900">{profile?.name || "Loading..."}</h1>
            <p className="text-xl font-normal">Designation :  <span className="text-xl font-normal text-gray-700 mr-2">{designation || "Loading..."}</span></p>
            <p className="text-xl font-normal">Sbu :  <span className="text-xl font-normal text-gray-700 mr-2">{sbu || "Loading..."}</span></p>
      </div>
      <div className="w-full md:w-2/3 bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900">Biography</h1>
        <p className="text-xl text-gray-700 mt-4 leading-relaxed">{profile?.biography || "No biography available."}</p>
      </div>
    </div>
  );
}