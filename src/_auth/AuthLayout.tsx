import { Outlet, Navigate } from "react-router-dom";
import { useUserContext } from "@/context/authContext";
const AuthLayout = () => {
  const { isAuthenticated } = useUserContext();
  return (
    <>
      {isAuthenticated ? (
        <Navigate to={"/"} />
      ) : (
        <>
          <section className="flex flex-1 justify-center items-center flex-col py-10">
            <Outlet />
          </section>
          <img
            src="/assets/images/side-img.svg"
            className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat"
            alt="Side Image"
          />
        </>
      )}
    </>
  );
};

export default AuthLayout;
