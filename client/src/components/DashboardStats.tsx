import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Eye, CheckCircle, Clock, XCircle } from "lucide-react";

export default function DashboardStats() {
  const { data: stats } = trpc.proposals.getStats.useQuery();

  if (!stats) return null;

  const statCards = [
    {
      title: "Total de Propostas",
      value: stats.total,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pendentes",
      value: stats.pending,
      icon: Clock,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
    {
      title: "Visualizadas",
      value: stats.viewed,
      icon: Eye,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Aprovadas",
      value: stats.approved,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Expiradas",
      value: stats.expired,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
