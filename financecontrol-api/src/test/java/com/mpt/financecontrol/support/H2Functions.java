package com.mpt.financecontrol.support;

import java.text.Normalizer;

public final class H2Functions {

    private H2Functions() {}

    public static String unaccent(String value) {
        if (value == null) return null;
        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "");
    }
}
