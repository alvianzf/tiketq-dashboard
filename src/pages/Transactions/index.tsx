import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell, 
  User, 
  Chip, 
  Tooltip, 
  Button,
  Input,
  Spinner,
  Card,
  CardBody,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { Search, Download, MoreVertical, Eye, MapPin, Calendar, Users, CreditCard, Hash, Ban, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useTransactions, useTransactionMutation, type Transaction } from "../../hooks/useAdmin";
import { useMemo, useState } from "react";
import { confirmAction } from "../../utils/swal";

const statusColorMap: Record<string, "success" | "warning" | "danger" | "default" | "primary" | "secondary"> = {
  success: "success",
  pending: "warning",
  failed: "danger",
  "PAID": "success",
  "PENDING": "warning",
  "CANCELLED": "danger",
  "REFUNDED": "secondary",
};

const statusLabel = (status: string) => (status === "PENDING" ? "Booked" : status);

const getCustomerName = (transaction: Transaction) => {
  if (transaction.flightBooking) return transaction.flightBooking.name || transaction.email;
  if (transaction.ferryBooking) return transaction.ferryBooking.mobile_number || transaction.email;
  if (transaction.carRentalRequest) return transaction.carRentalRequest.fullName || transaction.email;
  return transaction.email || "Guest";
};

// Ticket already issued blocks cancel/refund for flight/ferry; car rentals are always exempt.
const isTicketIssued = (transaction: Transaction) =>
  transaction.serviceType !== "CAR_RENTAL" &&
  (transaction.flightBooking?.ticketIssued || transaction.ferryBooking?.ticketIssued);

