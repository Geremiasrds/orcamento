import { jsPDF } from "jspdf";

export function gerarPDF(orcamentos) {
  try {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Big Refrigeração - Orçamentos", 20, 20);
    doc.setFontSize(12);

    let y = 40;

    orcamentos.forEach((orcamento, index) => {
      doc.text(`Cliente: ${orcamento.cliente}`, 20, y);
      doc.text(`Data: ${formatarData(orcamento.data)}`, 20, y + 10);

      orcamento.servicos.forEach((servico, i) => {
        doc.text(
          `Serviço ${i + 1}: ${servico.nome} - R$ ${servico.valor}`,
          20,
          y + 20 + i * 10
        );
      });

      doc.text(
        `Total: R$ ${orcamento.total}`,
        20,
        y + 30 + orcamento.servicos.length * 10
      );

      y += 50 + orcamento.servicos.length * 10;

      // Evita ultrapassar a página
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("orcamento_big_refrigeracao.pdf");
  } catch (e) {
    console.error("Erro ao gerar PDF:", e);
  }
}

function formatarData(dataStr) {
  const [ano, mes, dia] = dataStr.split("-");
  return `${dia}/${mes}/${ano}`;
}
