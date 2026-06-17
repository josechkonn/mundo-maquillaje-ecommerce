import { Outlet } from "react-router-dom";
import SimpleHeader from "../components/layout/SimpleHeader";
import Footer from "../components/layout/Footer";

const CheckoutLayout = () => {
  return (
    <div className="min-h-screen bg-surface font-sans flex flex-col">
      <SimpleHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutLayout;
