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
  Spinner
} from "@nextui-org/react";
import { Search, Filter, Download, MoreVertical, Eye } from "lucide-react";
import { useTransactions, type Transaction } from "../../hooks/useAdmin.ts";

const statusColorMap: Record<string, "success" | "warning" | "danger" | "default" | "primary" | "secondary"> = {
  success: "success",
  pending: "warning",
  failed: "danger",
  "PAID": "success",
  "PENDING": "warning",
};

const TransactionsPage = () => {
  const { data: transactions, isLoading } = useTransactions();

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
        <Button className="bg-[#4267B2] text-white font-bold" startContent={<Download size={18} />}>
          Export CSV
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
        <Input
          placeholder="Search transactions..."
          startContent={<Search className="text-zinc-500" size={18} />}
          className="max-w-md"
          variant="flat"
        />
        <Button variant="flat" startContent={<Filter size={18} />}>Filter</Button>
      </div>

      <Table 
        aria-label="Transactions table"
        className="bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden"
        classNames={{
          base: "max-h-[700px] overflow-scroll",
          table: "min-h-[400px]",
          thead: "bg-zinc-800/50",
          th: "text-zinc-400 font-bold border-b border-white/5 py-4",
          td: "py-4 text-zinc-300",
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
          emptyContent={isLoading ? <Spinner /> : "No transactions found"}
          items={transactions || []}
        >
          {(transaction: Transaction) => (
            <TableRow key={transaction.id} className="hover:bg-white/5 transition-colors">
              <TableCell>
                <User
                  name={getCustomerName(transaction)}
                  description={transaction.email}
                  avatarProps={{
                    src: `https://i.pravatar.cc/150?u=${transaction.id}`,
                    className: "border-2 border-[#4267B2]/30"
                  }}
                  classNames={{
                    name: "text-white font-medium",
                    description: "text-zinc-500"
                  }}
                />
              </TableCell>
              <TableCell className="font-medium text-zinc-200 capitalize">{transaction.serviceType.replace('_', ' ')}</TableCell>
              <TableCell className="text-zinc-400">{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="font-bold text-white">${transaction.totalSales}</TableCell>
              <TableCell>
                <Chip className="capitalize border-none gap-1" color={statusColorMap[transaction.status] || "default"} size="sm" variant="flat">
                  {transaction.status}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="relative flex items-center justify-center gap-2">
                  <Tooltip content="Details">
                    <span className="text-lg text-zinc-400 cursor-pointer active:opacity-50 hover:text-[#00D5FF] transition-colors">
                      <Eye size={18} />
                    </span>
                  </Tooltip>
                  <Tooltip content="Action">
                    <span className="text-lg text-zinc-400 cursor-pointer active:opacity-50 hover:text-white transition-colors">
                      <MoreVertical size={18} />
                    </span>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionsPage;
