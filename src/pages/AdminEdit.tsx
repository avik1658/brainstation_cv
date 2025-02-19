import Biography from "@/components/homepage/Biography";
import ExperienceAndEducation from "@/components/homepage/ExperienceAndEducation";
import Project from "@/components/homepage/Project";
import Skill from "@/components/homepage/Skill";
import TraingAndAchievement from "@/components/homepage/TraingAndAchievement";
import Navbar from "@/components/Navbar";

export default function AdminEdit() {  
    return ( 
        <>
            <Navbar />
            <Biography/>
            <Skill/>
            <ExperienceAndEducation/>
            <TraingAndAchievement/>
            <Project/>
        </> 
    );
}
