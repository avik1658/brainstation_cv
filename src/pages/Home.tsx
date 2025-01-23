import { Button } from "@/components/ui/button";

export default function Home() {  

    const localAccessToken = localStorage.getItem("localAccessToken");
    const localRefreshToken = localStorage.getItem("localRefreshToken");

    function getAccessToken() {
        console.log("Stored Access Token(LocalStorage):", localAccessToken);
    }

    function getRefreshToken() {
        console.log("Stored Refresh Token(LocalStorage):", localRefreshToken);
    }


    return (        
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-3xl">Home</h1>
            <Button onClick={getAccessToken}>See Access token</Button>
            <Button onClick={getRefreshToken} className="mt-2">See Refresh token</Button>
        </div>
    );
}
