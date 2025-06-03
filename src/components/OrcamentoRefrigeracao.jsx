import React, { useState } from "react";
import "./OrcamentoRefrigeracao.css";
import { gerarPDF } from "./GeradorPDF";

export default function OrcamentoRefrigeracao() {
  // Estado para armazenar o nome do cliente
  const [cliente, setCliente] = useState("");
  // Estado para armazenar a data selecionada
  const [data, setData] = useState("");
  // Estado para armazenar o nome do serviço que está sendo digitado/editado
  const [servico, setServico] = useState("");
  // Estado para armazenar o valor do serviço digitado/editado
  const [valor, setValor] = useState("");
  // Estado que guarda a lista de serviços anexados ao orçamento atual
  const [servicosDoCliente, setServicosDoCliente] = useState([]);
  // Estado que armazena o índice de edição do serviço (null significa que não estamos editando)
  const [servicoEditIndex, setServicoEditIndex] = useState(null);
  // Estado que guarda todos os orçamentos finalizados
  const [orcamentos, setOrcamentos] = useState([]);
  // Estado que indica o índice de edição do orçamento (null se não estiver editando)
  const [modoEdicao, setModoEdicao] = useState(null);
  // Estado para armazenar uma mensagem de erro (string vazia significa sem erro)
  const [error, setError] = useState("");

  // -------------------------------
  // Função para adicionar ou salvar (editar) um serviço na lista
  // -------------------------------
  const adicionarOuSalvarServico = () => {
    // Limpa mensagem de erro anteriormente exibida
    setError("");

    // Verifica se existem dados mínimos para criar/editar o serviço:
    // - Nome de serviço não pode estar vazio
    // - Se não for “manutenção” nem “limpeza”, o campo valor não pode estar vazio
    if (
      !servico ||
      (!valor &&
        servico.toLowerCase() !== "manutenção" &&
        servico.toLowerCase() !== "limpeza")
    ) {
      setError("Preencha o nome do serviço e um valor válido.");
      return;
    }

    // Determina o valor final (string) do serviço
    let valorFinal = valor;
    if (servico.toLowerCase() === "manutenção") {
      valorFinal = "300.00";
    } else if (servico.toLowerCase() === "limpeza") {
      valorFinal = "150.00";
    } else {
      valorFinal = parseFloat(valor).toFixed(2);
    }

    // Se estiver em modo de edição de serviço (servicoEditIndex != null), substitui
    if (servicoEditIndex !== null) {
      // Faz uma cópia do array atual de serviços
      const copia = [...servicosDoCliente];
      // Substitui o serviço no índice indicado
      copia[servicoEditIndex] = { nome: servico, valor: valorFinal };
      // Atualiza o estado com o array modificado
      setServicosDoCliente(copia);
      // Volta ao estado padrão de não editar nenhum serviço
      setServicoEditIndex(null);
    } else {
      // Senão, adiciona um novo serviço no final da lista
      setServicosDoCliente([
        ...servicosDoCliente,
        { nome: servico, valor: valorFinal },
      ]);
    }

    // Após adicionar ou salvar, limpa os campos pra novo input
    setServico("");
    setValor("");
  };

  // -------------------------------
  // Função para iniciar a edição de um serviço já existente
  // -------------------------------
  const editarServico = (index) => {
    // Pega o serviço que está naquele índice
    const servSelecionado = servicosDoCliente[index];
    // Preenche os campos de input com os dados existentes
    setServico(servSelecionado.nome);
    setValor(servSelecionado.valor);
    // Sinaliza que estamos editando o serviço desse índice
    setServicoEditIndex(index);
  };

  // -------------------------------
  // Função para remover um serviço da lista pelo índice
  // -------------------------------
  const removerServico = (index) => {
    // Cria uma cópia do array de serviços
    const copia = [...servicosDoCliente];
    // Remove o item na posição `index`
    copia.splice(index, 1);
    // Atualiza o estado
    setServicosDoCliente(copia);
    // Se estivéssemos editando esse mesmo índice, cancela a edição
    if (servicoEditIndex === index) {
      setServico("");
      setValor("");
      setServicoEditIndex(null);
    }
  };

  // -------------------------------
  // Função chamada ao clicar em "Finalizar Orçamento" (ou "Salvar Edição" de orçamento)
  // -------------------------------
  const finalizarOrcamento = () => {
    // Limpa possível mensagem de erro anterior
    setError("");

    // Se não houver cliente, data ou ao menos um serviço, exibe erro inline
    if (!cliente || !data || servicosDoCliente.length === 0) {
      setError("Preencha todos os campos antes de finalizar.");
      return;
    }

    // Calcula o total somando todos os valores de servicosDoCliente
    const total = servicosDoCliente
      .reduce((soma, s) => soma + parseFloat(s.valor), 0)
      .toFixed(2);

    // Cria um objeto de novo orçamento
    const novoOrcamento = {
      cliente,
      data,
      servicos: servicosDoCliente,
      total,
    };

    if (modoEdicao !== null) {
      // Se estivermos em modo de edição de orcamento, substitui no array existente
      const atualizados = [...orcamentos];
      atualizados[modoEdicao] = novoOrcamento;
      setOrcamentos(atualizados);
      setModoEdicao(null);
    } else {
      // Senão, adiciona um novo orçamento ao final da lista
      setOrcamentos([...orcamentos, novoOrcamento]);
    }

    // Limpa campos após finalizar o orçamento
    setCliente("");
    setData("");
    setServicosDoCliente([]);
  };

  // -------------------------------
  // Função para remover um orçamento completo pelo índice
  // -------------------------------
  const removerOrcamento = (index) => {
    const copia = [...orcamentos];
    copia.splice(index, 1);
    setOrcamentos(copia);
  };

  // -------------------------------
  // Função para iniciar a edição de um orçamento existente
  // -------------------------------
  const editarOrcamento = (index) => {
    const orc = orcamentos[index];
    setCliente(orc.cliente);
    setData(orc.data);
    setServicosDoCliente(orc.servicos);
    setModoEdicao(index);
  };

  // -------------------------------
  // Cálculo do total parcial (soma dos valores de serviços atualmente adicionados)
  // -------------------------------
  const totalParcial = servicosDoCliente
    .reduce((soma, s) => soma + parseFloat(s.valor), 0)
    .toFixed(2);

  return (
    <div className="container">
      {/* Título principal */}
      <h1 className="titulo">Big Refrigeração - Orçamentos</h1>

      {/* Exibe mensagem de erro (se houver) */}
      {error && <p className="error">{error}</p>}

      {/* Input para nome do cliente */}
      <input
        placeholder="Nome do Cliente"
        value={cliente}                         // valor controlado pelo estado 'cliente'
        onChange={(e) => setCliente(e.target.value)} // atualiza 'cliente' ao digitar
        className="input campo-cliente"
      />

      {/* Input para selecionar a data */}
      <input
        type="date"
        value={data}                           // valor controlado pelo estado 'data'
        onChange={(e) => setData(e.target.value)}     // atualiza 'data' ao selecionar
        className="input campo-data"
      />

      {/* Input para nome do serviço (ou para editar) */}
      <input
        placeholder="Serviço (ex: limpeza)"
        value={servico}                        // valor controlado pelo estado 'servico'
        onChange={(e) => setServico(e.target.value)}   // atualiza 'servico' ao digitar
        className="input campo-servico"
      />

      {/* Input para valor do serviço */}
      <input
        type="number"
        step="0.01"
        placeholder="Valor (se outro serviço)"
        value={valor}                          // valor controlado pelo estado 'valor'
        onChange={(e) => setValor(e.target.value)}     // atualiza 'valor' ao digitar
        className="input campo-valor"
      />

      {/* Botão para adicionar ou salvar (edição) o serviço */}
      <button
        onClick={adicionarOuSalvarServico}     // chama a função que trata adicionação/edição
        className="btn adicionar-servico"
      >
        {servicoEditIndex !== null ? "Salvar Serviço" : "Adicionar Serviço"}
      </button>

      {/* Lista de serviços adicionados (antes de finalizar o orçamento) */}
      <ul className="lista-servicos">
        {servicosDoCliente.map((s, i) => (
          <li key={i} className="item-servico">
            {/* Exibe nome e valor do serviço */}
            {s.nome} - R$ {s.valor}

            {/* Botão para editar este serviço */}
            <button
              onClick={() => editarServico(i)}    // passa o índice para editar
              className="btn btn-editar-servico"
            >
              Editar
            </button>

            {/* Botão para remover este serviço */}
            <button
              onClick={() => removerServico(i)}   // passa o índice para remover
              className="btn btn-remover-servico"
            >
              Remover
            </button>
          </li>
        ))}
      </ul>

      {/* Exibe o total parcial se existirem serviços adicionados */}
      {servicosDoCliente.length > 0 && (
        <p className="total-parcial">
          <strong>Total Parcial:</strong> R$ {totalParcial}
        </p>
      )}

      {/* Botão para finalizar o orçamento (ou salvar edição de orçamento) */}
      <button
        onClick={finalizarOrcamento}            // chama função que trata o orçamento
        className="btn finalizar-orcamento"
      >
        {modoEdicao !== null ? "Salvar Edição" : "Finalizar Orçamento"}
      </button>

      <hr />

      {/* Seção de orçamentos já salvos */}
      <h2 className="subtitulo">Orçamentos Salvos</h2>
      {orcamentos.length === 0 ? (
        // Se não houver nenhum orçamento, exibe mensagem
        <p className="texto-vazio">Nenhum orçamento ainda.</p>
      ) : (
        // Caso haja orçamentos, exibe cada um em uma lista
        <ul className="lista-orcamentos">
          {orcamentos.map((orc, i) => (
            <li key={i} className="item-orcamento">
              <div className="dados-orcamento">
                {/* Exibe dados do cliente e data */}
                <strong>Cliente:</strong> {orc.cliente} <br />
                <strong>Data:</strong> {orc.data} <br />
                {/* Lista cada serviço que pertence a este orçamento */}
                {orc.servicos.map((s, idx) => (
                  <div key={idx} className="servico-listagem">
                    {s.nome} - R$ {s.valor}
                  </div>
                ))}
                {/* Exibe o total do orçamento */}
                <strong>Total:</strong> R$ {orc.total} <br />
              </div>
              <div className="botoes-orcamento">
                {/* Botão para excluir o orçamento inteiro */}
                <button
                  onClick={() => removerOrcamento(i)}
                  className="btn btn-excluir"
                >
                  Excluir
                </button>
                {/* Botão para editar este orçamento */}
                <button
                  onClick={() => editarOrcamento(i)}
                  className="btn btn-editar"
                >
                  Editar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Se existir pelo menos um orçamento salvo, mostra botão para gerar PDF */}
      {orcamentos.length > 0 && (
        <button
          onClick={() => gerarPDF(orcamentos)}
          className="btn gerar-pdf"
        >
          Gerar PDF
        </button>
      )}
    </div>
  );
}
