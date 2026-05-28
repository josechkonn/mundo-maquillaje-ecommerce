import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const StoreLayout = () => {
  return (
    <div className="min-h-screen bg-surface font-sans flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster position="top-center" />
    </div>
  );
};

export default StoreLayout;
