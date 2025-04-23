import { CircularProgress } from "@heroui/react";

const Loading = () => {
    return (
        <div className="loading absolute inset-0 flex justify-center items-center bg-gray-900 bg-opacity-90 h-screen w-screen z-50">
            <CircularProgress color="primary" label="Loading..." size={"lg"} />
        </div>
    );
};

export default Loading;
