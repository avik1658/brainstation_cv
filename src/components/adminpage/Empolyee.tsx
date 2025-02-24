import {useAxios} from "@/axios";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FaDownload } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import GenerateExcelModal from "./GenerateExcelModal";

interface Employee {
  id: number;
  name: string;
  profile_picture: string;
  bs_id: string;
  designation: number;
  tags : string[];
  updated_status : string;
  updated_date : string;
}

interface Designation {
  id: number;
  name: string;
}


export default function Employee() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [designation, setDesignation] = useState<Designation[]>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [prevPage, setPrevPage] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const axiosInstance = useAxios();
  const navigate = useNavigate();

  const fetchEmployee = async (query = "", page = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(`/api/v1/employee/search`, {
        params: { q: query, page: page, page_size: pageSize },
      });
      setEmployees(response.data.results);
      setTotalEmployees(response.data.count);
      setNextPage(response.data.next);
      setPrevPage(response.data.previous);
      setSelectedEmployees([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchEditToken = async (id:number) => {
    try {
      const response = await axiosInstance.get(`/api/token/${id}`);
      localStorage.setItem("editAccessToken", response.data.access);
      console.log(`Edit Access Token: ${response.data.access}`);
      navigate("/admin-edit");
    } catch (error) {
      console.error("Error getting token:", error);
    }
  }


  const fetchDesignation = async () => {
    try {
      const response = await axiosInstance.get<Designation[]>(`/api/v1/designations/`);
      setDesignation(response.data);
    } catch (error) {
      console.error("Error fetching designation:", error);
    }
  };

  const downloadCV = async (id: number, bs_id: string) => {
    try {
      const response = await axiosInstance.get(`/api/v1/generate-pdf/${id}/`, {
        responseType: "blob",
        timeout: 10000,
        headers: { Accept: "application/pdf" },
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `CV_${bs_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading CV:", error);
    }
  };

  const downloadSelectedCVs = async () => {
    for (const emp of selectedEmployees) {
        await downloadCV(emp.id, emp.bs_id);
    }
  };


  useEffect(() => {
    fetchDesignation();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  useEffect(() => {
    fetchEmployee(searchTerm, currentPage, pageSize);
  }, [searchTerm, currentPage, pageSize]);

  const getDesignationName = (id: number): string => {
    return designation.find((d) => d.id === id)?.name || "Unknown";
  };

  const handleNextPage = () => nextPage && setCurrentPage((prev) => prev + 1);
  const handlePrevPage = () => prevPage && setCurrentPage((prev) => prev - 1);

  const toggleSelection = (employee: Employee) => {
    setSelectedEmployees((prev) =>
      prev.includes(employee)
        ? prev.filter((e) => e.id !== employee.id)
        : [...prev, employee]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees);
    }
    setSelectAll(!selectAll);
  };


  return (
    <div className="p-12 bg-gray-100 rounded-2xl shadow-lg max-w-[1500px] mx-auto mt-5 gap-4">
      <h1 className="text-3xl font-bold text-center mb-4">Employee List</h1>

      <div className="flex flex-row items-center gap-x-4 mb-5">
        <Input type="text" placeholder="Search By Name..." className="border border-gray-300 rounded" 
        onChange={(e) => setSearchTerm(e.target.value.toLowerCase())} />

        <Button className="bg-sky-600 hover:bg-sky-700 transition" onClick={() => setModalOpen(true)}>Generate Excel</Button>
        <GenerateExcelModal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          selectedIds={selectedEmployees.map(emp => emp.id)}
        />

      </div>



      
      <Table>
        <TableCaption className="text-sm font-medium">Total Employees: {totalEmployees}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[5%]">
              <Checkbox checked={selectAll} onCheckedChange={toggleSelectAll} />
            </TableHead>
            <TableHead className="w-[5%]">Pic</TableHead>
            <TableHead className="w-[5%]">BS ID</TableHead>
            <TableHead className="w-[15%]">Name</TableHead>
            <TableHead className="w-[15%]">Designation</TableHead>
            <TableHead className="w-[20%]">Update Status</TableHead>
            <TableHead className="w-[25%] text-center">Enthusiast At</TableHead>
            <TableHead className="w-[5%] text-center">Edit</TableHead>
            <TableHead className="w-[5%] text-center">Download</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id} className="h-10">
              <TableCell>
                <Checkbox
                  checked={selectedEmployees.some((e) => e.id === employee.id)}
                  onCheckedChange={() => toggleSelection(employee)}
                />
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-start">
                  <img
                    src={`http://localhost:8000/${employee.profile_picture}`}
                    alt="profile"
                    className="w-12 h-12 rounded-full"
                  />
                </div>
              </TableCell>
              <TableCell>{employee.bs_id}</TableCell>
              <TableCell>{employee.name}</TableCell>
              <TableCell>{getDesignationName(employee.designation)}</TableCell>
              <TableCell>{employee.updated_status}</TableCell>
              <TableCell>
                  <div className="flex flex-wrap flex-row justify-center gap-2 mt-2">
                    {employee.tags.map((tag,index)=>{
                      return <span key={index} className="text-white text-base text-center font-normal bg-sky-500 rounded-xl px-2">{tag}</span>
                    })}
                  </div>
              </TableCell>
              <TableCell className="text-center">
                    <div className="flex justify-center">
                      <FaEdit
                        className="text-sky-500 hover:text-sky-600 transition cursor-pointer"
                        size={20}
                        onClick={async () => {
                          fetchEditToken(employee.id) }}
                      />
                    </div>
               </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                    <FaDownload className="text-green-800 hover:text-green-900 transition cursor-pointer" size={16} onClick={()=>downloadCV(employee.id,employee.bs_id)} />
                </div>
               </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-center mt-4 gap-3">
            <Button onClick={handlePrevPage} disabled={!prevPage} className="w-24 bg-sky-600 hover:bg-sky-700 transition">
                Previous
            </Button>
            <Select
                onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1)
                }}
            >
                <SelectTrigger className="w-24">
                    <SelectValue placeholder={String(pageSize)} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Page Size</SelectLabel>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="40">40</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Button onClick={handleNextPage} disabled={!nextPage} className="w-24 bg-sky-600 hover:bg-sky-700 transition">
                Next
            </Button>
       </div>


      <div className="flex justify-center mt-4 gap-3">
        <Button onClick={downloadSelectedCVs} disabled={!selectedEmployees.length} className="bg-sky-600 hover:bg-sky-700 transition">
            Download Selected CVs
        </Button>
      </div>
    </div>
  );
}
