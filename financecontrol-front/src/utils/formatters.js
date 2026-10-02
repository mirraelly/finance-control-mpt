export function formatarTelefone(value) {
    const numeros = value.replace(/\D/g, "").slice(0, 11);

    if (numeros.length <= 2) {
        return numeros.length ? `(${numeros}` : "";
    }

    if (numeros.length <= 6) {
        return `(${numeros.slice(0, 2)})${numeros.slice(2)}`;
    }

    if (numeros.length <= 10) {
        return `(${numeros.slice(0, 2)})${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    }

    return `(${numeros.slice(0, 2)})${numeros.slice(2, 7)}-${numeros.slice(7)}`;
}

export function formatarCpf(value) {
    const numeros = value.replace(/\D/g, "").slice(0, 11);

    return numeros
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
}

export function formatarCnpj(value) {
    const numeros = value.replace(/\D/g, "").slice(0, 14);

    return numeros
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export function formatarCep(value) {
    const numeros = value.replace(/\D/g, "").slice(0, 8);

    return numeros.replace(/^(\d{5})(\d)/, "$1-$2");
}

export function formatarDocumento(value) {
    if (!value) return "-";

    const numeros = value.replace(/\D/g, "");

    if (numeros.length === 11) return formatarCpf(numeros);
    if (numeros.length === 14) return formatarCnpj(numeros);

    return value;
}

export function somenteDigitos(value) {
    if (!value) return null;

    const numeros = value.replace(/\D/g, "");

    return numeros || null;
}
