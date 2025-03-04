import { getCurrentAdmins, removeAdmin, User } from "@/firebase-configuration/firebaseDb";
import { Button, Card, CircularProgress, Input } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { addAdmin } from "@/firebase-configuration/firebaseDb";
import { useRouter } from "next/navigation";

const Loading = () => {
    return (
        <div className="loading">
            <CircularProgress color="primary" size={"sm"} />
        </div>
    );
}

const AddAdmins = () => {
    const [errorMess, setErrorMess] = useState<string>("");
    const [successMess, setSuccessMess] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const fetchedAdmins = async (): Promise<User[]> => {
        return getCurrentAdmins();
    }

    const [admins, setAdmins] = useState<User[]>([]);
   
    useEffect(() => {
        fetchedAdmins().then((admins) => {
            setAdmins(admins);
        });
    }, [])

    const addAdminHandler = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setErrorMess("");
        setSuccessMess("");
        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        try {
            await addAdmin(email);
            setSuccessMess("Admin added successfully.");
            setAdmins(await fetchedAdmins());
        } catch (error) {
            setErrorMess("Failed to add admin. Make sure the new admin has signed into the app with their CGPS email.");
        } finally {
            setLoading(false);
        }
    }

    const removeAdminHandler = async (email: string) => {
        if (admins.length == 1) {
            setErrorMess("You must have at least one admin.");
            return;
        }
        setLoading(true);
        setErrorMess("");
        setSuccessMess("");
        try {
            await removeAdmin(email);
            setSuccessMess("Admin removed successfully.");
            setAdmins(await fetchedAdmins());
        } catch (error) {
            setErrorMess("Failed to remove admin. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card isBlurred className="point-form-card border-none shadow-lg p-6 w-5/6 h-fit">
            <div>
                <h2 className="text-2xl font-bold text-center">Add Admins</h2>
                <span className="text-center">
                    <form onSubmit={addAdminHandler} className="flex flex-col items-center gap-4">
                        <Input type="text" name="email" placeholder="Enter email address" />
                        <Button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? <Loading /> : "Add Admin"}
                        </Button>
                    </form>
                    <div className="flex flex-col gap-4">
                        <h3 className="text-xl font-bold text-left mt-4">Current Admins</h3>
                        {admins.map((admin) => (
                            <div key={admin.email} className="flex justify-between items-center">
                                <p>{admin.email}</p>
                                <Button onPress={() => removeAdminHandler(admin.email)} color="danger" disabled={loading}>
                                    {loading ? <Loading /> : "Remove"}
                                </Button>
                            </div>
                        ))}
                    </div>
                </span>
                {errorMess && <p className="text-center text-red-500">{errorMess}</p>}
                {successMess && <p className="text-center text-green-500">{successMess}</p>}
            </div>
        </Card>
    )
}

export default AddAdmins;