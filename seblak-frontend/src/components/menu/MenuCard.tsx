import { MenuItem } from '@/types';
import Image from 'next/image';

interface MenuCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export default function MenuCard({ item, onSelect }: MenuCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      onClick={() => onSelect(item)}
      className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 w-full bg-gray-200">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
            🍜
          </div>
        )}

        {/* Stock Badge */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Sold Out</span>
          </div>
        )}

        {item.stock < 5 && item.stock > 0 && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded text-sm font-semibold">
            Limited Stock ({item.stock})
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {item.name}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item.description}
        </p>

        <div className="flex justify-between items-center">
          <span className="text-red-600 font-bold text-lg">
            {formatPrice(item.price)}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item);
            }}
            disabled={!item.isAvailable}
            className={`px-4 py-2 rounded font-semibold transition ${
              item.isAvailable
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {item.isAvailable ? 'Pesan' : 'Sold Out'}
          </button>
        </div>
      </div>
    </div>
  );
}