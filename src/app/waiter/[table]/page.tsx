import { fetchProducts } from '@/lib/api/ventify';
import { WaiterMenu } from '@/components/waiter/WaiterMenu';
import { OrderPanel } from '@/components/waiter/OrderPanel';
import { WaiterHeader } from '@/components/waiter/WaiterHeader';

interface PageProps {
  params: {
    table: string;
  };
}

export default async function TablePage({ params }: PageProps) {
  const products = await fetchProducts();

  return (
    <div className="h-screen flex flex-col">
      {/* Header con botón de regresar */}
      <WaiterHeader tableId={params.table} />

      {/* Layout principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Catalog Column - Flexible */}
        <div className="flex-1 overflow-hidden">
          <WaiterMenu products={products} />
        </div>

        {/* Order Column - Fixed Width */}
        <div className="w-80 lg:w-96 flex-shrink-0">
          <OrderPanel tableId={params.table} />
        </div>
      </div>
    </div>
  );
}