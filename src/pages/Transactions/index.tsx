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
  CardBody
} from "@nextui-org/react";
import { Search, Filter, Download, MoreVertical, Eye } from "lucide-react";
import { useTransactions, type Transaction } from "../../hooks/useAdmin";

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
                        <button className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/10 text-zinc-400 hover:text-blue-500 transition-all border border-white/5">
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
    </div>
  );
};

export default TransactionsPage;
