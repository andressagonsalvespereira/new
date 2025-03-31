import { Produto, CreateProdutoInput } from '@/types/product';
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
export const buscarProdutosAPI = async (): Promise<Produto[]> => {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .order('criado_em', { ascending: false });
  
  if (error) throw error;
  
  return (data as LinhaSupabaseProduto[]).map(item => ({
    id: String(item.id),
    nome: item.nome,
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
export const adicionarProdutoAPI = async (produtoData: CreateProdutoInput): Promise<Produto> => {
  // Gerar um slug baseado no nome do produto
  const slug = await generateSlug(produtoData.nome);
  
  // Transformar os dados do produto para corresponder ao esquema do banco de dados
  const dbProdutoData = {
    nome: produtoData.nome,
    descricao: produtoData.descricao,
    preco: produtoData.preco,
    url_imagem: produtoData.urlImagem,
    digital: produtoData.digital,
    slug: slug,
    usar_processamento_personalizado: produtoData.usarProcessamentoPersonalizado || false,
    status_cartao_manual: produtoData.statusCartaoManual || null
  };
  
  const { data, error } = await supabase
    .from('produtos')
    .insert([dbProdutoData])
    .select()
    .single();
  
  if (error) throw error;
  
  // Converter de volta para o tipo de Produto
  const produto = data as LinhaSupabaseProduto;
  
  return {
    id: String(produto.id),
    nome: produto.nome,
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
export const editarProdutoAPI = async (id: string, produtoData: Partial<Produto>): Promise<Produto> => {
  // Transformar os dados do produto para corresponder ao esquema do banco de dados
  const dbProdutoData: any = {};
  
  if (produtoData.nome !== undefined) {
    dbProdutoData.nome = produtoData.nome;
    // Re-generar slug se o nome mudar
    dbProdutoData.slug = await generateSlug(produtoData.nome);
  }
  if (produtoData.descricao !== undefined) dbProdutoData.descricao = produtoData.descricao;
  if (produtoData.preco !== undefined) dbProdutoData.preco = produtoData.preco;
  if (produtoData.urlImagem !== undefined) dbProdutoData.url_imagem = produtoData.urlImagem;
  if (produtoData.digital !== undefined) dbProdutoData.digital = produtoData.digital;
  if (produtoData.slug !== undefined) dbProdutoData.slug = produtoData.slug;
  if (produtoData.usarProcessamentoPersonalizado !== undefined) dbProdutoData.usar_processamento_personalizado = produtoData.usarProcessamentoPersonalizado;
  if (produtoData.statusCartaoManual !== undefined) dbProdutoData.status_cartao_manual = produtoData.statusCartaoManual;
  
  // Atualizar produto no Supabase
  const { data, error } = await supabase
    .from('produtos')
    .update(dbProdutoData)
    .eq('id', parseInt(id)) // Converter string id para número
    .select()
    .single();
  
  if (error) throw error;
  
  // Converter para o tipo de Produto
  const produto = data as LinhaSupabaseProduto;
  
  return {
    id: String(produto.id),
    nome: produto.nome,
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
    .from('produtos')
    .delete()
    .eq('id', parseInt(id)); // Converter string id para número
  
  if (error) throw error;
};

// Obter produto por ID do Supabase
export const obterProdutoPorIdAPI = async (id: string): Promise<Produto | undefined> => {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('id', parseInt(id)) // Converter string id para número
    .maybeSingle();
  
  if (error) throw error;
  if (!data) return undefined;
  
  // Converter para o tipo de Produto
  const produto = data as LinhaSupabaseProduto;
  
  return {
    id: String(produto.id),
    nome: produto.nome,
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
export const obterProdutoPorSlugAPI = async (slug: string): Promise<Produto | undefined> => {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  
  if (error) throw error;
  if (!data) return undefined;
  
  // Converter para o tipo de Produto
  const produto = data as LinhaSupabaseProduto;
  
  return {
    id: String(produto.id),
    nome: produto.nome,
    descricao: produto.descricao || '',
    preco: Number(produto.preco),
    urlImagem: produto.url_imagem || '',
    digital: produto.digital || false,
    slug: produto.slug,
    usarProcessamentoPersonalizado: produto.usar_processamento_personalizado || false,
    statusCartaoManual: produto.status_cartao_manual || null
  };
};
