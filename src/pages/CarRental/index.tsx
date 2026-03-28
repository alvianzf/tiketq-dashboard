import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell, 
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Image,
  Spinner
} from "@nextui-org/react";
import { Plus, Search, Edit2, Trash2, Car as CarIcon } from "lucide-react";
import { useState } from "react";
import { useCars, useCarMutation, type Car } from "../../hooks/useAdmin.ts";

const carTypes = ["City Car", "Sedan", "SUV", "MPV", "Minibus", "Pick-up", "Double Cabin", "Van"];

const CarRentalPage = () => {
  const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
  const { data: cars, isLoading } = useCars();
  const { createCar, deleteCar } = useCarMutation();
  
  const [newCar, setNewCar] = useState({
    name: "",
    type: "SUV",
    pricePerDay: 50,
    rows: 3,
  });

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this car?")) {
      await deleteCar.mutateAsync(id);
    }
  };

  const handleCreate = async () => {
    await createCar.mutateAsync({
      ...newCar,
      available: true,
    });
    onClose();
  };
  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-5 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-white">Car Rental Management</h1>
          <p className="text-zinc-500">Manage your car inventory and rental services.</p>
        </div>
        <Button 
          onPress={onOpen}
          className="bg-gradient-to-tr from-[#4267B2] to-[#00D5FF] text-white font-bold h-12 px-6" 
          startContent={<Plus size={18} />}
        >
          Add New Car
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
        <Input
          placeholder="Search by car name..."
          startContent={<Search className="text-zinc-500" size={18} />}
          className="max-w-md"
          variant="flat"
        />
      </div>

      <Table 
        aria-label="Car rental inventory"
        className="bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden"
        classNames={{
          base: "max-h-[700px]",
          table: "min-h-[400px]",
          thead: "bg-zinc-800/50",
          th: "text-zinc-400 font-bold border-b border-white/5 py-4",
          td: "py-4 text-zinc-300",
        }}
      >
        <TableHeader>
          <TableColumn>CAR</TableColumn>
          <TableColumn>TYPE</TableColumn>
          <TableColumn>ROWS</TableColumn>
          <TableColumn>DAILY PRICE</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn align="center">ACTIONS</TableColumn>
        </TableHeader>
        <TableBody 
          emptyContent={isLoading ? <Spinner /> : "No cars found"}
          items={cars || []}
        >
          {(car: Car) => (
            <TableRow key={car.id} className="hover:bg-white/5 transition-colors group">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Image 
                    src={car.photos?.[0]?.url || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2"} 
                    width={60} 
                    height={40} 
                    className="rounded-lg object-cover" 
                  />
                  <span className="font-bold text-white text-lg">{car.name}</span>
                </div>
              </TableCell>
              <TableCell className="font-medium text-zinc-300">{car.type}</TableCell>
              <TableCell className="text-zinc-400">{car.rows} Rows</TableCell>
              <TableCell className="font-bold text-[#00D5FF]">${car.pricePerDay}/day</TableCell>
              <TableCell>
                <div className={`flex items-center gap-1.5 text-sm font-medium ${car.available ? "text-green-400" : "text-zinc-500"}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${car.available ? "bg-green-400 shadow-[0_0_8px_#4ade80]" : "bg-zinc-500"}`} />
                  {car.available ? "Available" : "Booked"}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-3">
                  <Button isIconOnly size="sm" variant="light" className="text-zinc-400 hover:text-white">
                    <Edit2 size={16} />
                  </Button>
                  <Button 
                    isIconOnly 
                    size="sm" 
                    variant="light" 
                    className="text-zinc-500 hover:text-red-400"
                    onPress={() => handleDelete(car.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal 
        backdrop="blur" 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        className="bg-zinc-900 border border-white/10 text-white"
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-2 text-2xl font-bold">
                <CarIcon className="text-[#00D5FF]" /> Add New Rental Car
              </ModalHeader>
              <ModalBody className="gap-6 py-6">
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Car Name" 
                    placeholder="e.g. Toyota Avanza" 
                    variant="bordered" 
                    classNames={{ label: "text-zinc-400" }} 
                    value={newCar.name}
                    onValueChange={(v) => setNewCar(p => ({ ...p, name: v }))}
                  />
                  <Select 
                    label="Car Type" 
                    placeholder="Select type" 
                    variant="bordered" 
                    classNames={{ label: "text-zinc-400" }}
                    selectedKeys={[newCar.type]}
                    onSelectionChange={(v) => setNewCar(p => ({ ...p, type: Array.from(v)[0] as string }))}
                  >
                    {carTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-black">{type}</SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Price per Day" 
                    placeholder="e.g. 45" 
                    type="number"
                    startContent={<span className="text-zinc-500">$</span>} 
                    variant="bordered" 
                    classNames={{ label: "text-zinc-400" }} 
                    value={newCar.pricePerDay.toString()}
                    onValueChange={(v) => setNewCar(p => ({ ...p, pricePerDay: Number(v) }))}
                  />
                  <Input 
                    label="Number of Rows" 
                    placeholder="e.g. 3" 
                    type="number"
                    variant="bordered" 
                    classNames={{ label: "text-zinc-400" }} 
                    value={newCar.rows.toString()}
                    onValueChange={(v) => setNewCar(p => ({ ...p, rows: Number(v) }))}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose} className="text-zinc-400 font-bold">
                  Cancel
                </Button>
                <Button 
                  className="bg-gradient-to-tr from-[#4267B2] to-[#00D5FF] text-white font-bold" 
                  onPress={handleCreate}
                  isLoading={createCar.isPending}
                >
                  Save Car Entry
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CarRentalPage;
