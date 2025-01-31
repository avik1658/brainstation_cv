import { skill } from "./dummyData";

export default function Skill() {
    return (        
        <div className="p-12 bg-gray-100 rounded-2xl shadow-lg max-w-6xl mx-auto my-5">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Technical Skills</h1>
            
            <div className="grid grid-cols-3 gap-6">
                {skill.map((element, index) => (
                    <div 
                        key={index} 
                        className="bg-gray-100 p-4 rounded-lg shadow-md hover:bg-black hover:text-white transition group"
                    >
                        <div className="flex justify-between">
                            <p className="text-xl font-semibold">{element.skillName}</p>
                            <p className="text-xl font-semibold">{element.rating}/10</p>
                        </div>

                        <div className="w-full bg-gray-300 group-hover:bg-gray-700 h-4 rounded-full mt-2">
                            <div 
                                className="bg-black group-hover:bg-white h-4 rounded-full transition-all duration-500" 
                                style={{ width: `${element.rating * 10}%` }}>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
