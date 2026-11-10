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
import { useDestinations, useDestinationMutation, type Destination } from "../../hooks/useAdmin";
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

const DEFAULT_FORM = {
  name: "",
  area: "",
  category: "",
  description: "",
  tags: "",
  minStayMinutes: 30,
  travelGapMinutes: 15,
  price: 0,
  photos: "",
};

const DestinationsPage = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const { data: destinations, isLoading } = useDestinations();
  const { createDestination, updateDestination, deleteDestination } = useDestinationMutation();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Destination | null>(null);
  const [formState, setFormState] = useState(DEFAULT_FORM);

  const handleOpenAdd = () => {
    setEditing(null);
    setFormState(DEFAULT_FORM);
    onOpen();
  };

  const handleOpenEdit = (dest: Destination) => {
    setEditing(dest);
    setFormState({
      name: dest.name,
      area: dest.area,
      category: dest.category || "",
      description: dest.description || "",
      tags: (dest.tags || []).join(", "),
      minStayMinutes: dest.minStayMinutes,
      travelGapMinutes: dest.travelGapMinutes,
      price: dest.price,
      photos: (dest.photos || []).join("\n"),
    });
    onOpen();
  };

  const handleDelete = async (id: number) => {
    const result = await confirmDelete("Delete Destination?", "This will remove it from the ItinerQ catalog.");
    if (result.isConfirmed) {
      await deleteDestination.mutateAsync(id);
      toast.success("Destination deleted");
    }
  };

  const handleSubmit = async () => {
    if (!formState.name.trim()) return toast.error("Validation Error", { description: "Name is required." });
    if (!formState.area.trim()) return toast.error("Validation Error", { description: "Area is required." });

    const payload = {
      ...formState,
      tags: formState.tags.split(",").map((t) => t.trim()).filter(Boolean),
      photos: formState.photos.split("\n").map((p) => p.trim()).filter(Boolean),
    };

    try {
      if (editing) {
        await updateDestination.mutateAsync({ id: editing.id, data: payload });
        toast.success("Destination updated");
      } else {
        await createDestination.mutateAsync(payload);
        toast.success("Destination added");
      }
      onClose();
    } catch (err) {
      console.error("Failed to save destination", err);
    }
  };

  const filtered = (destinations || []).filter((d: Destination) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">ItinerQ Destinations</h1>
          <p className="text-muted">Manage the Batam destination catalog travelers drag into their trip.</p>
        </div>
        <Button onPress={handleOpenAdd} variant="shadow" startContent={<Plus size={18} />} className="bg-blue-600 text-white font-bold h-12 px-6 shadow-blue-600/20">
          Add Destination
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
        <span className="text-xs text-muted ml-auto">{filtered.length} destinations</span>
      </div>

      <Card className="bg-surface border border-border shadow-2xl overflow-hidden">
        <CardBody className="p-0">
          <Table
            aria-label="Destination catalog"
            removeWrapper
            classNames={{
              base: "max-h-[700px]",
              table: "min-h-[400px]",
              th: "bg-surface text-muted border-b border-border py-5 uppercase text-xs font-bold tracking-wider",
              td: "py-4 text-foreground border-b border-border last:border-0",
            }}
          >
            <TableHeader>
              <TableColumn>DESTINATION</TableColumn>
              <TableColumn>AREA</TableColumn>
              <TableColumn>STAY / TRAVEL</TableColumn>
              <TableColumn>PRICE</TableColumn>
              <TableColumn align="center">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent={isLoading ? <Spinner color="primary" /> : "No destinations yet"} items={filtered}>
              {(dest: Destination) => (
                <TableRow key={dest.id} className="hover:bg-surface-hover transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground tracking-tight">{dest.name}</span>
                      <span className="text-[11px] text-muted">{dest.category}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" startContent={<MapPin size={12} />} className="bg-surface border border-border text-foreground">
                      {dest.area}
                    </Chip>
                  </TableCell>
                  <TableCell className="text-muted">{dest.minStayMinutes}m stay / {dest.travelGapMinutes}m travel</TableCell>
                  <TableCell>
                    <span className="font-bold text-[#00D5FF]">Rp {Number(dest.price).toLocaleString("id-ID")}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Tooltip content="Edit" showArrow>
                        <Button isIconOnly size="sm" variant="flat" className="bg-surface text-muted hover:text-amber-400 hover:bg-amber-500/10 border border-border" onPress={() => handleOpenEdit(dest)}>
                          <Edit2 size={15} />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Remove" color="danger" showArrow>
                        <Button isIconOnly size="sm" variant="flat" className="bg-red-500/5 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/10" onPress={() => handleDelete(dest.id)} isLoading={deleteDestination.isPending}>
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
                  <h2 className="text-xl font-bold text-foreground">{editing ? "Edit Destination" : "Add Destination"}</h2>
                  <p className="text-sm text-muted font-normal mt-0.5">Shown in the ItinerQ trip builder catalog.</p>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-2 gap-5">
                  <Input label="Name" placeholder="e.g. Nongsa Beach" variant="bordered" classNames={INPUT_CLASSES} value={formState.name} onValueChange={(v) => setFormState((p) => ({ ...p, name: v }))} />
                  <Input label="Area" placeholder="e.g. Nongsa" variant="bordered" classNames={INPUT_CLASSES} value={formState.area} onValueChange={(v) => setFormState((p) => ({ ...p, area: v }))} />
                </div>
                <div className="grid grid-cols-2 gap-5 mt-1">
                  <Input label="Category" placeholder="e.g. Beach" variant="bordered" classNames={INPUT_CLASSES} value={formState.category} onValueChange={(v) => setFormState((p) => ({ ...p, category: v }))} />
                  <Input label="Interest Tags (comma-separated)" placeholder="beach, family, nature" variant="bordered" classNames={INPUT_CLASSES} value={formState.tags} onValueChange={(v) => setFormState((p) => ({ ...p, tags: v }))} />
                </div>
                <div className="grid grid-cols-3 gap-5 mt-1">
                  <Input label="Min Stay (minutes)" type="number" variant="bordered" classNames={INPUT_CLASSES} value={formState.minStayMinutes.toString()} onValueChange={(v) => setFormState((p) => ({ ...p, minStayMinutes: Number(v) }))} />
                  <Input label="Travel Gap (minutes)" type="number" variant="bordered" classNames={INPUT_CLASSES} value={formState.travelGapMinutes.toString()} onValueChange={(v) => setFormState((p) => ({ ...p, travelGapMinutes: Number(v) }))} />
                  <Input
                    label="Price (IDR)"
                    type="number"
                    variant="bordered"
                    classNames={INPUT_CLASSES}
                    value={formState.price.toString()}
                    onValueChange={(v) => setFormState((p) => ({ ...p, price: Number(v) }))}
                    description={formState.price > 0 ? `Rp ${Number(formState.price).toLocaleString("id-ID")}` : ""}
                  />
                </div>
                <Textarea label="Description" variant="bordered" classNames={INPUT_CLASSES} className="mt-1" value={formState.description} onValueChange={(v) => setFormState((p) => ({ ...p, description: v }))} />
                <Textarea label="Photo URLs (one per line)" variant="bordered" classNames={INPUT_CLASSES} className="mt-1" value={formState.photos} onValueChange={(v) => setFormState((p) => ({ ...p, photos: v }))} />
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onCloseModal} className="text-muted bg-surface border border-border flex-1 h-11">Cancel</Button>
                <Button className="bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20 flex-1 h-11" onPress={handleSubmit} isLoading={createDestination.isPending || updateDestination.isPending}>
                  {editing ? "Save Changes" : "Add Destination"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default DestinationsPage;
