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
  Textarea,
  Spinner,
  Card,
  CardBody,
  Chip,
  Tooltip,
} from "@nextui-org/react";
import { Plus, Search, Edit2, Trash2, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useHotels, useHotelMutation, type Hotel } from "../../hooks/useAdmin";
import { confirmDelete } from "../../utils/swal";

const MODAL_CLASSES = {
  base: "bg-surface/80 border border-border shadow-2xl ",
  header: "border-b border-border px-8 pt-8 pb-6",
  body: "px-8 py-6",
  footer: "border-t border-border px-8 pb-8 pt-6 gap-3",
};

const INPUT_CLASSES = {
  label: "text-muted font-medium pb-5",
  input: "text-foreground",
  inputWrapper: "border-border hover:border-white/20 focus-within:!border-blue-500/60 bg-surface",
};

const DEFAULT_FORM = { name: "", location: "", description: "", pricePerNight: 0, amenities: "", photos: "" };

const HotelsPage = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const { data: hotels, isLoading } = useHotels();
  const { createHotel, updateHotel, deleteHotel } = useHotelMutation();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Hotel | null>(null);
  const [formState, setFormState] = useState(DEFAULT_FORM);

  const handleOpenAdd = () => {
    setEditing(null);
    setFormState(DEFAULT_FORM);
    onOpen();
  };

  const handleOpenEdit = (hotel: Hotel) => {
    setEditing(hotel);
    setFormState({
      name: hotel.name,
      location: hotel.location,
      description: hotel.description || "",
      pricePerNight: hotel.pricePerNight,
      amenities: (hotel.amenities || []).join(", "),
      photos: (hotel.photos || []).join("\n"),
    });
    onOpen();
  };

  const handleDelete = async (id: number) => {
    const result = await confirmDelete("Delete Hotel?", "This will remove it from the concierge catalog.");
    if (result.isConfirmed) {
      await deleteHotel.mutateAsync(id);
      toast.success("Hotel deleted");
    }
  };

  const handleSubmit = async () => {
    if (!formState.name.trim()) return toast.error("Validation Error", { description: "Name is required." });
    if (!formState.location.trim()) return toast.error("Validation Error", { description: "Location is required." });

    const payload = {
      ...formState,
      amenities: formState.amenities.split(",").map((t) => t.trim()).filter(Boolean),
      photos: formState.photos.split("\n").map((p) => p.trim()).filter(Boolean),
    };

    try {
      if (editing) {
        await updateHotel.mutateAsync({ id: editing.id, data: payload });
        toast.success("Hotel updated");
      } else {
        await createHotel.mutateAsync(payload);
        toast.success("Hotel added");
      }
      onClose();
    } catch (err) {
      console.error("Failed to save hotel", err);
    }
  };

  const filtered = (hotels || []).filter((h: Hotel) => h.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Hotel Catalog</h1>
          <p className="text-muted">Manage stays offered through the concierge platform.</p>
        </div>
        <Button onPress={handleOpenAdd} variant="shadow" startContent={<Plus size={18} />} className="bg-blue-600 text-white font-bold h-12 px-6 shadow-blue-600/20">
          Add Hotel
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-surface p-4 rounded-2xl border border-border ">
        <Input
          placeholder="Search by name..."
          value={search}
          onValueChange={setSearch}
          startContent={<Search className="text-muted" size={18} />}
          className="max-w-md"
          variant="bordered"
          classNames={{ input: "text-foreground", inputWrapper: "border-border hover:border-border focus-within:!border-blue-500/50 bg-surface" }}
        />
        <span className="text-xs text-muted ml-auto">{filtered.length} hotels</span>
      </div>

      <Card className="bg-surface border border-border shadow-2xl overflow-hidden">
        <CardBody className="p-0">
          <Table
            aria-label="Hotel catalog"
            removeWrapper
            classNames={{
              base: "max-h-[700px]",
              table: "min-h-[400px]",
              th: "bg-surface text-muted border-b border-border py-2.5 uppercase text-xs font-bold tracking-wider",
              td: "py-2 text-foreground border-b border-border last:border-0",
            }}
          >
            <TableHeader>
              <TableColumn>HOTEL</TableColumn>
              <TableColumn>LOCATION</TableColumn>
              <TableColumn>PRICE / NIGHT</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn align="center">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent={isLoading ? <Spinner color="primary" /> : "No hotels yet"} items={filtered}>
              {(hotel: Hotel) => (
                <TableRow key={hotel.id} className="hover:bg-surface-hover transition-colors">
                  <TableCell>
                    <span className="font-bold text-foreground tracking-tight">{hotel.name}</span>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" startContent={<MapPin size={12} />} className="bg-surface border border-border text-foreground">
                      {hotel.location}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-[#00D5FF]">Rp {Number(hotel.pricePerNight).toLocaleString("id-ID")}</span>
                  </TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${hotel.available ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-zinc-500/10 text-muted border-border"}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${hotel.available ? "bg-green-400 shadow-[0_0_6px_#4ade80]" : "bg-zinc-500"}`} />
                      {hotel.available ? "Available" : "Unavailable"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Tooltip content="Edit" showArrow>
                        <Button isIconOnly size="sm" variant="flat" className="bg-surface text-muted hover:text-amber-400 hover:bg-amber-500/10 border border-border" onPress={() => handleOpenEdit(hotel)}>
                          <Edit2 size={15} />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Remove" color="danger" showArrow>
                        <Button isIconOnly size="sm" variant="flat" className="bg-red-500/5 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/10" onPress={() => handleDelete(hotel.id)} isLoading={deleteHotel.isPending}>
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

      <Modal backdrop="blur" isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false} isKeyboardDismissDisabled classNames={MODAL_CLASSES} size="2xl">
        <ModalContent>
          {(onCloseModal) => (
            <>
              <ModalHeader>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{editing ? "Edit Hotel" : "Add Hotel"}</h2>
                  <p className="text-sm text-muted font-normal mt-0.5">Shown to travelers booking a stay.</p>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-2 gap-5">
                  <Input label="Name" placeholder="e.g. Nongsa Point Marina Resort" variant="bordered" classNames={INPUT_CLASSES} value={formState.name} onValueChange={(v) => setFormState((p) => ({ ...p, name: v }))} />
                  <Input label="Location" placeholder="e.g. Nongsa" variant="bordered" classNames={INPUT_CLASSES} value={formState.location} onValueChange={(v) => setFormState((p) => ({ ...p, location: v }))} />
                </div>
                <div className="grid grid-cols-2 gap-5 mt-1">
                  <Input
                    label="Price per Night (IDR)"
                    type="number"
                    variant="bordered"
                    classNames={INPUT_CLASSES}
                    value={formState.pricePerNight.toString()}
                    onValueChange={(v) => setFormState((p) => ({ ...p, pricePerNight: Number(v) }))}
                    description={formState.pricePerNight > 0 ? `Rp ${Number(formState.pricePerNight).toLocaleString("id-ID")}` : ""}
                  />
                  <Input label="Amenities (comma-separated)" placeholder="pool, breakfast, wifi" variant="bordered" classNames={INPUT_CLASSES} value={formState.amenities} onValueChange={(v) => setFormState((p) => ({ ...p, amenities: v }))} />
                </div>
                <Textarea label="Description" variant="bordered" classNames={INPUT_CLASSES} className="mt-1" value={formState.description} onValueChange={(v) => setFormState((p) => ({ ...p, description: v }))} />
                <Textarea label="Photo URLs (one per line)" variant="bordered" classNames={INPUT_CLASSES} className="mt-1" value={formState.photos} onValueChange={(v) => setFormState((p) => ({ ...p, photos: v }))} />
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onCloseModal} className="text-muted bg-surface border border-border flex-1 h-11">Cancel</Button>
                <Button className="bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20 flex-1 h-11" onPress={handleSubmit} isLoading={createHotel.isPending || updateHotel.isPending}>
                  {editing ? "Save Changes" : "Add Hotel"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default HotelsPage;
