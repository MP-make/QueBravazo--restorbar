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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header con botón de regresar */}
      <WaiterHeader tableId={params.table} />

      {/* Layout principal - RESPONSIVO */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Catalog Column - Ocupa todo en móvil, flexible en desktop */}
        <div className="flex-1 overflow-hidden order-2 lg:order-1">
          <WaiterMenu products={products} />
        </div>

        {/* Order Column - Panel lateral en desktop, sticky bottom en móvil */}
        <div className="lg:w-80 xl:w-96 lg:flex-shrink-0 order-1 lg:order-2">
          <div className="lg:h-full">
            <OrderPanel tableId={params.table} />
          </div>
        </div>
      </div>
    </div>
  );
}