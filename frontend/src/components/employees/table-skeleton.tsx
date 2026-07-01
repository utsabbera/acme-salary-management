import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SKELETON_ROWS = Array.from({ length: 20 }, (_, i) => i + 1);

export function TableSkeleton() {
  return (
    <div className="rounded-md border overflow-x-auto w-full">
      <Table className="min-w-[800px]">
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="text-xs uppercase tracking-wider font-semibold">Name</TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-semibold">Email</TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-semibold">
              Department
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wider font-semibold">
              Country
            </TableHead>
            <TableHead className="text-right text-xs uppercase tracking-wider font-semibold">
              Current Compensation
            </TableHead>
            <TableHead className="text-right text-xs uppercase tracking-wider font-semibold">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {SKELETON_ROWS.map((id) => (
            <TableRow key={id} className="hover:bg-transparent">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end">
                  <Skeleton className="h-4 w-24" />
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end">
                  <Skeleton className="h-8 w-8" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
