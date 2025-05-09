function TableToExcel(tableId, worksheet = 'Resultado') {
  const table = document.getElementById(tableId);
  if (!table) {
    console.error(`Elemento da tabela com ID "${tableId}" não encontrado.`);
    return;
  }
  const uri = 'data:application/vnd.ms-excel;base64,';
  const template = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]><xml>
        <x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
        <x:Name>{worksheet}</x:Name>
        <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
        </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook>
        </xml><![endif]-->
        <meta charset="UTF-8"/>
      </head>
      <body>{table}</body>
    </html>`;

  const base64 = s => window.btoa(unescape(encodeURIComponent(s)));
  const format = (s, c) => s.replace(/{(\w+)}/g, (m, p) => c[p]);

  const tableElement = typeof table === 'string'
    ? document.getElementById(table)?.querySelector('table, div')
    : table;

  if (!tableElement) {
    console.warn('Elemento da tabela não encontrado.');
    return;
  }

  const ctx = { worksheet, table: tableElement.outerHTML };
  window.location.href = uri + base64(format(template, ctx));
}

function JSONToCSVConvertor(JSONData, ReportTitle = 'relatorio', ShowLabel = true) {
  const arrData = typeof JSONData !== 'object' ? JSON.parse(JSONData) : JSONData;
  if (!Array.isArray(arrData) || arrData.length === 0) return;

  let CSV = '';
  if (ShowLabel) {
    const headers = Object.keys(arrData[0]).join(';');
    CSV += headers + '\r\n';
  }

  for (const row of arrData) {
    CSV += Object.values(row).join(';') + '\r\n';
  }

  const blob = new Blob([CSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Relatorio_${ReportTitle.replace(/ /g, "_")}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function MoedaFormatada(n, c = 2, d = ",", t = ".") {
  const s = n < 0 ? "-" : "";
  const i = parseInt(Math.abs(n).toFixed(c)) + "";
  const j = i.length > 3 ? i.length % 3 : 0;
  return " R$ " + s +
    (j ? i.substr(0, j) + t : "") +
    i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) +
    (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
}

function TrataDateTime(data) {
  return typeof data === 'string'
    ? data.replace(/-/g, '/').replace('T', ' ')
    : '';
}

function AnoMesDia(data) {
  if (!(data instanceof Date)) return '';
  const mm = data.getMonth() + 1;
  const dd = data.getDate();
  return `${data.getFullYear()}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
}

function DiaMesAno(data) {
  if (!(data instanceof Date)) return '';
  const mm = data.getMonth() + 1;
  const dd = data.getDate();
  return `${String(dd).padStart(2, '0')}/${String(mm).padStart(2, '0')}/${data.getFullYear()}`;
}

function DiaMesAnoHora(data) {
  if (!(data instanceof Date)) return '';
  const dateStr = DiaMesAno(data);
  const timeStr = data.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${dateStr} ${timeStr}`;
}

export {
  MoedaFormatada,
  TableToExcel,
  TrataDateTime,
  AnoMesDia,
  DiaMesAno,
  DiaMesAnoHora,
  JSONToCSVConvertor
};
