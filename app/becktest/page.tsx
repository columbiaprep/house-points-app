"use client";

import { useRouter } from "next/navigation";
import IndividualHouseComponent from "@/components/IndividualHouseComponent";

const BeckTest = () => {
    const router = useRouter();

    return (
        <div>
            <IndividualHouseComponent/> 
        </div>
    );
}

export default BeckTest;
