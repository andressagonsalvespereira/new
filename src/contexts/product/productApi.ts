
import { Product, CriarProdutoInput } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import { generateSlug } from './slugUtils';

// Interface para o tipo de dado retornado pelo Supabase
interface LinhaSupabaseProduto {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  url_imagem: string | null;
  digital: boolean;
  slug: string;
  criado_em: string;
  atualizado_em: string;
  usar_processamento_personalizado: boolean | null;
  status_cartao_manual: string | null;
}

// Buscar produtos do Supabase
export const buscarProdutosAPI = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return (data as unknown as LinhaSupabaseProduto[]).map(item => ({
    id: String(item.id),
    nome: item.nome || '',
    descricao: item.descricao || '',
    preco: Number(item.preco),
    urlImagem: item.url_imagem || '',
    digital: item.digital || false,
    slug: item.slug,
    usarProcessamentoPersonalizado: item.usar_processamento_personalizado || false,
    statusCartaoManual: item.status_cartao_manual || null
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
    nome: produto.nome || '',
    descricao: produto.descricao || '',
    preco: Number(produto.preco),
    urlImagem: produto.url_imagem || '',
    digital: produto.digital || false,
    slug: produto.slug,
    usarProcessamentoPersonalizado: produto.usar_processamento_personalizado || false,
    statusCartaoManual: produto.status_cartao_manual || null
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
    nome: produto.nome || '',
    descricao: produto.descricao || '',
    preco: Number(produto.preco),
    urlImagem: produto.url_imagem || '',
    digital: produto.digital || false,
    slug: produto.slug,
    usarProcessamentoPersonalizado: produto.usar_processamento_personalizado || false,
    statusCartaoManual: produto.status_cartao_manual || null
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
    nome: produto.nome || '',
    descricao: produto.descricao || '',
    preco: Number(produto.preco),
    urlImagem: produto.url_imagem || '',
    digital: produto.digital || false,
    slug: produto.slug,
    usarProcessamentoPersonalizado: produto.usar_processamento_personalizado || false,
    statusCartaoManual: produto.status_cartao_manual || null
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
    nome: produto.nome || '',
    descricao: produto.descricao || '',
    preco: Number(produto.preco),
    urlImagem: produto.url_imagem || '',
    digital: produto.digital || false,
    slug: produto.slug,
    usarProcessamentoPersonalizado: produto.usar_processamento_personalizado || false,
    statusCartaoManual: produto.status_cartao_manual || null
  };
};
