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
  Spinner,
  Card,
  CardBody,
  Chip,
  Tooltip
} from "@nextui-org/react";
import { Plus, Search, Edit2, Trash2, Car as CarIcon } from "lucide-react";
import { useState } from "react";
import { useCars, useCarMutation, type Car } from "../../hooks/useAdmin";

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
          <h1 className="text-3xl font-bold text-white tracking-tight">Car Rental Inventory</h1>
          <p className="text-zinc-500">Manage your car fleet and rental services.</p>
        </div>
        <Button 
          onPress={onOpen}
          variant="shadow"
          className="bg-blue-600 text-white font-bold h-12 px-6 shadow-blue-600/20" 
          startContent={<Plus size={18} />}
        >
          Add New Car
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-2xl shadow-xl">
        <Input
          placeholder="Search by car name..."
          startContent={<Search className="text-zinc-500" size={18} />}
          className="max-w-md"
          variant="bordered"
          classNames={{
            input: "text-white",
            inputWrapper: "border-white/5 hover:border-white/10 focus-within:!border-blue-500/50 bg-white/5",
          }}
        />
      </div>

      <Card className="bg-white/5 border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden">
        <CardBody className="p-0">
          <Table 
            aria-label="Car rental inventory"
            removeWrapper
            classNames={{
              base: "max-h-[700px]",
              table: "min-h-[400px]",
              th: "bg-white/5 text-zinc-400 font-bold border-b border-white/5 py-5",
              td: "py-4 text-zinc-300 border-b border-white/5",
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
              emptyContent={isLoading ? <Spinner color="primary" /> : "No cars found"}
              items={cars || []}
            >
              {(car: Car) => (
                <TableRow key={car.id} className="hover:bg-white/5 transition-colors group">
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="relative group/img">
                        <Image 
                          src={car.photos?.[0]?.url || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2"} 
                          width={80} 
                          height={54} 
                          className="rounded-xl object-cover border border-white/10 shadow-lg group-hover/img:scale-105 transition-transform" 
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-lg tracking-tight">{car.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">ID: {car.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="dot" className="border-white/5 bg-white/5 text-zinc-300">
                      {car.type}
                    </Chip>
                  </TableCell>
                  <TableCell className="text-zinc-400 font-medium">{car.rows} Rows</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-[#00D5FF] text-lg">${car.pricePerDay}</span>
                      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">PER DAY</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit border ${car.available ? "bg-green-500/10 text-green-400 border-green-500/10" : "bg-zinc-500/10 text-zinc-500 border-white/5"}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${car.available ? "bg-green-400 shadow-[0_0_8px_#4ade80]" : "bg-zinc-500"}`} />
                      <span className="text-xs font-bold uppercase tracking-wider">{car.available ? "Available" : "Booked"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-3">
                      <Tooltip content="Edit Car" showArrow>
                        <Button isIconOnly size="sm" variant="flat" className="bg-white/5 text-zinc-400 hover:text-white border border-white/5">
                          <Edit2 size={16} />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Delete Car" color="danger" showArrow>
                        <Button 
                          isIconOnly 
                          size="sm" 
                          variant="flat" 
                          className="bg-red-500/5 text-red-400 hover:text-red-300 border border-red-500/10"
                          onPress={() => handleDelete(car.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Modal 
        backdrop="blur" 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        classNames={{
          base: "bg-zinc-900 border border-white/10 text-white shadow-2xl",
          header: "border-b border-white/5",
          footer: "border-t border-white/5"
        }}
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-2 text-2xl font-bold">
                <CarIcon className="text-[#00D5FF]" /> Add New Rental Car
              </ModalHeader>
              <ModalBody className="gap-6 py-6 font-sans">
                <div className="grid grid-cols-2 gap-6">
                  <Input 
                    label="Car Name" 
                    placeholder="e.g. Toyota Avanza" 
                    variant="bordered" 
                    classNames={{ 
                      label: "text-zinc-400 font-bold",
                      input: "text-white",
                      inputWrapper: "border-white/10 hover:border-white/20 focus-within:!border-blue-500 bg-white/5"
                    }} 
                    value={newCar.name}
                    onValueChange={(v) => setNewCar(p => ({ ...p, name: v }))}
                  />
                  <Select 
                    label="Car Type" 
                    placeholder="Select type" 
                    variant="bordered" 
                    classNames={{ 
                      label: "text-zinc-400 font-bold",
                      value: "text-white",
                      trigger: "border-white/10 hover:border-white/20 focus-within:!border-blue-500 bg-white/5"
                    }}
                    selectedKeys={[newCar.type]}
                    onSelectionChange={(v) => setNewCar(p => ({ ...p, type: Array.from(v)[0] as string }))}
                  >
                    {carTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-black">{type}</SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <Input 
                    label="Price per Day" 
                    placeholder="e.g. 45" 
                    type="number"
                    startContent={<span className="text-zinc-500 font-bold">$</span>} 
                    variant="bordered" 
                    classNames={{ 
                      label: "text-zinc-400 font-bold",
                      input: "text-white",
                      inputWrapper: "border-white/10 hover:border-white/20 focus-within:!border-blue-500 bg-white/5"
                    }} 
                    value={newCar.pricePerDay.toString()}
                    onValueChange={(v) => setNewCar(p => ({ ...p, pricePerDay: Number(v) }))}
                  />
                  <Input 
                    label="Number of Rows" 
                    placeholder="e.g. 3" 
                    type="number"
                    variant="bordered" 
                    classNames={{ 
                      label: "text-zinc-400 font-bold",
                      input: "text-white",
                      inputWrapper: "border-white/10 hover:border-white/20 focus-within:!border-blue-500 bg-white/5"
                    }} 
                    value={newCar.rows.toString()}
                    onValueChange={(v) => setNewCar(p => ({ ...p, rows: Number(v) }))}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose} className="text-zinc-400 font-bold bg-white/5 border border-white/5">
                  Cancel
                </Button>
                <Button 
                  className="bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20" 
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
