import { useState, useCallback, useEffect } from 'react';
import { useProducts } from '@/contexts/ProductContext';
import { useToast } from '@/hooks/use-toast';
import { Product, CreateProductInput } from '@/types/product';

const estadoInicialFormulario: CreateProductInput = {
  nome: '',
  descricao: '',
  preco: 0,
  urlImagem: '',
  digital: false,
  usarProcessamentoPersonalizado: false,
  statusCartaoManual: 'ANALISE'
};

export const useGerenciamentoProdutos = () => {
  const [dialogoAdicaoAberto, definirDialogoAdicaoAberto] = useState(false);
  const [dialogoEdicaoAberto, definirDialogoEdicaoAberto] = useState(false);
  const [dialogoRemocaoAberto, definirDialogoRemocaoAberto] = useState(false);
  const [produtoEmEdicao, definirProdutoEmEdicao] = useState<Product | null>(null);
  const [produtoParaRemover, definirProdutoParaRemover] = useState<Product | null>(null);
  const [dadosFormulario, definirDadosFormulario] = useState<CreateProductInput>(estadoInicialFormulario);
  
  // Pagination state
  const [paginaAtual, definirPaginaAtual] = useState(1);
  const [tamanhoPagina, definirTamanhoPagina] = useState(5);

  const { toast: exibirNotificacao } = useToast();
  const { 
    addProduct: adicionarProduto, 
    updateProduct: atualizarProduto, 
    deleteProduct: removerProduto, 
    products: produtos, 
    loading: carregando, 
    error: erro,
    refreshProducts: atualizarProdutos,
    isOffline: estaOffline
  } = useProducts();

  // Reset to first page when products change (e.g., after add/delete)
  useEffect(() => {
    definirPaginaAtual(1);
  }, [produtos.length]);

  const redefinirFormulario = useCallback(() => {
    definirDadosFormulario(estadoInicialFormulario);
  }, []);

  const manipularMudancaInput = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name: nome, value: valor } = e.target;
    
    if (nome === 'preco') {
      definirDadosFormulario(prev => ({
        ...prev,
        [nome]: parseFloat(valor) || 0
      }));
    } else {
      definirDadosFormulario(prev => ({
        ...prev,
        [nome]: valor
      }));
    }
  }, []);

  const manipularMudancaSwitch = useCallback((checked: boolean) => {
    definirDadosFormulario(prev => ({
      ...prev,
      digital: checked
    }));
  }, []);

  const manipularMudancaProcessamentoPersonalizado = useCallback((checked: boolean) => {
    definirDadosFormulario(prev => ({
      ...prev,
      usarProcessamentoPersonalizado: checked
    }));
  }, []);

  const manipularMudancaStatusCartaoManual = useCallback((value: string) => {
    definirDadosFormulario(prev => ({
      ...prev,
      statusCartaoManual: value
    }));
  }, []);

  const handleAdicionarProduto = async () => {
    try {
      await adicionarProduto(dadosFormulario);
      redefinirFormulario();
      definirDialogoAdicaoAberto(false);

      exibirNotificacao({
        titulo: "Sucesso",
        descricao: "Produto adicionado com sucesso",
      });
    } catch (erro) {
      console.error('Erro ao adicionar produto:', erro);
      exibirNotificacao({
        titulo: "Erro",
        descricao: "Falha ao adicionar produto",
        variante: "destrutiva",
      });
    }
  };

  const handleEditarClique = useCallback((produto: Product) => {
    definirProdutoEmEdicao(produto);
    definirDadosFormulario({
      nome: produto.name,
      descricao: produto.description || '',
      preco: produto.price,
      urlImagem: produto.imageUrl || '',
      digital: produto.isDigital,
      usarProcessamentoPersonalizado: produto.useCustomProcessing || false,
      statusCartaoManual: produto.manualCardStatus || 'ANALISE'
    });
    definirDialogoEdicaoAberto(true);
  }, []);

  const handleRemoverClique = useCallback((produto: Product) => {
    definirProdutoParaRemover(produto);
    definirDialogoRemocaoAberto(true);
  }, []);

  const handleAtualizarProduto = async () => {
    if (!produtoEmEdicao) return;

    try {
      await atualizarProduto(produtoEmEdicao.id, dadosFormulario);
      definirDialogoEdicaoAberto(false);
      definirProdutoEmEdicao(null);

      exibirNotificacao({
        titulo: "Sucesso",
        descricao: "Produto atualizado com sucesso",
      });
    } catch (erro) {
      console.error('Erro ao atualizar produto:', erro);
      exibirNotificacao({
        titulo: "Erro",
        descricao: "Falha ao atualizar produto",
        variante: "destrutiva",
      });
    }
  };

  const handleRemoverProduto = async () => {
    if (!produtoParaRemover) return;
    
    try {
      await removerProduto(produtoParaRemover.id);
      definirDialogoRemocaoAberto(false);
      definirProdutoParaRemover(null);
      
      exibirNotificacao({
        titulo: "Sucesso",
        descricao: "Produto removido com sucesso",
      });
    } catch (erro) {
      console.error('Erro ao remover produto:', erro);
      exibirNotificacao({
        titulo: "Erro",
        descricao: "Falha ao remover produto",
        variante: "destrutiva",
      });
    }
  };

  const handleMudancaPagina = (pagina: number) => {
    definirPaginaAtual(pagina);
  };

  return {
    isAddDialogOpen: dialogoAdicaoAberto,
    setIsAddDialogOpen: definirDialogoAdicaoAberto,
    isEditDialogOpen: dialogoEdicaoAberto,
    setIsEditDialogOpen: definirDialogoEdicaoAberto,
    isDeleteDialogOpen: dialogoRemocaoAberto,
    setIsDeleteDialogOpen: definirDialogoRemocaoAberto,
    editingProduct: produtoEmEdicao,
    productToDelete: produtoParaRemover,
    formData: dadosFormulario,
    products: produtos,
    loading: carregando,
    error: erro,
    isOffline: estaOffline,
    handleInputChange: manipularMudancaInput,
    handleSwitchChange: manipularMudancaSwitch,
    handleUseCustomProcessingChange: manipularMudancaProcessamentoPersonalizado,
    handleManualCardStatusChange: manipularMudancaStatusCartaoManual,
    handleAddProduct: handleAdicionarProduto,
    handleEditClick: handleEditarClique,
    handleDeleteClick: handleRemoverClique,
    handleUpdateProduct: handleAtualizarProduto,
    handleDeleteProduct: handleRemoverProduto,
    refreshProducts: atualizarProdutos,
    resetForm: redefinirFormulario,
    // Pagination
    currentPage: paginaAtual,
    pageSize: tamanhoPagina,
    handlePageChange: handleMudancaPagina
  };
};
