import React, { useState } from "react";
import "./OrcamentoRefrigeracao.css";
import { gerarPDF } from "./GeradorPDF";

export default function OrcamentoRefrigeracao() {
  const [cliente, setCliente] = useState("");
  const [data, setData] = useState("");
  const [servico, setServico] = useState("");
  const [valor, setValor] = useState("");
  const [servicosDoCliente, setServicosDoCliente] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [modoEdicao, setModoEdicao] = useState(null);
  const [error, setError] = useState("");

  const adicionarServico = () => {
    setError("");

    if (
      !servico ||
      (!valor &&
        servico.toLowerCase() !== "manutenção" &&
        servico.toLowerCase() !== "limpeza")
    ) {
      setError("Preencha o nome do serviço e um valor válido.");
      return;
    }

    let valorFinal = valor;

    if (servico.toLowerCase() === "manutenção") valorFinal = "300.00";
    else if (servico.toLowerCase() === "limpeza") valorFinal = "150.00";
    else valorFinal = parseFloat(valor).toFixed(2);

    setServicosDoCliente([
      ...servicosDoCliente,
      { nome: servico, valor: valorFinal },
    ]);
    setServico("");
    setValor("");
  };

  const finalizarOrcamento = () => {
    setError("");

    if (!cliente || !data || servicosDoCliente.length === 0) {
      setError("Preencha todos os campos antes de finalizar.");
      return;
    }

    const total = servicosDoCliente
      .reduce((soma, s) => soma + parseFloat(s.valor), 0)
      .toFixed(2);

    const novoOrcamento = {
      cliente,
      data,
      servicos: servicosDoCliente,
      total,
    };

    if (modoEdicao !== null) {
      const atualizados = [...orcamentos];
      atualizados[modoEdicao] = novoOrcamento;
      setOrcamentos(atualizados);
      setModoEdicao(null);
    } else {
      setOrcamentos([...orcamentos, novoOrcamento]);
    }

    setCliente("");
    setData("");
    setServicosDoCliente([]);
  };

  const removerOrcamento = (i) => {
    const copia = [...orcamentos];
    copia.splice(i, 1);
    setOrcamentos(copia);
  };

  const editarOrcamento = (i) => {
    const orc = orcamentos[i];
    setCliente(orc.cliente);
    setData(orc.data);
    setServicosDoCliente(orc.servicos);
    setModoEdicao(i);
  };

  const totalParcial = servicosDoCliente
    .reduce((s, s2) => s + parseFloat(s2.valor), 0)
    .toFixed(2);

  return (
    <div className="container">
      <h1 className="titulo">Big Refrigeração - Orçamentos</h1>

      {error && <p className="error">{error}</p>}

      <input
        placeholder="Nome do Cliente"
        value={cliente}
        onChange={(e) => setCliente(e.target.value)}
        className="input"
      />
      <input
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
        className="input"
      />
      <input
        placeholder="Serviço (ex: limpeza)"
        value={servico}
        onChange={(e) => setServico(e.target.value)}
        className="input"
      />
      <input
        type="number"
        step="0.01"
        placeholder="Valor (se outro serviço)"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="input"
      />
      <button onClick={adicionarServico} className="btn">
        Adicionar Serviço
      </button>

      <ul className="lista-servicos">
        {servicosDoCliente.map((s, i) => (
          <li key={i}>{s.nome} - R$ {s.valor}</li>
        ))}
      </ul>

      {servicosDoCliente.length > 0 && (
        <p><strong>Total Parcial:</strong> R$ {totalParcial}</p>
      )}

      <button onClick={finalizarOrcamento} className="btn">
        {modoEdicao !== null ? "Salvar Edição" : "Finalizar Orçamento"}
      </button>

      <hr />

      <h2>Orçamentos Salvos</h2>
      {orcamentos.length === 0 ? (
        <p>Nenhum orçamento ainda.</p>
      ) : (
        <ul>
          {orcamentos.map((orc, i) => (
            <li key={i}>
              <p><strong>Cliente:</strong> {orc.cliente}</p>
              <p><strong>Data:</strong> {orc.data}</p>
              {orc.servicos.map((s, idx) => (
                <p key={idx}>{s.nome} - R$ {s.valor}</p>
              ))}
              <p><strong>Total:</strong> R$ {orc.total}</p>
              <button onClick={() => removerOrcamento(i)}>Excluir</button>
              <button onClick={() => editarOrcamento(i)}>Editar</button>
            </li>
          ))}
        </ul>
      )}

      {orcamentos.length > 0 && (
        <button onClick={() => gerarPDF(orcamentos)} className="btn">
          Gerar PDF
        </button>
      )}
    </div>
  );
}
