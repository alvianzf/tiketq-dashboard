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
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActivities, useActivityMutation, type Activity } from "../../hooks/useAdmin";
import { confirmDelete } from "../../utils/swal";

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

const DEFAULT_FORM = { name: "", category: "", location: "", description: "", price: 0, duration: "", photos: "" };

const ActivitiesPage = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const { data: activities, isLoading } = useActivities();
  const { createActivity, updateActivity, deleteActivity } = useActivityMutation();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Activity | null>(null);
  const [formState, setFormState] = useState(DEFAULT_FORM);

  const handleOpenAdd = () => {
    setEditing(null);
    setFormState(DEFAULT_FORM);
    onOpen();
  };

  const handleOpenEdit = (activity: Activity) => {
    setEditing(activity);
    setFormState({
      name: activity.name,
      category: activity.category,
      location: activity.location || "",
      description: activity.description || "",
      price: activity.price,
      duration: activity.duration || "",
      photos: (activity.photos || []).join("\n"),
    });
    onOpen();
  };

  const handleDelete = async (id: number) => {
    const result = await confirmDelete("Delete Activity?", "This will remove it from the concierge catalog.");
    if (result.isConfirmed) {
      await deleteActivity.mutateAsync(id);
      toast.success("Activity deleted");
    }
  };

  const handleSubmit = async () => {
    if (!formState.name.trim()) return toast.error("Validation Error", { description: "Name is required." });
    if (!formState.category.trim()) return toast.error("Validation Error", { description: "Category is required." });

    const payload = {
      ...formState,
      photos: formState.photos.split("\n").map((p) => p.trim()).filter(Boolean),
    };

    try {
      if (editing) {
        await updateActivity.mutateAsync({ id: editing.id, data: payload });
        toast.success("Activity updated");
      } else {
        await createActivity.mutateAsync(payload);
        toast.success("Activity added");
      }
      onClose();
    } catch (err) {
      console.error("Failed to save activity", err);
    }
  };

  const filtered = (activities || []).filter((a: Activity) => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">Activities Catalog</h1>
          <p className="text-zinc-500">Manage tours and experiences (golf, diving, island hopping, etc).</p>
        </div>
        <Button onPress={handleOpenAdd} variant="shadow" startContent={<Plus size={18} />} className="bg-blue-600 text-white font-bold h-12 px-6 shadow-blue-600/20">
          Add Activity
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-2xl">
        <Input
          placeholder="Search by name..."
          value={search}
          onValueChange={setSearch}
          startContent={<Search className="text-zinc-500" size={18} />}
          className="max-w-md"
          variant="bordered"
          classNames={{ input: "text-white", inputWrapper: "border-white/5 hover:border-white/10 focus-within:!border-blue-500/50 bg-white/5" }}
        />
        <span className="text-xs text-zinc-600 ml-auto">{filtered.length} activities</span>
      </div>

      <Card className="bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden">
        <CardBody className="p-0">
          <Table
            aria-label="Activities catalog"
            removeWrapper
            classNames={{
              base: "max-h-[700px]",
              table: "min-h-[400px]",
              th: "bg-white/5 text-zinc-400 border-b border-white/5 py-5 uppercase text-xs font-bold tracking-wider",
              td: "py-4 text-zinc-300 border-b border-white/5 last:border-0",
            }}
          >
            <TableHeader>
              <TableColumn>ACTIVITY</TableColumn>
              <TableColumn>CATEGORY</TableColumn>
              <TableColumn>DURATION</TableColumn>
              <TableColumn>PRICE</TableColumn>
              <TableColumn align="center">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent={isLoading ? <Spinner color="primary" /> : "No activities yet"} items={filtered}>
              {(activity: Activity) => (
                <TableRow key={activity.id} className="hover:bg-white/5 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-white tracking-tight">{activity.name}</span>
                      <span className="text-[11px] text-zinc-600">{activity.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" className="bg-white/5 border border-white/10 text-zinc-300">
                      {activity.category}
                    </Chip>
                  </TableCell>
                  <TableCell className="text-zinc-400">{activity.duration || "-"}</TableCell>
                  <TableCell>
                    <span className="font-bold text-[#00D5FF]">Rp {Number(activity.price).toLocaleString("id-ID")}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Tooltip content="Edit" showArrow>
                        <Button isIconOnly size="sm" variant="flat" className="bg-white/5 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 border border-white/5" onPress={() => handleOpenEdit(activity)}>
                          <Edit2 size={15} />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Remove" color="danger" showArrow>
                        <Button isIconOnly size="sm" variant="flat" className="bg-red-500/5 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/10" onPress={() => handleDelete(activity.id)} isLoading={deleteActivity.isPending}>
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
                  <h2 className="text-xl font-bold text-white">{editing ? "Edit Activity" : "Add Activity"}</h2>
                  <p className="text-sm text-zinc-500 font-normal mt-0.5">Shown to travelers browsing experiences.</p>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-2 gap-5">
                  <Input label="Name" placeholder="e.g. Sunset Island Hopping" variant="bordered" classNames={INPUT_CLASSES} value={formState.name} onValueChange={(v) => setFormState((p) => ({ ...p, name: v }))} />
                  <Input label="Category" placeholder="e.g. Golf, Diving, Tour" variant="bordered" classNames={INPUT_CLASSES} value={formState.category} onValueChange={(v) => setFormState((p) => ({ ...p, category: v }))} />
                </div>
                <div className="grid grid-cols-3 gap-5 mt-1">
                  <Input label="Location" placeholder="e.g. Barelang" variant="bordered" classNames={INPUT_CLASSES} value={formState.location} onValueChange={(v) => setFormState((p) => ({ ...p, location: v }))} />
                  <Input label="Duration" placeholder="e.g. 3 hours" variant="bordered" classNames={INPUT_CLASSES} value={formState.duration} onValueChange={(v) => setFormState((p) => ({ ...p, duration: v }))} />
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
                <Button variant="flat" onPress={onCloseModal} className="text-zinc-400 bg-white/5 border border-white/10 flex-1 h-11">Cancel</Button>
                <Button className="bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20 flex-1 h-11" onPress={handleSubmit} isLoading={createActivity.isPending || updateActivity.isPending}>
                  {editing ? "Save Changes" : "Add Activity"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ActivitiesPage;
