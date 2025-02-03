import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { skill as initialSkills } from "../homepage/dummyData";

interface Skill {
  skillName: string;
  rating: number | "";
}

export default function SkillUpdate() {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newSkill, setNewSkill] = useState<Skill>({ skillName: "", rating: "" });
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleSaveEdit = () => {
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleAddSkill = () => {
    if (newSkill.skillName.trim() !== "" && newSkill.rating !== "") {
      setSkills([...skills, { ...newSkill, rating: Number(newSkill.rating) }]);
      setNewSkill({ skillName: "", rating: "" });
      setShowAddForm(false);
    }
  };

  return (
    <div className="p-12 bg-gray-100 rounded-2xl shadow-lg max-w-6xl mx-auto my-5">
      <h1 className="text-3xl font-bold text-center mb-6">Skills</h1>

      <Table className="w-full">
        <TableCaption>List of your skills</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3 text-center">Skill Name</TableHead>
            <TableHead className="w-1/3 text-center">Rating</TableHead>
            <TableHead className="w-1/3 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {skills.map((skill, index) => (
            <TableRow key={index}>
              <TableCell>
                {editingIndex === index ? (
                  <Input className="text-center"
                    value={skill.skillName}
                    onChange={(e) => {
                      const updatedSkills = [...skills];
                      updatedSkills[index].skillName = e.target.value;
                      setSkills(updatedSkills);
                    }}
                  />
                ) : (
                  <p className="text-center">{skill.skillName}</p>
                  
                )}
              </TableCell>
              <TableCell>
                {editingIndex === index ? (
                  <Input className="text-center"
                    type="number"
                    value={skill.rating}
                    min={1}
                    max={10}
                    onChange={(e) => {
                      const updatedSkills = [...skills];
                      updatedSkills[index].rating =
                        e.target.value === "" ? "" : Math.min(10, Math.max(1, parseInt(e.target.value)));
                      setSkills(updatedSkills);
                    }}
                  />
                ) : (
                  <p className="text-center">{skill.rating}</p>
                )}
              </TableCell>
              <TableCell>
                {editingIndex === index ? (
                  <div className="flex flex-row gap-2 justify-center">
                    <Button className="bg-green-600" onClick={() => handleSaveEdit()}>Save</Button>
                    <Button className="bg-blue-500" onClick={handleCancelEdit}>Cancel</Button>
                  </div>
                ) : (
                  <div className="flex flex-row gap-2 justify-center">
                    <Button variant="outline" onClick={() => handleEdit(index)}>
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(index)}>
                      Delete
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {showAddForm && (
        <div className="mt-6 flex gap-4 items-center">
          <Input
            placeholder="New skill name"
            value={newSkill.skillName}
            onChange={(e) => setNewSkill({ ...newSkill, skillName: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Rating (1-10)"
            value={newSkill.rating}
            min={1}
            max={10}
            onChange={(e) => {
              const value = e.target.value === "" ? "" : Math.min(10, Math.max(1, parseInt(e.target.value)));
              setNewSkill({ ...newSkill, rating: value });
            }}
          />
          <Button onClick={handleAddSkill} className="bg-green-500 text-white">
            Save
          </Button>
        </div>
      )}

      <div className="mt-6 text-center">
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-500">
          {showAddForm ? "Cancel" : "+ Add Skill"}
        </Button>
      </div>
    </div>
  );
}
