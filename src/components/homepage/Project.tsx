import { projects } from "./dummyData";

export default function Project() {
    return (
        <div className="p-12 bg-gray-100 rounded-2xl shadow-lg max-w-6xl mx-auto my-5">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Projects</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((element, index) => (
                    <div key={index} className="flex flex-col gap-2 bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                        <h2 className="text-2xl font-semibold text-gray-800">{element.name}</h2>
                        <p className="text-gray-600 font-medium mt-2">
                            <span className="font-bold text-gray-800">Tech Stack : </span> {element.tech}
                        </p>
                        <p className="text-gray-600 font-medium">
                            <span className="font-bold text-gray-800">Responsibilities : </span> {element.responsibilities}
                        </p>
                        <p className="text-gray-600 font-medium">
                            <span className="font-bold text-gray-800">Github Link : </span> {element.link}
                        </p>
                        <p className="text-gray-600 font-medium">
                            <span className="font-bold text-gray-800">Duration : </span> {element.duration}
                        </p>
                        <p className="text-gray-700 mt-3 leading-relaxed">{element.decription}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
