import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { checkServerHealth } from "../api/checkServerHealth";


export function useServerAutoCheck(online: boolean) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!online) return;

        const check = async () => {
            const status = await checkServerHealth();
            if (status == "down") 
                navigate("/maintenance")
            else if (status == "ok")
                navigate("/home");
        };

        check();
    }, []);
}

export function useServerCheck() {
    const navigate = useNavigate();

    return async () => {
        const status = await checkServerHealth();

        if (status === "ok") {
            navigate("/home");
        }
    };
}