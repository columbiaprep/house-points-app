import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/input';
import React, { useState } from 'react';
import { Spinner } from '@nextui-org/spinner';
import {
  Modal,
  ModalContent,
  useDisclosure,
  ModalFooter,
  ModalHeader,
  ModalBody,
} from '@nextui-org/react';
import Papa from 'papaparse';
import { resetDatabase, Student } from '@/firebase-configuration/firebaseDb';

const AdminReset = () => {
  const [fileContents, setFileContents] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

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
      const parseResult = Papa.parse<Student>(fileContents, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
    });

    const students: Array<Student> = parseResult.data;

    await resetDatabase(students);
    } catch (error) {
      console.error('Failed to reset all house rosters:', error);
    }
    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <div>
        <Modal
          isOpen={isOpen}
          title="Reset All House Rosters"
          onClose={onClose}
        >
          <ModalContent>
            <ModalHeader>Reset All House Rosters</ModalHeader>
            <ModalBody>
              <p>Are you sure you want to reset all house rosters?</p>
              <p>This action cannot be undone.</p>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                disabled={loading}
                onPress={handleFullReset}
              >
                {loading ? <Spinner /> : 'Reset All'}
              </Button>
              <Button onPress={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <h2>
          Import Entire Houses Roster (Should Include: Name, Grade, House, ID)
        </h2>
        <div className="bg-gray-100 p-2 rounded flex flex-col font-sans gap-2">
          <div className="container w-1/4">
            <Input
              accept=".csv"
              className="bg-gray-200 p-2 rounded"
              type="file"
              onChange={handleFileChange}
            />
            {fileContents && (
              <Button className="mt-4" onPress={onOpen}>
                Reset All
              </Button>
            )}
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
