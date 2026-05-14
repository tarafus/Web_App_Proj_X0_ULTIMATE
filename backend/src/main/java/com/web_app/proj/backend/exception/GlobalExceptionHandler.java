package com.web_app.proj.backend.exception;

import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Mappe les exceptions métier (RuntimeException) en réponses HTTP propres
 * avec un body JSON { "error": "...message..." } au lieu d'un 500 brut.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(NoSuchElementException e) {
        String msg = e.getMessage() != null ? e.getMessage() : "Ressource introuvable";
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", msg));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArg(IllegalArgumentException e) {
        String msg = e.getMessage() != null ? e.getMessage() : "Argument invalide";
        return ResponseEntity.badRequest().body(Map.of("error", msg));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException e) {
        String msg = e.getMessage() != null ? e.getMessage() : "Erreur interne";
        // Log pour le dev console
        System.err.println("[ExceptionHandler] " + e.getClass().getSimpleName() + ": " + msg);
        return ResponseEntity.badRequest().body(Map.of("error", msg));
    }
}