interface TimelineEvent {
  id: string;
  status: string;
  timestamp?: string;
  description?: string;
  icon?: string;
}

interface OrderTimelineProps {
  timeline: TimelineEvent[];
}

export default function OrderTimeline({ timeline }: OrderTimelineProps) {
  const getStatusIcon = (status: string) => {
    const iconMap: Record<string, string> = {
      NEW: '📝',
      CONFIRMED: '✅',
      PREPARING: '👨‍🍳',
      READY: '🎉',
      PICKED_UP: '✋',
      ON_DELIVERY: '🚗',
      DELIVERED: '📦',
      COMPLETED: '🏁',
      CANCELLED: '❌',
    };
    return iconMap[status] || '❓';
  };

  const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      NEW: 'Order Created',
      CONFIRMED: 'Confirmed by Kitchen',
      PREPARING: 'Being Prepared',
      READY: 'Ready for Pickup/Delivery',
      PICKED_UP: 'Picked Up',
      ON_DELIVERY: 'On the Way',
      DELIVERED: 'Delivered',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
    };
    return labelMap[status] || status;
  };

  const sortedTimeline = [...timeline].sort(
    (a, b) =>
      new Date(a.timestamp || 0).getTime() -
      new Date(b.timestamp || 0).getTime()
  );

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-200"></div>

      {/* Timeline Events */}
      <div className="space-y-6">
        {sortedTimeline.map((event, index) => (
          <div key={event.id || index} className="relative pl-20">
            {/* Timeline Dot */}
            <div className="absolute -left-1.5 top-1 w-8 h-8 bg-white border-4 border-red-600 rounded-full flex items-center justify-center">
              <span className="text-lg">{getStatusIcon(event.status)}</span>
            </div>

            {/* Event Content */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-900">
                {getStatusLabel(event.status)}
              </h4>

              {event.timestamp && (
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(event.timestamp).toLocaleString('id-ID')}
                </p>
              )}

              {event.description && (
                <p className="text-sm text-gray-700 mt-2">
                  {event.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}