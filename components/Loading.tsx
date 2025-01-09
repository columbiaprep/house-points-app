import { CircularProgress } from "@nextui-org/react";

const Loading = () => {
  return (
    <div className="loading absolute inset-0 flex justify-center items-center bg-gray-900 bg-opacity-90 h-screen w-screen z-50">
        <CircularProgress color="primary" size={"lg"} />
    </div>
  );
}

export default Loading;