import { getCurrentAdmins, User } from "@/firebase-configuration/firebaseDb";
import { Button, Card, Input } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { addAdmin } from "@/firebase-configuration/firebaseDb";

const AddAdmins = () => {
    const [errorMess, setErrorMess] = useState<string>("");
    
    const fetchedAdmins = async () => {
        await getCurrentAdmins();
    }

   
    useEffect(() => {
        fetchedAdmins();
    }, [])

    const addAdminHandler = async (email: string) => {
        try {
            await addAdmin(email);
        }catch (error) {
            setErrorMess("Failed to add admin. Please try again.");
        }
    }


    return (
        <Card isBlurred
        className="point-form-card border-none shadow-lg p-6 w-5/6 h-fit"
    >
            <div>
                <h2 className="text-2xl font-bold text-center">
                    Add Admins
                </h2>
                <p className="text-center">
                    Add admins to the system
                </p>
                <div>
                    <form className="flex flex-col items-center gap-4">
                        <Input type="text" placeholder="Enter email address" />
                        <Button className="btn-primary">Add Admin</Button>
                    </form>
                </div>
                <p className="text-center text-red-500">{errorMess}</p>
            </div>
        </Card>
    )
}

export default AddAdmins;