"use client";

import { useRouter } from "next/navigation";
import IndividualHouseComponent from "../components/IndividualHouseComponent.tsx";

const BeckTest = () => {
    const router = useRouter();

    return (
        <div>
            <h1>HI!</h1>
            <IndividualHouseComponent /> 
        </div>
    );
}

export default BeckTest;
