import { useEffect } from "react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";

const Logout = () => {
    useEffect(() => {
        const performLogout = async () => {

            const { error } = await supabase.auth.signOut();

            if (error) {
                toast.error("Hubo un error cerrando tu sesión.");
                console.error("Error signing out:", error.message);
            } else {
                toast.success("Cerraste sesión correctamente", {
                    icon: '👋',
                });
            }
        };

        const timer = setTimeout(() => {
            performLogout();
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-brand-50 gap-6">
            <div className="h-16 w-16 animate-spin rounded-full border-[5px] border-brand-500 border-t-transparent shadow-sm"></div>
            <h2 className="text-brand-700 h4-b animate-pulse drop-shadow-sm">
                Cerrando sesión de forma segura...
            </h2>
        </div>
    );
};

export default Logout;
