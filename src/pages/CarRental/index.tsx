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
import { Plus, Search, Edit2, Trash2, Car as CarIcon, Upload, X, Camera, Check } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useCars, useCarMutation, type Car } from "../../hooks/useAdmin";
import { confirmDelete } from "../../utils/swal";

const carTypes = ["City Car", "Sedan", "SUV", "MPV", "Minibus", "Pick-up", "Double Cabin", "Van"];

const MODAL_CLASSES = {
  base: "bg-zinc-900/80 border border-white/10 shadow-2xl backdrop-blur-2xl",
  header: "border-b border-white/5 px-8 pt-8 pb-6",
  body: "px-8 py-6",
  footer: "border-t border-white/5 px-8 pb-8 pt-6 gap-3",
};

const INPUT_CLASSES = {
  label: "text-zinc-400 font-medium pb-5",
  input: "text-white",
  inputWrapper: "border-white/10 hover:border-white/20 focus-within:!border-blue-500/60 bg-white/5",
};

const CarRentalPage = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const { data: cars, isLoading } = useCars();
  const { createCar, updateCar, deleteCar, uploadPhotos, deletePhoto, deletePhotosBulk } = useCarMutation();
  const [search, setSearch] = useState("");
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [selectedExistingPhotoIds, setSelectedExistingPhotoIds] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formState, setFormState] = useState({
    name: "",
    type: "SUV",
    pricePerDay: 500000,
    rows: 3,
    description: "",
    transmission: "Automatic",
  });

  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const handleOpenAdd = () => {
    setEditingCar(null);
    setFormState({ name: "", type: "SUV", pricePerDay: 500000, rows: 3, description: "", transmission: "Automatic" });
    setSelectedPhotos([]);
    setPhotoPreviews([]);
    onOpen();
  };

  const handleOpenEdit = (car: Car) => {
    setEditingCar(car);
    setFormState({
      name: car.name,
      type: car.type,
      pricePerDay: car.pricePerDay,
      rows: car.rows,
      description: car.description || "",
      transmission: car.transmission || "Automatic",
    });
    setSelectedPhotos([]);
    setPhotoPreviews([]);
    onOpen();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedPhotos(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPhotoPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeSelectedPhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDeletePhoto = async (photoId: number) => {
    const result = await confirmDelete(
      "Delete Photo?",
      "This photo will be permanently removed from the vehicle gallery."
    );
    if (result.isConfirmed) {
      await deletePhoto.mutateAsync(photoId);
      
      // Update local state immediately for instant feedback
      if (editingCar) {
        setEditingCar({
          ...editingCar,
          photos: editingCar.photos?.filter(p => p.id !== photoId) || []
        });
      }
      
      // Remove from selection if it was selected
      setSelectedExistingPhotoIds(prev => prev.filter(id => id !== photoId));
      toast.success("Photo deleted");
    }
  };

  const togglePhotoSelection = (id: number) => {
    setSelectedExistingPhotoIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedExistingPhotoIds.length === 0) return;
    
    const result = await confirmDelete(
      "Delete Selected Photos?",
      `Are you sure you want to delete ${selectedExistingPhotoIds.length} photos? This action cannot be undone.`
    );
    
    if (result.isConfirmed) {
      await deletePhotosBulk.mutateAsync(selectedExistingPhotoIds);
      
      // Update local state immediately for instant feedback
      if (editingCar) {
        setEditingCar({
          ...editingCar,
          photos: editingCar.photos?.filter(p => !selectedExistingPhotoIds.includes(p.id)) || []
        });
      }
      
      toast.success(`${selectedExistingPhotoIds.length} photos deleted`);
      setSelectedExistingPhotoIds([]);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await confirmDelete(
      "Delete Vehicle?",
      "Are you sure you want to delete this vehicle? This action cannot be undone."
    );
    if (result.isConfirmed) {
      await deleteCar.mutateAsync(id);
      toast.success("Vehicle deleted");
    }
  };

  const handleSubmit = async () => {
    if (!formState.name.trim()) return toast.error("Validation Error", { description: "Car Name is required." });
    if (!formState.type) return toast.error("Validation Error", { description: "Car Type is required." });
    if (formState.pricePerDay <= 0) return toast.error("Validation Error", { description: "Price per day must be greater than 0." });
    if (formState.rows <= 0) return toast.error("Validation Error", { description: "Number of rows must be greater than 0." });
    
    try {
      let carId: number;
      if (editingCar) {
        await updateCar.mutateAsync({ id: editingCar.id, data: formState });
        carId = editingCar.id;
        toast.success("Vehicle updated", {
          description: `${formState.name} has been successfully updated.`,
        });
      } else {
        const newCar = await createCar.mutateAsync({ ...formState, available: true });
        carId = newCar.id;
        toast.success("Vehicle added", {
          description: `${formState.name} has been added to your inventory.`,
        });
      }
      
      // Upload photos if any
      if (selectedPhotos.length > 0) {
        await uploadPhotos.mutateAsync({ carId, photos: selectedPhotos });
        toast.success("Photos uploaded successfully");
      }
      
      setFormState({ name: "", type: "SUV", pricePerDay: 500000, rows: 3, description: "", transmission: "Automatic" });
      setSelectedPhotos([]);
      setPhotoPreviews([]);
      onClose();
    } catch (err) {
      console.error("Failed to save car", err);
    }
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
          onPress={handleOpenAdd}
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
                        <Button 
                          isIconOnly size="sm" variant="flat" 
                          className="bg-white/5 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 border border-white/5"
                          onPress={() => handleOpenEdit(car)}
                        >
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
        isDismissable={false}
        isKeyboardDismissDisabled={true}
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
                    <h2 className="text-xl font-bold text-white">{editingCar ? "Edit Vehicle" : "Add New Car"}</h2>
                    <p className="text-sm text-zinc-500 font-normal mt-0.5">{editingCar ? "Update the vehicle information." : "Fill in the vehicle details below."}</p>
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
                    value={formState.name}
                    onValueChange={(v) => setFormState((p) => ({ ...p, name: v }))}
                  />
                  <Select
                    label="Car Type"
                    placeholder="Select type"
                    variant="bordered"
                    classNames={{
                      label: "text-zinc-400 font-medium pb-5",
                      value: "text-white",
                      trigger: "border-white/10 hover:border-white/20 bg-white/5",
                    }}
                    popoverProps={{
                      classNames: {
                        base: "bg-zinc-900 border border-white/10 backdrop-blur-2xl shadow-2xl",
                      }
                    }}
                    listboxProps={{
                      itemClasses: {
                        base: "text-white data-[hover=true]:bg-white/10 data-[selectable=true]:focus:bg-white/10",
                      }
                    }}
                    selectedKeys={formState.type ? [formState.type] : []}
                    onSelectionChange={(v) => setFormState((p) => ({ ...p, type: Array.from(v)[0] as string || p.type }))}
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
                    value={formState.pricePerDay.toString()}
                    onValueChange={(v) => setFormState((p) => ({ ...p, pricePerDay: Number(v) }))}
                    description={formState.pricePerDay > 0 ? `Rp ${Number(formState.pricePerDay).toLocaleString("id-ID")}` : ""}
                  />
                  <Input
                    label="Number of Seat Rows"
                    placeholder="e.g. 3"
                    type="number"
                    variant="bordered"
                    classNames={INPUT_CLASSES}
                    value={formState.rows.toString()}
                    onValueChange={(v) => setFormState((p) => ({ ...p, rows: Number(v) }))}
                  />
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-zinc-400 font-medium text-sm">Vehicle Description</label>
                  <div className="bg-zinc-800/50 rounded-xl border border-white/10 overflow-hidden">
                    <ReactQuill 
                      theme="snow" 
                      value={formState.description} 
                      onChange={(v) => setFormState(p => ({ ...p, description: v }))}
                      className="text-white h-[180px] mb-12"
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera size={18} className="text-blue-400" />
                      <h3 className="text-white font-bold">Vehicle Gallery</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedExistingPhotoIds.length > 0 && (
                        <Button 
                          size="sm" 
                          variant="flat" 
                          color="danger"
                          className="bg-red-500/10 text-red-400"
                          startContent={<Trash2 size={14} />}
                          onPress={handleBulkDelete}
                          isLoading={deletePhotosBulk.isPending}
                        >
                          Delete ({selectedExistingPhotoIds.length})
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="flat" 
                        className="bg-blue-600/10 text-blue-400"
                        startContent={<Upload size={14} />}
                        onPress={() => fileInputRef.current?.click()}
                      >
                        Add Photos
                      </Button>
                    </div>
                    <input 
                      type="file" 
                      multiple 
                      hidden 
                      ref={fileInputRef} 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>

                  {/* Existing Photos */}
                  {editingCar && editingCar.photos && editingCar.photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      {editingCar.photos.map((photo) => {
                        const isSelected = selectedExistingPhotoIds.includes(photo.id);
                        return (
                          <div 
                            key={photo.id} 
                            onClick={() => togglePhotoSelection(photo.id)}
                            className={`relative group aspect-video rounded-xl overflow-hidden border transition-all cursor-pointer ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
                          >
                            <Image src={photo.url} className="object-cover w-full h-full" />
                            {isSelected && (
                              <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center backdrop-blur-[1px]">
                                <div className="bg-blue-500 rounded-full p-1 shadow-lg">
                                  <Check size={14} className="text-white" />
                                </div>
                              </div>
                            )}
                            {!isSelected && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePhoto(photo.id);
                                }}
                                className="absolute top-1 right-1 p-1.5 bg-red-600/90 hover:bg-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 shadow-lg"
                              >
                                <X size={12} className="text-white" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* New Selected Photos */}
                  {photoPreviews.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-500 uppercase font-bold">Newly Selected</p>
                      <div className="grid grid-cols-4 gap-3">
                        {photoPreviews.map((url, i) => (
                          <div key={i} className="relative group aspect-video rounded-xl overflow-hidden border border-blue-500/30 bg-blue-500/5">
                            <Image src={url} className="object-cover w-full h-full" />
                            <button 
                              onClick={() => removeSelectedPhoto(i)}
                              className="absolute top-1 right-1 p-1 bg-zinc-900/80 rounded-lg"
                            >
                              <X size={12} className="text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ModalBody>

              <ModalFooter>
                <Button variant="flat" onPress={onClose} className="text-zinc-400 bg-white/5 border border-white/10 flex-1 h-11">
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20 flex-1 h-11"
                  onPress={handleSubmit}
                  isLoading={createCar.isPending || updateCar.isPending}
                >
                  {editingCar ? "Save Changes" : "Add to Inventory"}
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
