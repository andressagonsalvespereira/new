
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import VisitorStats from '@/components/dashboard/VisitorStats';
import PaymentStats from '@/components/dashboard/PaymentStats';
import VisitorsChart from '@/components/dashboard/VisitorsChart';
import PaymentMethodsChart from '@/components/dashboard/PaymentMethodsChart';

interface DashboardStats {
  productCount: number;
  orderCount: number;
  recentOrders: any[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    productCount: 0,
    orderCount: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        // Get product count
        const { count: productCount, error: productError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        
        if (productError) throw productError;
        
        // Get order count
        const { count: orderCount, error: orderError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });
        
        if (orderError) throw orderError;
        
        // Get recent orders
        const { data: recentOrders, error: recentOrdersError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (recentOrdersError) throw recentOrdersError;
        
        setStats({
          productCount: productCount || 0,
          orderCount: orderCount || 0,
          recentOrders: recentOrders || []
        });
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do dashboard.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, [toast]);

  // Find a product for quick checkout testing
  const testProductId = stats.recentOrders[0]?.product_id || "1";

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        <VisitorStats />
        
        <PaymentStats />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stats Cards */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Produtos Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {loading ? '...' : stats.productCount}
              </p>
            </CardContent>
            <CardFooter>
              <Link to="/admin/products">
                <Button variant="outline">Ver produtos</Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Total de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {loading ? '...' : stats.orderCount}
              </p>
            </CardContent>
            <CardFooter>
              <Link to="/admin/orders">
                <Button variant="outline">Ver pedidos</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <VisitorsChart />
          <PaymentMethodsChart />
        </div>
        
        {/* Test Checkout Buttons */}
        <div className="flex flex-wrap gap-4">
          <Link to="/checkout/test-product">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Testar Checkout
            </Button>
          </Link>
          
          <Link to={`/quick-checkout/${testProductId}`}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Testar Checkout Rápido
            </Button>
          </Link>
        </div>
        
        {/* Recent Orders */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Carregando pedidos recentes...</p>
            ) : stats.recentOrders.length === 0 ? (
              <p className="text-gray-500">Nenhum pedido recente encontrado</p>
            ) : (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="border-b pb-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-gray-500">{order.product_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">R$ {order.price.toFixed(2)}</p>
                        <p className={
                          order.status === 'Pago' 
                            ? 'text-sm text-green-600' 
                            : order.status === 'Recusado' 
                              ? 'text-sm text-red-600' 
                              : 'text-sm text-amber-600'
                        }>
                          {order.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link to="/admin/orders">
              <Button variant="outline">Ver todos os pedidos</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
