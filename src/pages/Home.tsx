import { useAtomValue } from "jotai";
import { accessTokenAtom,refreshTokenAtom } from "@/store/tokenStore";
import { Button } from "@/components/ui/button";

export default function Home() {  
    const accessToken = useAtomValue(accessTokenAtom);  
    const refreshToken = useAtomValue(refreshTokenAtom);  

    function getAccessToken() {
        console.log("Stored Access Token:", accessToken);
    }

    function getRefreshToken() {
        console.log("Stored Refresh Token:", refreshToken);
    }


    return (        
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-3xl">Home</h1>
            <Button onClick={getAccessToken}>See Access token</Button>
            <Button onClick={getRefreshToken} className="mt-2">See Refresh token</Button>
        </div>
    );
}