const TransactionsPage = () => {
  const { data: transactions, isLoading } = useTransactions();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [search, setSearch] = useState("");
  const { cancelTransaction, refundTransaction } = useTransactionMutation();

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    const query = search.trim().toLowerCase();
    if (!query) return transactions;
    return transactions.filter((transaction) =>
      [
        getCustomerName(transaction),
        transaction.email,
        transaction.bookingCode,
        `#${transaction.id}`,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(query)),
    );
  }, [transactions, search]);

  const handleQuickView = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    onOpen();
  };

  const handleCancel = async (transaction: Transaction) => {
    const result = await confirmAction(
      "Cancel this booking?",
      `This will cancel transaction ${transaction.bookingCode || `#${transaction.id}`}.`,
      "Yes, cancel it",
    );
    if (!result.isConfirmed) return;
    try {
      await cancelTransaction.mutateAsync(transaction.id);
      toast.success("Transaction cancelled");
    } catch {
      // error toast already shown by the axios interceptor
    }
  };

  const handleRefund = async (transaction: Transaction) => {
    const result = await confirmAction(
      "Refund this booking?",
      `This will mark transaction ${transaction.bookingCode || `#${transaction.id}`} as refunded.`,
      "Yes, refund it",
    );
    if (!result.isConfirmed) return;
    try {
      await refundTransaction.mutateAsync(transaction.id);
      toast.success("Transaction refunded");
    } catch {
      // error toast already shown by the axios interceptor
    }
  };

  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      toast.error("No transactions to export.");
      return;
    }
    const headers = ["Customer", "Email", "Type", "Date", "Amount", "Status"];
    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const rows = filteredTransactions.map((transaction) =>
      [
        getCustomerName(transaction),
        transaction.email || "",
        transaction.serviceType.replace('_', ' '),
        new Date(transaction.createdAt).toLocaleDateString('id-ID'),
        `Rp ${Number(transaction.totalSales).toLocaleString('id-ID')}`,
        statusLabel(transaction.status),
      ]
        .map((field) => escapeCsv(String(field)))
        .join(","),
    );
    const csv = [headers.map(escapeCsv).join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions_report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Export successful! transactions_report.csv has been downloaded.");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-white">Transactions</h1>
          <p className="text-zinc-500">Monitor and manage all customer bookings.</p>
        </div>
        <Button 
          className="bg-[#4267B2] text-white font-bold" 
          startContent={<Download size={18} />}
          onClick={handleExport}
        >
          Export CSV
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-2xl shadow-xl">
        <Input
          placeholder="Search by customer, email or booking code..."
          startContent={<Search className="text-zinc-500" size={18} />}
          className="max-w-md"
          variant="bordered"
          value={search}
          onValueChange={setSearch}
          isClearable
          onClear={() => setSearch("")}
          classNames={{
            input: "text-white",
            inputWrapper: "border-white/5 hover:border-white/10 focus-within:!border-blue-500/50 bg-white/5",
          }}
        />
      </div>

      <Card className="bg-white/5 border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden">
        <CardBody className="p-0">
          <Table 
            aria-label="Transactions table"
            removeWrapper
            classNames={{
              base: "max-h-[700px] overflow-scroll",
              table: "min-h-[400px]",
              th: "bg-white/5 text-zinc-400 font-bold border-b border-white/5 py-5",
              td: "py-4 text-zinc-300 border-b border-white/5",
            }}
          >
            <TableHeader>
              <TableColumn>CUSTOMER</TableColumn>
              <TableColumn>TYPE</TableColumn>
              <TableColumn>DATE</TableColumn>
              <TableColumn>AMOUNT</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn align="center">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody 
              emptyContent={isLoading ? <Spinner color="primary" /> : "No transactions found"}
              items={filteredTransactions}
            >
              {(transaction: Transaction) => (
                <TableRow key={transaction.id} className="hover:bg-white/5 transition-colors group">
                  <TableCell>
                    <User
                      name={getCustomerName(transaction)}
                      description={transaction.email}
                      avatarProps={{
                        src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${transaction.id}&backgroundColor=b6e3f4`,
                        className: "border border-white/10 shadow-lg"
                      }}
                      classNames={{
                        name: "text-white font-semibold",
                        description: "text-zinc-500"
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500/50" />
                      <span className="font-medium text-zinc-200 capitalize">{transaction.serviceType.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-400 text-sm">
                    {new Date(transaction.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="font-bold text-white">Rp {Number(transaction.totalSales).toLocaleString('id-ID')}</TableCell>
                  <TableCell>
                    <Chip
                      className="capitalize border-none px-3 h-7 font-bold text-[10px]"
                      color={statusColorMap[transaction.status] || "default"}
                      size="sm"
                      variant="flat"
                    >
                      {statusLabel(transaction.status)}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="relative flex items-center justify-center gap-3">
                      <Tooltip content="Quick View" showArrow>
                        <button
                          onClick={() => handleQuickView(transaction)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/10 text-zinc-400 hover:text-blue-500 transition-all border border-white/5"
                        >
                          <Eye size={16} />
                        </button>
                      </Tooltip>
                      <Dropdown>
                        <DropdownTrigger>
                          <button className="p-2 rounded-lg bg-white/5 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all border border-white/5">
                            <MoreVertical size={16} />
                          </button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Manage transaction"
                          disabledKeys={
                            isTicketIssued(transaction) || ["CANCELLED", "REFUNDED"].includes(transaction.status)
                              ? ["cancel", "refund"]
                              : []
                          }
                        >
                          <DropdownItem
                            key="cancel"
                            startContent={<Ban size={16} />}
                            description={isTicketIssued(transaction) ? "Ticket already issued" : undefined}
                            onPress={() => handleCancel(transaction)}
                          >
                            Cancel booking
                          </DropdownItem>
                          <DropdownItem
                            key="refund"
                            startContent={<RotateCcw size={16} />}
                            description={isTicketIssued(transaction) ? "Ticket already issued" : undefined}
                            onPress={() => handleRefund(transaction)}
                            color="danger"
                          >
                            Refund booking
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <QuickViewModal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange} 
        transaction={selectedTransaction} 
      />
    </div>
  );
};

const QuickViewModal = ({ 
  isOpen, 
  onOpenChange, 
  transaction 
}: { 
  isOpen: boolean; 
  onOpenChange: () => void; 
  transaction: Transaction | null 
}) => {
  if (!transaction) return null;

  const renderDetails = () => {
    switch (transaction.serviceType) {
      case "FLIGHT":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <p className="text-xs text-zinc-500 mb-1">Origin</p>
                <div className="flex items-center gap-2 text-white font-bold">
                  <MapPin size={14} className="text-blue-400" />
                  {transaction.flightBooking?.origin || "-"}
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <p className="text-xs text-zinc-500 mb-1">Destination</p>
                <div className="flex items-center gap-2 text-white font-bold">
                  <MapPin size={14} className="text-blue-400" />
                  {transaction.flightBooking?.destination || "-"}
                </div>
              </div>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-xs text-zinc-500 mb-2">Passengers ({transaction.flightBooking?.passengers?.length || 0})</p>
              <div className="space-y-2">
                {transaction.flightBooking?.passengers?.map((p: { firstName: string, lastName: string, title: string }, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-white/5 last:border-0">
                    <span className="text-zinc-300">{p.firstName} {p.lastName}</span>
                    <span className="text-zinc-500 text-xs">{p.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "FERRY":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <p className="text-xs text-zinc-500 mb-1">From</p>
                <div className="flex items-center gap-2 text-white font-bold">
                  <MapPin size={14} className="text-blue-400" />
                  {transaction.ferryBooking?.origin?.name || "-"}
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <p className="text-xs text-zinc-500 mb-1">To</p>
                <div className="flex items-center gap-2 text-white font-bold">
                  <MapPin size={14} className="text-blue-400" />
                  {transaction.ferryBooking?.destination?.name || "-"}
                </div>
              </div>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-xs text-zinc-500 mb-2">Passengers ({transaction.ferryBooking?.passengers?.length || 0})</p>
              <div className="space-y-2">
                {transaction.ferryBooking?.passengers?.map((p: { firstName: string, lastName: string, title: string }, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-white/5 last:border-0">
                    <span className="text-zinc-300">{p.firstName} {p.lastName}</span>
                    <span className="text-zinc-500 text-xs">{p.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "CAR_RENTAL":
        return (
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Eye className="text-blue-400" size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold">{transaction.carRentalRequest?.car?.name}</h4>
                  <p className="text-zinc-500 text-xs">{transaction.carRentalRequest?.car?.type} • {transaction.carRentalRequest?.rentalDays} Days</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <p className="text-xs text-zinc-500 mb-1">Rental Date</p>
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Calendar size={14} className="text-blue-400" />
                  {transaction.carRentalRequest?.date}
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <p className="text-xs text-zinc-500 mb-1">Customer</p>
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Users size={14} className="text-blue-400" />
                  {transaction.carRentalRequest?.fullName}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      backdrop="blur"
      size="lg"
      classNames={{
        base: "bg-zinc-900/80 border border-white/10 shadow-2xl backdrop-blur-2xl",
        header: "border-b border-white/5",
        footer: "border-t border-white/5",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <CreditCard size={18} className="text-blue-400" />
            </div>
            <span className="text-white">Transaction Details</span>
          </div>
          <p className="text-xs text-zinc-500 font-normal mt-1">
            Reference: {transaction.bookingCode || `#${transaction.id}`}
          </p>
        </ModalHeader>
        <ModalBody className="py-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Status</p>
              <Chip size="sm" variant="flat" color={statusColorMap[transaction.status] || "default"}>
                {statusLabel(transaction.status)}
              </Chip>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Total Amount</p>
              <p className="text-white font-bold">Rp {Number(transaction.totalSales).toLocaleString('id-ID')}</p>
            </div>
          </div>
          <div className="space-y-1 mb-6">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Service Type</p>
              <div className="flex items-center gap-2">
                <Hash size={14} className="text-zinc-500" />
                <span className="text-zinc-200 capitalize font-medium">{transaction.serviceType.replace('_', ' ')}</span>
              </div>
          </div>

          <div className="border-t border-white/5 pt-6">
             {renderDetails()}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" className="bg-white/5 text-zinc-300 border border-white/10" onPress={onOpenChange}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TransactionsPage;
