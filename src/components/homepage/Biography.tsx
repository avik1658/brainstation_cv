import { profileInfo } from "./dummyData";


export default function Biography() {
    return (        
        <div className="flex flex-col md:flex-row p-12 bg-gray-100 rounded-2xl shadow-lg max-w-6xl mx-auto my-5 gap-4">
            <div className="mr-10 w-full md:w-1/3 flex flex-col items-center">
                <img src="/images/profile.png" alt="profile" className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-md" />
                <h1 className="text-3xl font-bold mt-4 text-gray-900">{profileInfo.fullname}</h1>
                <h2 className="text-2xl text-gray-700">{profileInfo.position}</h2>
                <h3 className="text-xl text-gray-600">SBU: {profileInfo.sbu}</h3>

                <div className="mt-6 flex flex-row flex-wrap gap-2 items-center justify-center">
                    {profileInfo.interestedIn.map((element, index) => (
                        <p key={index} className="bg-sky-600 rounded-lg text-white px-2 items-center" >{element}</p>
                    ))}
                </div>
            </div>
            <div className="w-full md:w-2/3 bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-gray-900">Biography</h1>
                <p className="text-xl text-gray-700 mt-4 leading-relaxed">
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit. Tenetur expedita cum voluptates dolore illo sequi provident, inventore ipsa accusantium eveniet aspernatur ipsum, non laboriosam! Accusamus modi obcaecati totam consequatur neque.

                </p>
            </div>
        </div>
    );
}
