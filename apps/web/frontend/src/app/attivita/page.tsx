"use client";

import { Activity, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";

export default function ActivitiesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      try {
        return await api.activities.list({ page: 1, pageSize: 50 });
      } catch {
        return { data: [], pagination: { total: 0, page: 1, pageSize: 50, totalPages: 0 } };
      }
    },
  });

  const activities = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Attività</h1>
          <p className="text-muted-foreground">Timeline completa delle tue attività</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Nuova Attività
        </button>
      </div>

      <div className="stat-card">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 skeleton" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="py-12 text-center">
            <Activity className="mx-auto mb-4 h-12 w-12 opacity-20" />
            <h3 className="mb-2 text-lg font-medium">Nessuna attività</h3>
            <p className="text-sm text-muted-foreground">
              Le tue attività appariranno qui
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity: any) => (
              <div key={activity.id} className="flex items-start gap-3 border-l-2 border-primary pl-4 py-2">
                <div className="flex-1">
                  <h3 className="font-medium">{activity.title}</h3>
                  {activity.description && (
                    <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatRelativeTime(activity.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
