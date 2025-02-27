import Biography from "@/components/homepage/Biography";
import ExperienceAndEducation from "@/components/homepage/ExperienceAndEducation";
import Project from "@/components/homepage/Project";
import Skill from "@/components/homepage/Skill";
import TrainingAndAchievement from "@/components/homepage/TrainingAndAchievement";
import Navbar from "@/components/Navbar";

export default function Home() {  
    return ( 
        <>
            <Navbar />
            <Biography/>
            <Skill/>
            <ExperienceAndEducation/>
            <TrainingAndAchievement/>
            <Project/>
        </>      
    );
}
