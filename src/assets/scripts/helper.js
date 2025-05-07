function TableToExcel(table, worksheet) {
  const uri = 'data:application/vnd.ms-excel;base64,';
  const template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body>{table}</body></html>';
  const base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) };
  const format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) };

  if (!table.nodeType) {
    table = document.getElementById(table).querySelectorAll('div')[0];
  }

  const ctx = { worksheet: worksheet || 'Resultado', table: table.innerHTML };

  window.location.href = uri + base64(format(template, ctx));
}

function MoedaFormatada(n, c, d, t, s, j, i, moneySign) {
  c = isNaN((c = Math.abs(c))) ? 2 : c;
  d = d === undefined ? "," : d;
  t = t === undefined ? "." : t;
  s = n < 0 ? "-" : "";
  i = parseInt((n = Math.abs(+n || 0).toFixed(c))) + "";
  j = (j = i.length) > 3 ? j % 3 : 0;

  return " R$ " + s + (j ? i.substr(0, j) + t : "") +
    i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) +
    (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
}

function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
  let arrData = typeof JSONData !== 'object' ? JSON.parse(JSONData) : JSONData;
  let CSV = '';

  if (ShowLabel) {
    let row = "";
    for (let index in arrData[0]) {
      row += index + ';';
    }
    row = row.slice(0, -1);
    CSV += row + '\r\n';
  }

  for (let i = 0; i < arrData.length; i++) {
    let row = "";
    for (let index in arrData[i]) {
      row += arrData[i][index] + ';';
    }
    CSV += row + '\r\n';
  }

  if (CSV === '') {
    alert("Invalid data");
    return;
  }

  let fileName = "Excel_" + ReportTitle.replace(/ /g, "_");
  let uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

  let link = document.createElement("a");
  link.href = uri;
  link.download = fileName + ".csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function TrataDateTime(data) {
  return data.replace(/-/g, '/').replace('T', ' ');
}

function AnoMesDia(data) {
  const mm = data.getMonth() + 1;
  const dd = data.getDate();

  return isNaN(mm) ? '' : [
    data.getFullYear(),
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd
  ].join('-');
}

function DiaMesAno(data) {
  const mm = data.getMonth() + 1;
  const dd = data.getDate();

  return isNaN(mm) ? '' : [
    (dd > 9 ? '' : '0') + dd,
    (mm > 9 ? '' : '0') + mm,
    data.getFullYear()
  ].join('/');
}

function DiaMesAnoHora(data) {
  const mm = data.getMonth() + 1;
  const dd = data.getDate();

  const novaData = isNaN(mm) ? '' : [
    (dd > 9 ? '' : '0') + dd,
    (mm > 9 ? '' : '0') + mm,
    data.getFullYear()
  ].join('/');

  const novaHora = data.toLocaleTimeString().substring(0, 5);

  return `${novaData} ${novaHora}`;
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
