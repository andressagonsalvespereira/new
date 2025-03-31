
import { Product, CriarProdutoInput } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import { generateSlug } from './slugUtils';

// Interface para o tipo de dado retornado pelo Supabase
interface LinhaSupabaseProduto {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_digital: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
  use_custom_processing: boolean | null;
  manual_card_status: string | null;
}

// Buscar produtos do Supabase
export const buscarProdutosAPI = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  console.log('Dados brutos do Supabase:', data);
  
  return (data as unknown as LinhaSupabaseProduto[]).map(item => ({
    id: String(item.id),
    nome: item.name || '',
    descricao: item.description || '',
    preco: Number(item.price),
    urlImagem: item.image_url || '',
    digital: item.is_digital || false,
    slug: item.slug,
    usarProcessamentoPersonalizado: item.use_custom_processing || false,
    statusCartaoManual: item.manual_card_status || null
  }));
};

// Adicionar produto ao Supabase
export const adicionarProdutoAPI = async (produtoData: CriarProdutoInput): Promise<Product> => {
  // Gerar um slug baseado no nome do produto
  const slug = await generateSlug(produtoData.nome);
  
  // Transformar os dados do produto para corresponder ao esquema do banco de dados
  const dbProdutoData = {
    name: produtoData.nome,
    description: produtoData.descricao,
    price: produtoData.preco,
    image_url: produtoData.urlImagem,
    is_digital: produtoData.digital,
    slug: slug,
    use_custom_processing: produtoData.usarProcessamentoPersonalizado || false,
    manual_card_status: produtoData.statusCartaoManual || null
  };
  
  const { data, error } = await supabase
    .from('products')
    .insert([dbProdutoData])
    .select()
    .single();
  
  if (error) throw error;
  
  // Converter de volta para o tipo de Produto
  const produto = data as unknown as LinhaSupabaseProduto;
  
  return {
    id: String(produto.id),
    nome: produto.name || '',
    descricao: produto.description || '',
    preco: Number(produto.price),
    urlImagem: produto.image_url || '',
    digital: produto.is_digital || false,
    slug: produto.slug,
    usarProcessamentoPersonalizado: produto.use_custom_processing || false,
    statusCartaoManual: produto.manual_card_status || null
  };
};

// Editar produto no Supabase
export const editarProdutoAPI = async (id: string, produtoData: Partial<Product>): Promise<Product> => {
  // Transformar os dados do produto para corresponder ao esquema do banco de dados
  const dbProdutoData: any = {};
  
  if (produtoData.nome !== undefined) {
    dbProdutoData.name = produtoData.nome;
    // Re-generar slug se o nome mudar
    dbProdutoData.slug = await generateSlug(produtoData.nome);
  }
  if (produtoData.descricao !== undefined) dbProdutoData.description = produtoData.descricao;
  if (produtoData.preco !== undefined) dbProdutoData.price = produtoData.preco;
  if (produtoData.urlImagem !== undefined) dbProdutoData.image_url = produtoData.urlImagem;
  if (produtoData.digital !== undefined) dbProdutoData.is_digital = produtoData.digital;
  if (produtoData.slug !== undefined) dbProdutoData.slug = produtoData.slug;
  if (produtoData.usarProcessamentoPersonalizado !== undefined) dbProdutoData.use_custom_processing = produtoData.usarProcessamentoPersonalizado;
  if (produtoData.statusCartaoManual !== undefined) dbProdutoData.manual_card_status = produtoData.statusCartaoManual;
  
  // Atualizar produto no Supabase
  const { data, error } = await supabase
    .from('products')
    .update(dbProdutoData)
    .eq('id', parseInt(id)) // Converter string id para número
    .select()
    .single();
  
  if (error) throw error;
  
  // Converter para o tipo de Produto
  const produto = data as unknown as LinhaSupabaseProduto;
  
  return {
    id: String(produto.id),
    nome: produto.name || '',
    descricao: produto.description || '',
    preco: Number(produto.price),
    urlImagem: produto.image_url || '',
    digital: produto.is_digital || false,
    slug: produto.slug,
    usarProcessamentoPersonalizado: produto.use_custom_processing || false,
    statusCartaoManual: produto.manual_card_status || null
  };
};

// Remover produto do Supabase
export const removerProdutoAPI = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', parseInt(id)); // Converter string id para número
  
  if (error) throw error;
};

// Obter produto por ID do Supabase
export const obterProdutoPorIdAPI = async (id: string): Promise<Product | undefined> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', parseInt(id)) // Converter string id para número
    .maybeSingle();
  
  if (error) throw error;
  if (!data) return undefined;
  
  // Converter para o tipo de Produto
  const produto = data as unknown as LinhaSupabaseProduto;
  
  return {
    id: String(produto.id),
    nome: produto.name || '',
    descricao: produto.description || '',
    preco: Number(produto.price),
    urlImagem: produto.image_url || '',
    digital: produto.is_digital || false,
    slug: produto.slug,
    usarProcessamentoPersonalizado: produto.use_custom_processing || false,
    statusCartaoManual: produto.manual_card_status || null
  };
};

// Obter produto por slug do Supabase
export const obterProdutoPorSlugAPI = async (slug: string): Promise<Product | undefined> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  
  if (error) throw error;
  if (!data) return undefined;
  
  // Converter para o tipo de Produto
  const produto = data as unknown as LinhaSupabaseProduto;
  
  return {
    id: String(produto.id),
    nome: produto.name || '',
    descricao: produto.description || '',
    preco: Number(produto.price),
    urlImagem: produto.image_url || '',
    digital: produto.is_digital || false,
    slug: produto.slug,
    usarProcessamentoPersonalizado: produto.use_custom_processing || false,
    statusCartaoManual: produto.manual_card_status || null
  };
};
