import Biography from "@/components/homepage/Biography";
import Project from "@/components/homepage/Project";
import Skill from "@/components/homepage/Skill";
import TraingAndAchievement from "@/components/homepage/TraingAndAchievement";
import Navbar from "@/components/Navbar";

export default function Home() {  
    return ( 
        <>
            <Navbar />
            <Biography/>
            <Skill/>
            <TraingAndAchievement/>
            <Project/>
        </>      
    );
}
