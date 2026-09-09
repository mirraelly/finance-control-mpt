package com.mpt.financecontrol.email.mapper;

import com.mpt.financecontrol.email.dtos.EmailResponseDto;
import com.mpt.financecontrol.email.entity.Email;

import java.util.List;

public class EmailMapper {

    private EmailMapper() {}

    public static EmailResponseDto toResponseDto(Email email) {
        return new EmailResponseDto(
                email.getId(),
                email.getTipoEmail().getId(),
                email.getTipoEmail().getNome(),
                email.getEmail(),
                email.getObservacao(),
                email.getPrincipal()
        );
    }

    public static List<EmailResponseDto> toResponseDtoList(List<Email> emails) {
        return emails.stream().map(EmailMapper::toResponseDto).toList();
    }
}
