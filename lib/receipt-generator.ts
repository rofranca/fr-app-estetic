import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const generateReceipt = (sale: any) => {
    const doc = new jsPDF();

    // Config
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("RECIBO DE VENDA", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Sua Clínica Estética", pageWidth / 2, 28, { align: "center" });
    doc.text("Rua Exemplo, 123 - Cidade/UF", pageWidth / 2, 33, { align: "center" });
    doc.text("CNPJ: 00.000.000/0000-00", pageWidth / 2, 38, { align: "center" });

    // Sale Info
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Recibo #${sale.id.substr(0, 8).toUpperCase()}`, 14, 50);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Data: ${format(new Date(sale.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, 14, 56);
    doc.text(`Cliente: ${sale.client.name}`, 14, 62);
    if (sale.client.phone) doc.text(`Telefone: ${sale.client.phone}`, 14, 68);

    // Items Table
    const tableColumn = ["Item / Serviço", "Qtd", "Valor Unit.", "Total"];
    const tableRows = sale.items.map((item: any) => [
        item.service.name,
        item.quantity,
        `R$ ${Number(item.pricePerSession).toFixed(2)}`,
        `R$ ${Number(item.totalPrice).toFixed(2)}`
    ]);

    autoTable(doc, {
        startY: 75,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 3 },
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY || 75;

    let currentY = finalY + 10;

    // Subtotal (recalculated roughly as Total + Discount)
    const discountVal = Number(sale.discount || 0);
    const totalVal = Number(sale.totalAmount);
    const subtotalVal = totalVal + discountVal;

    doc.setFontSize(10);
    doc.text(`Subtotal:`, 140, currentY);
    doc.text(`R$ ${subtotalVal.toFixed(2)}`, 190, currentY, { align: "right" });

    if (discountVal > 0) {
        currentY += 6;
        doc.setTextColor(220, 53, 69);
        doc.text(`Desconto:`, 140, currentY);
        doc.text(`- R$ ${discountVal.toFixed(2)}`, 190, currentY, { align: "right" });
        doc.setTextColor(0, 0, 0);
    }

    currentY += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL:`, 140, currentY);
    doc.text(`R$ ${totalVal.toFixed(2)}`, 190, currentY, { align: "right" });

    // Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Obrigado pela preferência!", pageWidth / 2, pageHeight - 20, { align: "center" });

    doc.save(`recibo_${sale.id.substr(0, 8)}.pdf`);
};
