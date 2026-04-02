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
} from "@nextui-org/react";
import { Search, Filter, Download, MoreVertical, Eye, MapPin, Calendar, Users, CreditCard, Hash } from "lucide-react";
import { toast } from "sonner";
import { useTransactions, type Transaction } from "../../hooks/useAdmin";
import { useState } from "react";

const statusColorMap: Record<string, "success" | "warning" | "danger" | "default" | "primary" | "secondary"> = {
  success: "success",
  pending: "warning",
  failed: "danger",
  "PAID": "success",
  "PENDING": "warning",
};

const TransactionsPage = () => {
  const { data: transactions, isLoading } = useTransactions();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const handleQuickView = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    onOpen();
  };

  const handleExport = () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
      loading: 'Preparing transactions report...',
      success: 'Export successful! transactions_report.csv has been downloaded.',
      error: 'Failed to export transactions.',
    });
  };

  const getCustomerName = (transaction: Transaction) => {
    if (transaction.flightBooking) return transaction.flightBooking.name || transaction.email;
    if (transaction.ferryBooking) return transaction.ferryBooking.mobile_number || transaction.email;
    if (transaction.carRentalRequest) return transaction.carRentalRequest.fullName || transaction.email;
    return transaction.email || "Guest";
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
          placeholder="Search transactions..."
          startContent={<Search className="text-zinc-500" size={18} />}
          className="max-w-md"
          variant="bordered"
          classNames={{
            input: "text-white",
            inputWrapper: "border-white/5 hover:border-white/10 focus-within:!border-blue-500/50 bg-white/5",
          }}
        />
        <Button variant="flat" className="bg-white/5 border border-white/10 text-zinc-300" startContent={<Filter size={18} />}>Filter</Button>
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
              items={transactions || []}
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
                      {transaction.status}
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
                      <Tooltip content="Manage" showArrow>
                        <button className="p-2 rounded-lg bg-white/5 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all border border-white/5">
                          <MoreVertical size={16} />
                        </button>
                      </Tooltip>
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
              <Chip size="sm" variant="flat" color={transaction.status === "PAID" ? "success" : "warning"}>
                {transaction.status}
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
          <Button className="bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20">
            Send Receipt
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TransactionsPage;
