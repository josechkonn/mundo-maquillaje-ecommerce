import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";

const StoreLayout = () => {
  return (
    <div className="min-h-screen bg-surface font-sans flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default StoreLayout;
