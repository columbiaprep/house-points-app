import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import axios from "axios";
import React, { useState } from "react";
import { Spinner } from "@nextui-org/spinner";

const AdminReset = () => {
  const [fileContents, setFileContents] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFileContents(content);
      };
      reader.readAsText(file);
    }
  };

  const handleFullReset = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/data/houses/reset', { roster: fileContents });
      if (response.status !== 200) {
        throw new Error(`Error: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to reset all house rosters:", error);
    }
    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <div>
        <h2>Import Roster</h2>
        <div className="bg-gray-100 p-2 rounded flex flex-col font-sans gap-2">
          <div className="container w-1/4">
            <Input
              className="bg-gray-200 p-2 rounded"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
            <Button onClick={handleFullReset} className="mt-4 bg-red-400 p-2 rounded">
              {loading ? <Spinner size="sm" /> : 'Reset All'}
            </Button>
          </div>
          {fileContents && (
            <div className="mt-4 bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold">File Contents:</h3>
              <div className="whitespace-pre-wrap">{fileContents}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReset;