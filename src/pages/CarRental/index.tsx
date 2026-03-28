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
  Tooltip,
} from "@nextui-org/react";
import { Plus, Search, Edit2, Trash2, Car as CarIcon } from "lucide-react";
import { useState } from "react";
import { useCars, useCarMutation, type Car } from "../../hooks/useAdmin";

const carTypes = ["City Car", "Sedan", "SUV", "MPV", "Minibus", "Pick-up", "Double Cabin", "Van"];

const MODAL_CLASSES = {
  base: "bg-zinc-900/80 border border-white/10 shadow-2xl backdrop-blur-2xl",
  header: "border-b border-white/5 px-8 pt-8 pb-6",
  body: "px-8 py-6",
  footer: "border-t border-white/5 px-8 pb-8 pt-6 gap-3",
};

const INPUT_CLASSES = {
  label: "text-zinc-400 font-medium pb-1.5",
  input: "text-white",
  inputWrapper: "border-white/10 hover:border-white/20 focus-within:!border-blue-500/60 bg-white/5",
};

const CarRentalPage = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const { data: cars, isLoading } = useCars();
  const { createCar, deleteCar } = useCarMutation();
  const [search, setSearch] = useState("");

  const [newCar, setNewCar] = useState({
    name: "",
    type: "SUV",
    pricePerDay: 500000,
    rows: 3,
  });

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to remove this car from inventory?")) {
      await deleteCar.mutateAsync(id);
    }
  };

  const handleCreate = async () => {
    await createCar.mutateAsync({ ...newCar, available: true });
    setNewCar({ name: "", type: "SUV", pricePerDay: 500000, rows: 3 });
    onClose();
  };

  const filtered = (cars || []).filter((c: Car) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">Car Rental Inventory</h1>
          <p className="text-zinc-500">Manage your fleet, pricing, and availability.</p>
        </div>
        <Button
          onPress={onOpen}
          variant="shadow"
          startContent={<Plus size={18} />}
          className="bg-blue-600 text-white font-bold h-12 px-6 shadow-blue-600/20"
        >
          Add New Car
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-2xl">
        <Input
          placeholder="Search by car name..."
          value={search}
          onValueChange={setSearch}
          startContent={<Search className="text-zinc-500" size={18} />}
          className="max-w-md"
          variant="bordered"
          classNames={{
            input: "text-white",
            inputWrapper: "border-white/5 hover:border-white/10 focus-within:!border-blue-500/50 bg-white/5",
          }}
        />
        <span className="text-xs text-zinc-600 ml-auto">{filtered.length} vehicles</span>
      </div>

      {/* Table */}
      <Card className="bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden">
        <CardBody className="p-0">
          <Table
            aria-label="Car rental inventory"
            removeWrapper
            classNames={{
              base: "max-h-[700px]",
              table: "min-h-[400px]",
              th: "bg-white/5 text-zinc-400 border-b border-white/5 py-5 uppercase text-xs font-bold tracking-wider",
              td: "py-4 text-zinc-300 border-b border-white/5 last:border-0",
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
              emptyContent={isLoading ? <Spinner color="primary" /> : "No cars in inventory"}
              items={filtered}
            >
              {(car: Car) => (
                <TableRow key={car.id} className="hover:bg-white/5 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="relative overflow-hidden rounded-xl border border-white/10">
                        <Image
                          src={car.photos?.[0]?.url || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=160&q=80"}
                          width={72}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white tracking-tight">{car.name}</span>
                        <span className="text-[11px] text-zinc-600 font-mono">#{car.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" className="bg-white/5 border border-white/10 text-zinc-300">
                      {car.type}
                    </Chip>
                  </TableCell>
                  <TableCell className="text-zinc-400">{car.rows} rows</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-[#00D5FF]">Rp {Number(car.pricePerDay).toLocaleString("id-ID")}</span>
                      <span className="text-[10px] text-zinc-600 uppercase tracking-wider">per day</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${car.available ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-zinc-500/10 text-zinc-500 border-white/5"}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${car.available ? "bg-green-400 shadow-[0_0_6px_#4ade80]" : "bg-zinc-500"}`} />
                      {car.available ? "Available" : "Booked"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Tooltip content="Edit car" showArrow>
                        <Button isIconOnly size="sm" variant="flat" className="bg-white/5 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 border border-white/5">
                          <Edit2 size={15} />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Remove car" color="danger" showArrow>
                        <Button
                          isIconOnly size="sm" variant="flat"
                          className="bg-red-500/5 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/10"
                          onPress={() => handleDelete(car.id)}
                          isLoading={deleteCar.isPending}
                        >
                          <Trash2 size={15} />
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

      {/* Add Car Modal */}
      <Modal
        backdrop="blur"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={MODAL_CLASSES}
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                    <CarIcon size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Add New Car</h2>
                    <p className="text-sm text-zinc-500 font-normal mt-0.5">Fill in the vehicle details below.</p>
                  </div>
                </div>
              </ModalHeader>

              <ModalBody>
                <div className="grid grid-cols-2 gap-5">
                  <Input
                    label="Car Name"
                    placeholder="e.g. Toyota Avanza"
                    variant="bordered"
                    classNames={INPUT_CLASSES}
                    value={newCar.name}
                    onValueChange={(v) => setNewCar((p) => ({ ...p, name: v }))}
                  />
                  <Select
                    label="Car Type"
                    placeholder="Select type"
                    variant="bordered"
                    classNames={{
                      label: "text-zinc-400 font-medium pb-1.5",
                      value: "text-white",
                      trigger: "border-white/10 hover:border-white/20 bg-white/5",
                    }}
                    selectedKeys={[newCar.type]}
                    onSelectionChange={(v) => setNewCar((p) => ({ ...p, type: Array.from(v)[0] as string }))}
                  >
                    {carTypes.map((type) => (
                      <SelectItem key={type}>{type}</SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-5 mt-1">
                  <Input
                    label="Price per Day (IDR)"
                    placeholder="e.g. 500000"
                    type="number"
                    variant="bordered"
                    classNames={INPUT_CLASSES}
                    value={newCar.pricePerDay.toString()}
                    onValueChange={(v) => setNewCar((p) => ({ ...p, pricePerDay: Number(v) }))}
                    description={newCar.pricePerDay > 0 ? `Rp ${Number(newCar.pricePerDay).toLocaleString("id-ID")}` : ""}
                  />
                  <Input
                    label="Number of Seat Rows"
                    placeholder="e.g. 3"
                    type="number"
                    variant="bordered"
                    classNames={INPUT_CLASSES}
                    value={newCar.rows.toString()}
                    onValueChange={(v) => setNewCar((p) => ({ ...p, rows: Number(v) }))}
                  />
                </div>
              </ModalBody>

              <ModalFooter>
                <Button variant="flat" onPress={onClose} className="text-zinc-400 bg-white/5 border border-white/10 flex-1 h-11">
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20 flex-1 h-11"
                  onPress={handleCreate}
                  isLoading={createCar.isPending}
                >
                  Add to Inventory
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
