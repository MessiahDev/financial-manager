import * as helper from './helper';

Date.prototype.yyyymmdd = function () {
    var mm = this.getUTCMonth() + 1;
    var dd = this.getUTCDate();

    return isNaN(mm) ? '' : [this.getUTCFullYear(),
        (mm > 9 ? '' : '0') + mm,
        (dd > 9 ? '' : '0') + dd
    ].join('-');
};

Date.prototype.ddmmyyyy = function () {
    var mm = this.getUTCMonth() + 1;
    var dd = this.getUTCDate();

    return isNaN(mm) ? '' : [(dd > 9 ? '' : '0') + dd,
        (mm > 9 ? '' : '0') + mm,
        this.getUTCFullYear()
    ].join('/');
};

String.prototype.toDateDDMMYYYY = function () {
    if (!this) {
        return '';
    }
    return helper.DiaMesAno(new Date(helper.TrataDateTime(this)));
};

Number.prototype.toMoeda = function (comCifra = false) {
    var numero = this.toFixed(2).split('.');
    var cifra = comCifra ? "R$ " : "";
    numero[0] = cifra + numero[0].split(/(?=(?:...)*$)/).join('.');
    return numero.join(',');
};

Boolean.prototype.toSimNao = function () {
    return this == false ? 'Não' : 'Sim';
};

String.prototype.normalizado = function () {
    return this.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

String.prototype.cpfCnpjRg = function () {
    let str = this.replace(/[./-]/g, '').split('');

    if (this.length == 14) {
        str.splice(2, 0, '.');
        str.splice(6, 0, '.');
        str.splice(10, 0, '/');
        str.splice(15, 0, '-');
        return str.join('');
    } else if (this.length == 11) {
        str.splice(3, 0, '.');
        str.splice(7, 0, '.');
        str.splice(11, 0, '-');
        return str.join('');
    } else if (this.length == 9) {
        str.splice(2, 0, '.');
        str.splice(6, 0, '.');
        str.splice(10, 0, '-');
        return str.join('');
    } else {
        return `${this}`;
    }
};

String.prototype.toDateTimeDDMMYYYY = function () {
    if (!this) {
        return '';
    }
    return helper.DiaMesAnoHora(new Date(helper.TrataDateTime(this)));
};
