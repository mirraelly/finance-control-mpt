package com.mpt.financecontrol.exceptions;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.util.Date;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApplicationException.class)
    public ResponseEntity<Object> applicationException(ApplicationException e, WebRequest request){

        ErroResponseDto erroResponseDto = new ErroResponseDto();
        erroResponseDto.setErro(e.getMessage());
        erroResponseDto.setCodigo(HttpStatus.BAD_REQUEST.value());
        erroResponseDto.setTimestamp(new Date());
        erroResponseDto.setPath(request.getDescription(true));

        return new ResponseEntity<>(erroResponseDto, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Object> badRequestException(BadRequestException e, WebRequest request){

        ErroResponseDto erroResponseDto = new ErroResponseDto();
        erroResponseDto.setErro(e.getMessage());
        erroResponseDto.setCodigo(HttpStatus.BAD_REQUEST.value());
        erroResponseDto.setTimestamp(new Date());
        erroResponseDto.setPath(request.getDescription(true));

        return new ResponseEntity<>(erroResponseDto, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Object> notFoundException(NotFoundException e, WebRequest request){

        ErroResponseDto erroResponseDto = new ErroResponseDto();
        erroResponseDto.setErro(e.getMessage());
        erroResponseDto.setCodigo(HttpStatus.NOT_FOUND.value());
        erroResponseDto.setTimestamp(new Date());
        erroResponseDto.setPath(request.getDescription(true));

        return new ResponseEntity<>(erroResponseDto, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<Object> conflictException(ConflictException e, WebRequest request){
        ErroResponseDto erroResponseDto = new ErroResponseDto();
        erroResponseDto.setErro(e.getMessage());
        erroResponseDto.setCodigo(HttpStatus.CONFLICT.value());
        erroResponseDto.setTimestamp(new Date());
        erroResponseDto.setPath(request.getDescription(true));

        return new ResponseEntity<>(erroResponseDto, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Object> unauthorizedException(UnauthorizedException e, WebRequest request){

        ErroResponseDto erroResponseDto = new ErroResponseDto();
        erroResponseDto.setErro(e.getMessage());
        erroResponseDto.setCodigo(HttpStatus.UNAUTHORIZED.value());
        erroResponseDto.setTimestamp(new Date());
        erroResponseDto.setPath(request.getDescription(true));

        return new ResponseEntity<>(erroResponseDto, HttpStatus.UNAUTHORIZED);
    }
}
