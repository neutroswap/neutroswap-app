import TokenLogo from "@/components/elements/TokenLogo";
import Button from "@/components/elements/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/elements/Table";
import { cn, currencyCompactFormat } from "@/shared/utils";
import { allContents } from 'contentlayer/generated'
import { ChevronRight, Plus } from "lucide-react";
import PhaseTags from "./modules/PhaseTags";
import Link from "next/link";

export default function Launchpad() {
  const upcomingLaunch = allContents.filter((item) => (!item.hasEnded))
  const completedProjects = allContents.filter((item) => (!!item.hasEnded))

  return (
    <main className="flex flex-col space-y-12 items-center min-h-[80vh]">
      {upcomingLaunch.length > 0 && (
        <div className="w-full">
          <div className="flex w-full py-2 justify-between items-center">
            <p className="text-xl font-semibold">Upcoming Launch</p>
            <Button size="sm" variant="outline">
              Apply to launch
            </Button>
          </div>

          <div className="grid w-full sm:grid-cols-3 gap-6 mt-2">
            {upcomingLaunch.map((item) => (
              <Link key={item.contract} href={item.url}>
                <div
                  className={cn(
                    "relative flex flex-col w-full border rounded-lg bg-white dark:bg-slate-900/50 shadow-md shadow-slate-200 dark:shadow-black/50 overflow-hidden",
                    "p-2 hover:scale-[101%] hover:shadow-lg hover:shadow-slate-200/70 shadow-slate-200 transition-all"
                  )}>
                  <img src={item.thumbnail} className="w-full h-40 rounded-md" />
                  <div className="p-1">
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-3">
                        <TokenLogo src={item.logo} className="w-8 h-8" />
                        <div>
                          <p className="font-semibold">{item.title}</p>
                          <p className="text-xs font-medium text-muted-foreground">{item.symbol}</p>
                        </div>
                      </div>
                      <PhaseTags data={item} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">{item.description}</p>
                    <div className="flex space-x-4 mt-3">
                      <div className="flex items-center justify-center space-x-1.5">
                        <p className="text-sm mt-4 leading-none">Raising</p>
                        <p className="text-sm text-muted-foreground mt-4 leading-none">{currencyCompactFormat(item.raise.value)} {item.raise.symbol}</p>
                      </div>
                      <div className="flex items-center justify-center space-x-1.5">
                        <p className="text-sm mt-4 leading-none">Max. Cap</p>
                        <p className="text-sm text-muted-foreground mt-4 leading-none">{currencyCompactFormat(item.raise.max)} {item.raise.symbol}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {upcomingLaunch.length < 3 && (
              <div className="flex flex-col w-full items-center justify-center rounded-lg border-[3px] border-dashed">
                <Plus className="w-12 h-12 text-muted-foreground/50" />
                <p className="text-muted-foreground font-medium mt-2">Apply to launch your project here</p>
              </div>
            )}
          </div>
        </div>
      )}

      {completedProjects.length > 0 && (
        <div className="w-full">
          <div className="flex w-full py-2 justify-between items-center">
            <p className="text-xl font-semibold">Funded Projects</p>
          </div>
          <div className={cn(
            "relative flex flex-col w-full mt-2 border rounded-lg bg-white dark:bg-slate-900/50 shadow-lg shadow-slate-200 dark:shadow-black/50 overflow-hidden",
          )}>
            <Table>
              <TableHeader className="border-b">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-80">Project</TableHead>
                  <TableHead>Phase</TableHead>
                  <TableHead>Pool Share</TableHead>
                  <TableHead>Fees APR</TableHead>
                  <TableHead className="text-right w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-slate-50/50 dark:bg-slate-950/50">
                {allContents.map((item) => (
                  <TableRow
                    key={item.contract}
                    className="cursor-pointer group"
                    href={item.url}
                  >
                    <TableCell className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <TokenLogo className="w-6 h-6 ring-2 ring-background" src={item.logo} />
                        <span className="text-left leading-none text-base font-medium">
                          {item.title}
                        </span>
                        <small className="text-muted-foreground leading-none">{item.symbol}</small>
                      </div>
                    </TableCell>
                    <TableCell>
                      <PhaseTags data={item} />
                    </TableCell>
                    <TableCell className="text-left">
                    </TableCell>
                    <TableCell className="text-left">0%</TableCell>
                    <TableCell className="flex justify-end text-right">
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-2 transition" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

    </main>
  )
}
