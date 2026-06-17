import { Link } from "react-router-dom";
import logo from "../../assets/imgs/logo.webp";

const SimpleHeader = () => {
    return (
        <header className="w-full h-20 bg-brand-100 flex items-center px-6 sm:px-12 sticky top-0 z-50 shadow-sm border-b border-brand-200 pointer-events-auto">
            <Link to="/" className="flex items-center hover:opacity-90 transition-opacity">
                <img src={logo} alt="Mundo Maquillaje" className="h-[45px] sm:h-[55px] w-auto object-contain drop-shadow-sm" />
            </Link>
        </header>
    );
};

export default SimpleHeader;
